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
  ListenerMiddleware,
  ListenerMiddlewareInstance,
  AddListenerOverloads,
  AnyListenerPredicate,
  CreateListenerMiddlewareOptions,
  TypedActionCreator,
  TypedStartListening,
  TypedAddListener,
  TypedCreateListenerEntry,
  FallbackAddListenerOptions,
  ListenerEntry,
  ListenerErrorHandler,
  Unsubscribe,
  TakePattern,
  ListenerErrorInfo,
  ForkedTaskExecutor,
  ForkedTask,
  TypedRemoveListener,
  TypedStopListening,
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
  ListenerEffect,
  ListenerMiddleware,
  ListenerEffectAPI,
  CreateListenerMiddlewareOptions,
  ListenerErrorHandler,
  TypedStartListening,
  TypedAddListener,
  TypedStopListening,
  TypedRemoveListener,
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

const alm = 'listenerMiddleware' as const

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
  startListening: AddListenerOverloads<Unsubscribe, S, Dispatch<AnyAction>>,
  signal: AbortSignal
): TakePattern<S> => {
  /**
   * A function that takes a ListenerPredicate and an optional timeout,
   * and resolves when either the predicate returns `true` based on an action
   * state combination or when the timeout expires.
   * If the parent listener is canceled while waiting, this will throw a
   * TaskAbortError.
   */
  const take = async <P extends AnyListenerPredicate<S>>(
    predicate: P,
    timeout: number | undefined
  ) => {
    validateActive(signal)

    // Placeholder unsubscribe function until the listener is added
    let unsubscribe: Unsubscribe = () => {}

    const tuplePromise = new Promise<[AnyAction, S, S]>((resolve) => {
      // Inside the Promise, we synchronously add the listener.
      unsubscribe = startListening({
        predicate: predicate as any,
        effect: (action, listenerApi): void => {
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

  return ((predicate: AnyListenerPredicate<S>, timeout: number | undefined) =>
    catchRejection(take(predicate, timeout))) as TakePattern<S>
}

const getListenerEntryPropsFrom = (options: FallbackAddListenerOptions) => {
  let { type, actionCreator, matcher, predicate, effect } = options

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

  assertFunction(effect, 'options.listener')

  return { predicate, type, effect }
}

/** Accepts the possible options for creating a listener, and returns a formatted listener entry */
export const createListenerEntry: TypedCreateListenerEntry<unknown> = (
  options: FallbackAddListenerOptions
) => {
  const { type, predicate, effect } = getListenerEntryPropsFrom(options)

  const id = nanoid()
  const entry: ListenerEntry<unknown> = {
    id,
    effect,
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
export const addListener = createAction(
  `${alm}/add`
) as TypedAddListener<unknown>

/**
 * @alpha
 */
export const removeAllListeners = createAction(`${alm}/removeAll`)

/**
 * @alpha
 */
export const removeListener = createAction(
  `${alm}/remove`
) as TypedRemoveListener<unknown>

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

  const startListening = (options: FallbackAddListenerOptions) => {
    let entry = findListenerEntry(
      (existingEntry) => existingEntry.effect === options.effect
    )

    if (!entry) {
      entry = createListenerEntry(options as any)
    }

    return insertEntry(entry)
  }

  const stopListening = (options: FallbackAddListenerOptions): boolean => {
    const { type, effect, predicate } = getListenerEntryPropsFrom(options)

    const entry = findListenerEntry((entry) => {
      const matchPredicateOrType =
        typeof type === 'string'
          ? entry.type === type
          : entry.predicate === predicate

      return matchPredicateOrType && entry.effect === effect
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
    const take = createTakePattern(
      startListening,
      internalTaskController.signal
    )

    try {
      entry.pending.add(internalTaskController)
      await Promise.resolve(
        entry.effect(
          action,
          // Use assign() rather than ... to avoid extra helper functions added to bundle
          assign({}, api, {
            getOriginalState,
            condition: (
              predicate: AnyListenerPredicate<any>,
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
          raisedBy: 'effect',
        })
      }
    } finally {
      internalTaskController.abort() // Notify that the task has completed
      entry.pending.delete(internalTaskController)
    }
  }

  const clearListenerMiddleware = createClearListenerMiddleware(listenerMap)

  const middleware: ListenerMiddleware<S, D, ExtraArgument> =
    (api) => (next) => (action) => {
      if (addListener.match(action)) {
        return startListening(action.payload)
      }

      if (removeAllListeners.match(action)) {
        clearListenerMiddleware()
        return
      }

      if (removeListener.match(action)) {
        return stopListening(action.payload)
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

  return {
    middleware,
    startListening,
    stopListening,
    clearListeners: clearListenerMiddleware,
  } as ListenerMiddlewareInstance<S, D, ExtraArgument>
}
