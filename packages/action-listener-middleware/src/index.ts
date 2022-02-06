import type {
  Middleware,
  Dispatch,
  AnyAction,
  Action,
  ThunkDispatch,
  MiddlewareAPI,
} from '@reduxjs/toolkit'
import { createAction, nanoid } from '@reduxjs/toolkit'

import type {
  ActionListenerMiddleware,
  AddListenerOverloads,
  AnyActionListenerPredicate,
  CreateListenerMiddlewareOptions,
  TypedActionCreator,
  TypedAddListener,
  TypedAddListenerAction,
  TypedCreateListenerEntry,
  FallbackAddListenerOptions,
  ListenerEntry,
  ListenerErrorHandler,
  Unsubscribe,
  WithMiddlewareType,
  TakePattern,
  ListenerErrorInfo,
  ForkedTaskExecutor,
  ForkedTask,
  TypedRemoveListenerAction,
  TypedRemoveListener,
} from './types'
import { assertFunction, catchRejection } from './utils'
import { TaskAbortError } from './exceptions'
import {
  runTask,
  promisifyAbortSignal,
  validateActive,
  createPause,
  createDelay,
} from './task'
export { TaskAbortError } from './exceptions'
export type {
  ActionListener,
  ActionListenerMiddleware,
  ActionListenerMiddlewareAPI,
  ActionListenerOptions,
  CreateListenerMiddlewareOptions,
  ListenerErrorHandler,
  TypedAddListener,
  TypedAddListenerAction,
  TypedRemoveListener,
  TypedRemoveListenerAction,
  Unsubscribe,
  ForkedTaskExecutor,
  ForkedTask,
  ForkedTaskAPI,
  AsyncTaskExecutor,
  SyncTaskExecutor,
  TaskCancelled,
  TaskRejected,
  TaskResolved,
  TaskResult,
} from './types'

//Overly-aggressive byte-shaving
const { assign } = Object
/**
 * @internal
 */
const INTERNAL_NIL_TOKEN = {} as const

const alm = 'actionListenerMiddleware' as const

const createFork = (parentAbortSignal: AbortSignal) => {
  return <T>(taskExecutor: ForkedTaskExecutor<T>): ForkedTask<T> => {
    assertFunction(taskExecutor, 'taskExecutor')
    const childAbortController = new AbortController()
    const cancel = () => {
      childAbortController.abort()
    }

    const result = runTask<T>(async (): Promise<T> => {
      validateActive(parentAbortSignal)
      validateActive(childAbortController.signal)
      const result = (await taskExecutor({
        pause: createPause(childAbortController.signal),
        delay: createDelay(childAbortController.signal),
        signal: childAbortController.signal,
      })) as T
      validateActive(parentAbortSignal)
      validateActive(childAbortController.signal)
      return result
    }, cancel)

    return {
      result,
      cancel,
    }
  }
}

const createTakePattern = <S>(
  addListener: AddListenerOverloads<Unsubscribe, S, Dispatch<AnyAction>>,
  signal: AbortSignal
): TakePattern<S> => {
  /**
   * A function that takes an ActionListenerPredicate and an optional timeout,
   * and resolves when either the predicate returns `true` based on an action
   * state combination or when the timeout expires.
   * If the parent listener is canceled while waiting, this will throw a
   * TaskAbortError.
   */
  const take = async <P extends AnyActionListenerPredicate<S>>(
    predicate: P,
    timeout: number | undefined
  ) => {
    validateActive(signal)

    // Placeholder unsubscribe function until the listener is added
    let unsubscribe: Unsubscribe = () => {}

    const tuplePromise = new Promise<[AnyAction, S, S]>((resolve) => {
      // Inside the Promise, we synchronously add the listener.
      unsubscribe = addListener({
        predicate: predicate as any,
        listener: (action, listenerApi): void => {
          // One-shot listener that cleans up as soon as the predicate passes
          listenerApi.unsubscribe()
          // Resolve the promise with the same arguments the predicate saw
          resolve([
            action,
            listenerApi.getState(),
            listenerApi.getOriginalState(),
          ])
        },
      })
    })

    const promises: (Promise<null> | Promise<[AnyAction, S, S]>)[] = [
      promisifyAbortSignal(signal),
      tuplePromise,
    ]

    if (timeout != null) {
      promises.push(
        new Promise<null>((resolve) => setTimeout(resolve, timeout, null))
      )
    }

    try {
      const output = await Promise.race(promises)

      validateActive(signal)
      return output
    } finally {
      // Always clean up the listener
      unsubscribe()
    }
  }

  return ((
    predicate: AnyActionListenerPredicate<S>,
    timeout: number | undefined
  ) => catchRejection(take(predicate, timeout))) as TakePattern<S>
}

const getListenerEntryPropsFrom = (options: FallbackAddListenerOptions) => {
  let { type, actionCreator, matcher, predicate, listener } = options

  if (type) {
    predicate = createAction(type).match
  } else if (actionCreator) {
    type = actionCreator!.type
    predicate = actionCreator.match
  } else if (matcher) {
    predicate = matcher
  } else if (predicate) {
    // pass
  } else {
    throw new Error(
      'Creating or removing a listener requires one of the known fields for matching an action'
    )
  }

  assertFunction(listener, 'options.listener')

  return { predicate, type, listener }
}

/** Accepts the possible options for creating a listener, and returns a formatted listener entry */
export const createListenerEntry: TypedCreateListenerEntry<unknown> = (
  options: FallbackAddListenerOptions
) => {
  const { type, predicate, listener } = getListenerEntryPropsFrom(options)

  const id = nanoid()
  const entry: ListenerEntry<unknown> = {
    id,
    listener,
    type,
    predicate,
    pending: new Set<AbortController>(),
    unsubscribe: () => {
      throw new Error('Unsubscribe not initialized')
    },
  }

  return entry
}

const createClearListenerMiddleware = (
  listenerMap: Map<string, ListenerEntry>
) => {
  return () => {
    listenerMap.forEach((entry) => {
      entry.pending.forEach((controller) => {
        controller.abort()
      })
    })

    listenerMap.clear()
  }
}

/**
 * Safely reports errors to the `errorHandler` provided.
 * Errors that occur inside `errorHandler` are notified in a new task.
 * Inspired by [rxjs reportUnhandledError](https://github.com/ReactiveX/rxjs/blob/6fafcf53dc9e557439b25debaeadfd224b245a66/src/internal/util/reportUnhandledError.ts)
 * @param errorHandler
 * @param errorToNotify
 */
const safelyNotifyError = (
  errorHandler: ListenerErrorHandler,
  errorToNotify: unknown,
  errorInfo: ListenerErrorInfo
): void => {
  try {
    errorHandler(errorToNotify, errorInfo)
  } catch (errorHandlerError) {
    // We cannot let an error raised here block the listener queue.
    // The error raised here will be picked up by `window.onerror`, `process.on('error')` etc...
    setTimeout(() => {
      throw errorHandlerError
    }, 0)
  }
}

/**
 * @alpha
 */
export const addListenerAction = createAction(
  `${alm}/add`
) as TypedAddListenerAction<unknown>

/**
 * @alpha
 */
export const clearListenerMiddlewareAction = createAction(`${alm}/clear`)

/**
 * @alpha
 */
export const removeListenerAction = createAction(
  `${alm}/remove`
) as TypedRemoveListenerAction<unknown>

const defaultErrorHandler: ListenerErrorHandler = (...args: unknown[]) => {
  console.error(`${alm}/error`, ...args)
}

/**
 * @alpha
 */
export function createListenerMiddleware<
  S = unknown,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  ExtraArgument = unknown
>(middlewareOptions: CreateListenerMiddlewareOptions<ExtraArgument> = {}) {
  const listenerMap = new Map<string, ListenerEntry>()
  const { extra, onError = defaultErrorHandler } = middlewareOptions

  assertFunction(onError, 'onError')

  const insertEntry = (entry: ListenerEntry) => {
    entry.unsubscribe = () => listenerMap.delete(entry!.id)

    listenerMap.set(entry.id, entry)
    return entry.unsubscribe
  }

  const findListenerEntry = (
    comparator: (entry: ListenerEntry) => boolean
  ): ListenerEntry | undefined => {
    for (const entry of listenerMap.values()) {
      if (comparator(entry)) {
        return entry
      }
    }

    return undefined
  }

  const addListener = (options: FallbackAddListenerOptions) => {
    let entry = findListenerEntry(
      (existingEntry) => existingEntry.listener === options.listener
    )

    if (!entry) {
      entry = createListenerEntry(options as any)
    }

    return insertEntry(entry)
  }

  const removeListener = (options: FallbackAddListenerOptions): boolean => {
    const { type, listener, predicate } = getListenerEntryPropsFrom(options)

    const entry = findListenerEntry((entry) => {
      const matchPredicateOrType =
        typeof type === 'string'
          ? entry.type === type
          : entry.predicate === predicate

      return matchPredicateOrType && entry.listener === listener
    })

    entry?.unsubscribe()

    return !!entry
  }

  const notifyListener = async (
    entry: ListenerEntry<unknown, Dispatch<AnyAction>>,
    action: AnyAction,
    api: MiddlewareAPI,
    getOriginalState: () => S
  ) => {
    const internalTaskController = new AbortController()
    const take = createTakePattern(addListener, internalTaskController.signal)

    try {
      entry.pending.add(internalTaskController)
      await Promise.resolve(
        entry.listener(
          action,
          // Use assign() rather than ... to avoid extra helper functions added to bundle
          assign({}, api, {
            getOriginalState,
            condition: (
              predicate: AnyActionListenerPredicate<any>,
              timeout?: number
            ) => take(predicate, timeout).then(Boolean),
            take,
            delay: createDelay(internalTaskController.signal),
            pause: createPause<any>(internalTaskController.signal),
            extra,
            signal: internalTaskController.signal,
            fork: createFork(internalTaskController.signal),
            unsubscribe: entry.unsubscribe,
            subscribe: () => {
              listenerMap.set(entry.id, entry)
            },
            cancelActiveListeners: () => {
              entry.pending.forEach((controller, _, set) => {
                if (controller !== internalTaskController) {
                  controller.abort()
                  set.delete(controller)
                }
              })
            },
          })
        )
      )
    } catch (listenerError) {
      if (!(listenerError instanceof TaskAbortError)) {
        safelyNotifyError(onError, listenerError, {
          raisedBy: 'listener',
        })
      }
    } finally {
      internalTaskController.abort() // Notify that the task has completed
      entry.pending.delete(internalTaskController)
    }
  }

  const clearListenerMiddleware = createClearListenerMiddleware(listenerMap)

  const middleware: Middleware<
    {
      (action: Action<`${typeof alm}/add`>): Unsubscribe
    },
    S,
    D
  > = (api) => (next) => (action) => {
    if (addListenerAction.match(action)) {
      return addListener(action.payload)
    }

    if (clearListenerMiddlewareAction.match(action)) {
      clearListenerMiddleware()
      return
    }

    if (removeListenerAction.match(action)) {
      return removeListener(action.payload)
    }

    // Need to get this state _before_ the reducer processes the action
    let originalState: S | typeof INTERNAL_NIL_TOKEN = api.getState()

    // `getOriginalState` can only be called synchronously.
    // @see https://github.com/reduxjs/redux-toolkit/discussions/1648#discussioncomment-1932820
    const getOriginalState = (): S => {
      if (originalState === INTERNAL_NIL_TOKEN) {
        throw new Error(
          `${alm}: getOriginalState can only be called synchronously`
        )
      }

      return originalState as S
    }

    let result: unknown

    try {
      // Actually forward the action to the reducer before we handle listeners
      result = next(action)

      if (listenerMap.size > 0) {
        let currentState = api.getState()
        for (let entry of listenerMap.values()) {
          let runListener = false

          try {
            runListener = entry.predicate(action, currentState, originalState)
          } catch (predicateError) {
            runListener = false

            safelyNotifyError(onError, predicateError, {
              raisedBy: 'predicate',
            })
          }

          if (!runListener) {
            continue
          }

          notifyListener(entry, action, api, getOriginalState)
        }
      }
    } finally {
      // Remove `originalState` store from this scope.
      originalState = INTERNAL_NIL_TOKEN
    }

    return result
  }

  return assign(
    middleware,
    {
      addListener: addListener as TypedAddListener<S, D>,
      removeListener: removeListener as TypedRemoveListener<S, D>,
      clearListeners: clearListenerMiddleware,
    },
    {} as WithMiddlewareType<typeof middleware>
  )
}
