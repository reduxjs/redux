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
  ActionListener,
  AddListenerOverloads,
  BaseActionCreator,
  AnyActionListenerPredicate,
  CreateListenerMiddlewareOptions,
  ConditionFunction,
  ListenerPredicate,
  TypedActionCreator,
  TypedAddListener,
  TypedAddListenerAction,
  TypedCreateListenerEntry,
  RemoveListenerAction,
  FallbackAddListenerOptions,
  ListenerEntry,
  ListenerErrorHandler,
  Unsubscribe,
  MiddlewarePhase,
  WithMiddlewareType,
  TakePattern,
  ListenerErrorInfo,
  ForkedTaskExecutor,
  ForkedTask,
} from './types'
import { assertFunction,   catchRejection, } from './utils'
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
  MiddlewarePhase,
  When,
  ListenerErrorHandler,
  TypedAddListener,
  TypedAddListenerAction,
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

const beforeReducer = 'beforeReducer' as const
const afterReducer = 'afterReducer' as const

const defaultWhen: MiddlewarePhase = afterReducer
const actualMiddlewarePhases = [beforeReducer, afterReducer] as const

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

/** Accepts the possible options for creating a listener, and returns a formatted listener entry */
export const createListenerEntry: TypedCreateListenerEntry<unknown> = (
  options: FallbackAddListenerOptions
) => {
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
      'Creating a listener requires one of the known fields for matching against actions'
    )
  }

  const id = nanoid()
  const entry: ListenerEntry<unknown> = {
    when: options.when || defaultWhen,
    id,
    listener,
    type,
    predicate,
    pendingSet: new Set<AbortController>(),
    unsubscribe: () => {
      throw new Error('Unsubscribe not initialized')
    },
  }

  return entry
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
  'actionListenerMiddleware/add',
  function prepare(options: unknown) {
    const entry = createListenerEntry(
      // Fake out TS here
      options as Parameters<AddListenerOverloads<unknown>>[0]
    )

    return {
      payload: entry,
    }
  }
) as TypedAddListenerAction<unknown>

/**
 * @alpha
 */
export const removeListenerAction = createAction(
  'actionListenerMiddleware/remove',
  function prepare(
    typeOrActionCreator: string | TypedActionCreator<string>,
    listener: ActionListener<any, any, any>
  ) {
    const type =
      typeof typeOrActionCreator === 'string'
        ? typeOrActionCreator
        : (typeOrActionCreator as TypedActionCreator<string>).type

    return {
      payload: {
        type,
        listener,
      },
    }
  }
) as BaseActionCreator<
  { type: string; listener: ActionListener<any, any, any> },
  'actionListenerMiddleware/remove'
> & {
  <C extends TypedActionCreator<any>, S, D extends Dispatch>(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D>
  ): RemoveListenerAction<ReturnType<C>, S, D>

  <S, D extends Dispatch>(
    type: string,
    listener: ActionListener<AnyAction, S, D>
  ): RemoveListenerAction<AnyAction, S, D>
}

const defaultErrorHandler: ListenerErrorHandler = (...args: unknown[]) => {
  console.error('action-listener-middleware-error', ...args)
}

/**
 * @alpha
 */
export function createActionListenerMiddleware<
  S = unknown,
  // TODO Carry through the thunk extra arg somehow?
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

  const addListener = ((options: FallbackAddListenerOptions) => {
    let entry = findListenerEntry(
      (existingEntry) => existingEntry.listener === options.listener
    )

    if (!entry) {
      entry = createListenerEntry(options as any)
    }

    return insertEntry(entry)
  }) as TypedAddListener<S, D>

  function removeListener<C extends TypedActionCreator<any>>(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D>
  ): boolean
  function removeListener(
    type: string,
    listener: ActionListener<AnyAction, S, D>
  ): boolean
  function removeListener(
    typeOrActionCreator: string | TypedActionCreator<any>,
    listener: ActionListener<AnyAction, S, D>
  ): boolean {
    const type =
      typeof typeOrActionCreator === 'string'
        ? typeOrActionCreator
        : typeOrActionCreator.type

    let entry = findListenerEntry(
      (entry) => entry.type === type && entry.listener === listener
    )

    if (!entry) {
      return false
    }

    listenerMap.delete(entry.id)
    return true
  }

  const notifyListener = async (
    entry: ListenerEntry<unknown, Dispatch<AnyAction>>,
    action: AnyAction,
    api: MiddlewareAPI,
    getOriginalState: () => S,
    currentPhase: MiddlewarePhase
  ) => {
    const internalTaskController = new AbortController()
    const take = createTakePattern(addListener, internalTaskController.signal)
    const condition: ConditionFunction<S> = (predicate, timeout) => {
      return take(predicate, timeout).then(Boolean)
    }
    const delay = createDelay(internalTaskController.signal)
    const fork = createFork(internalTaskController.signal)
    const pause: (val: Promise<any>) => Promise<any> = createPause(
      internalTaskController.signal
    )
    try {
      entry.pendingSet.add(internalTaskController)
      await Promise.resolve(
        entry.listener(
          action,
          // Use assign() rather than ... to avoid extra helper functions added to bundle
          assign({}, api, {
            getOriginalState,
            condition,
            take,
            delay,
            pause,
            currentPhase,
            extra,
            signal: internalTaskController.signal,
            fork,
            unsubscribe: entry.unsubscribe,
            subscribe: () => {
              listenerMap.set(entry.id, entry)
            },
            cancelPrevious: () => {
              entry.pendingSet.forEach((controller, _, set) => {
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
          phase: currentPhase,
        })
      }
    } finally {
      internalTaskController.abort() // Notify that the task has completed
      entry.pendingSet.delete(internalTaskController)
    }
  }

  const middleware: Middleware<
    {
      (action: Action<'actionListenerMiddleware/add'>): Unsubscribe
    },
    S,
    D
  > = (api) => (next) => (action) => {
    if (addListenerAction.match(action)) {
      let entry = findListenerEntry(
        (existingEntry) => existingEntry.listener === action.payload.listener
      )

      if (!entry) {
        entry = action.payload
      }

      return insertEntry(entry)
    }
    if (removeListenerAction.match(action)) {
      removeListener(action.payload.type, action.payload.listener)
      return
    }

    if (listenerMap.size === 0) {
      return next(action)
    }

    let result: unknown
    const originalState = api.getState()
    const getOriginalState = () => originalState

    for (const currentPhase of actualMiddlewarePhases) {
      let currentState = api.getState()
      for (let entry of listenerMap.values()) {
        const runThisPhase =
          entry.when === 'both' || entry.when === currentPhase

        let runListener = runThisPhase

        if (runListener) {
          try {
            runListener = entry.predicate(action, currentState, originalState)
          } catch (predicateError) {
            runListener = false

            safelyNotifyError(onError, predicateError, {
              raisedBy: 'predicate',
              phase: currentPhase,
            })
          }
        }

        if (!runListener) {
          continue
        }

        notifyListener(entry, action, api, getOriginalState, currentPhase)
      }
      if (currentPhase === beforeReducer) {
        result = next(action)
      } else {
        return result
      }
    }
  }

  return assign(
    middleware,
    {
      addListener,
      removeListener,
      addListenerAction: addListenerAction as TypedAddListenerAction<S>,
    },
    {} as WithMiddlewareType<typeof middleware>
  )
}
