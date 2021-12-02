import type {
  Middleware,
  Dispatch,
  AnyAction,
  Action,
  ThunkDispatch,
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
} from './types'

import {
  Job,
  SupervisorJob,
  JobHandle,
  JobCancellationReason,
  JobCancellationException,
} from './job'
import { Outcome } from './outcome'

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
} from './types'

function assertFunction(
  func: unknown,
  expected: string
): asserts func is (...args: unknown[]) => unknown {
  if (typeof func !== 'function') {
    throw new TypeError(`${expected} is not a function`)
  }
}

const defaultWhen: MiddlewarePhase = 'afterReducer'
const actualMiddlewarePhases = ['beforeReducer', 'afterReducer'] as const

function createTakePattern<S>(
  addListener: AddListenerOverloads<Unsubscribe, S, Dispatch<AnyAction>>,
  parentJob: Job<any>
): TakePattern<S> {
  async function take<P extends AnyActionListenerPredicate<S>>(
    predicate: P,
    timeout: number | undefined
  ) {
    let unsubscribe: Unsubscribe = () => {}
    let job: Job<[AnyAction, S, S]> = parentJob.launch(async (job) => Outcome.wrap(new Promise<[AnyAction, S, S]>((resolve) => {
      unsubscribe = addListener({
        predicate: predicate as any,
        listener: (action, listenerApi): void => {
          // One-shot listener that cleans up as soon as the predicate resolves
          listenerApi.unsubscribe()
          resolve(([
            action,
            listenerApi.getState(),
            listenerApi.getOriginalState(),
          ]))
        },
        parentJob,
      })
    })));


    let result: Outcome<[AnyAction, S, S]>;

    try {
      result = await (timeout !== undefined ? job.runWithTimeout(timeout) : job.run());

      if(result.isOk()) {
        return result.value;
      } else if(result.error instanceof JobCancellationException) {
        return false;
      } 

      throw result.error;

    } finally {
      unsubscribe()
    }

  }

  return take as TakePattern<S>
}

/** Accepts the possible options for creating a listener, and returns a formatted listener entry */
export const createListenerEntry: TypedCreateListenerEntry<unknown> = (
  options: FallbackAddListenerOptions
) => {
  let predicate: ListenerPredicate<any, any>
  let type: string | undefined

  if ('type' in options) {
    type = options.type
    predicate = (action: any): action is any => action.type === type
  } else if ('actionCreator' in options) {
    type = options.actionCreator!.type
    predicate = options.actionCreator.match
  } else if ('matcher' in options) {
    predicate = options.matcher
  } else if ('predicate' in options) {
    predicate = options.predicate
  } else {
    throw new Error(
      'Creating a listener requires one of the known fields for matching against actions'
    )
  }

  const id = nanoid()
  const entry: ListenerEntry<unknown> = {
    when: options.when || defaultWhen,
    id,
    listener: options.listener,
    type,
    predicate,
    unsubscribe: () => {
      throw new Error('Unsubscribe not initialized')
    },
    parentJob: new SupervisorJob(),
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

  function findListenerEntry(
    comparator: (entry: ListenerEntry) => boolean
  ): ListenerEntry | undefined {
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

        entry.parentJob.launchAndRun(async (jobHandle) => {
          const take = createTakePattern(addListener, entry.parentJob as Job<any>);
           const condition: ConditionFunction<S> = (predicate, timeout) => {
             return take(predicate, timeout).then(Boolean)
           }

          const result = await Outcome.try(async () =>
            entry.listener(action, {
              ...api,
              getOriginalState,
              condition,
              take,
              currentPhase,
              extra,
              unsubscribe: entry.unsubscribe,
              subscribe: () => {
                listenerMap.set(entry.id, entry)
              },
              job: jobHandle,
              cancelPrevious: () => {
                entry.parentJob.cancelChildren(
                  new JobCancellationException(
                    JobCancellationReason.JobCancelled
                  ),
                  [jobHandle]
                )
              },
            })
          )
          if (
            result.isError() &&
            !(result.error instanceof JobCancellationException)
          ) {
            safelyNotifyError(onError, result.error, {
              raisedBy: 'listener',
              phase: currentPhase,
            })
          }

          return Outcome.ok(1)
        })
      }
      if (currentPhase === 'beforeReducer') {
        result = next(action)
      } else {
        return result
      }
    }
  }

  return Object.assign(
    middleware,
    {
      addListener,
      removeListener,
      addListenerAction: addListenerAction as TypedAddListenerAction<S>,
    },
    {} as WithMiddlewareType<typeof middleware>
  )
}
