import type {
  PayloadAction,
  Middleware,
  Dispatch,
  AnyAction,
  MiddlewareAPI,
  Action,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import { createAction, nanoid } from '@reduxjs/toolkit'

interface BaseActionCreator<P, T extends string, M = never, E = never> {
  type: T
  match(action: Action<unknown>): action is PayloadAction<P, T, M, E>
}

interface TypedActionCreator<Type extends string> {
  (...args: any[]): Action<Type>
  type: Type
  match: MatchFunction<any>
}

type AnyActionListenerPredicate<State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => boolean

type ListenerPredicate<Action extends AnyAction, State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => action is Action

interface ConditionFunction<State> {
  (
    predicate: AnyActionListenerPredicate<State>,
    timeout?: number
  ): Promise<boolean>
  (
    predicate: AnyActionListenerPredicate<State>,
    timeout?: number
  ): Promise<boolean>
  (predicate: () => boolean, timeout?: number): Promise<boolean>
}

type MatchFunction<T> = (v: any) => v is T

export interface HasMatchFunction<T> {
  match: MatchFunction<T>
}

function assertFunction(
  func: unknown,
  expected: string
): asserts func is (...args: unknown[]) => unknown {
  if (typeof func !== 'function') {
    throw new TypeError(`${expected} in not a function`)
  }
}

export const hasMatchFunction = <T>(
  v: Matcher<T>
): v is HasMatchFunction<T> => {
  return v && typeof (v as HasMatchFunction<T>).match === 'function'
}

export const isActionCreator = (
  item: Function
): item is TypedActionCreator<any> => {
  return (
    typeof item === 'function' &&
    typeof (item as any).type === 'string' &&
    hasMatchFunction(item as any)
  )
}

/** @public */
export type Matcher<T> = HasMatchFunction<T> | MatchFunction<T>

type Unsubscribe = () => void

type GuardedType<T> = T extends (x: any, ...args: unknown[]) => x is infer T
  ? T
  : never

type ListenerPredicateGuardedActionType<T> = T extends ListenerPredicate<
  infer Action,
  any
>
  ? Action
  : never

const declaredMiddlewareType: unique symbol = undefined as any
export type WithMiddlewareType<T extends Middleware<any, any, any>> = {
  [declaredMiddlewareType]: T
}

export type MiddlewarePhase = 'beforeReducer' | 'afterReducer'

const defaultWhen: MiddlewarePhase = 'afterReducer'
const actualMiddlewarePhases = ['beforeReducer', 'afterReducer'] as const

export type When = MiddlewarePhase | 'both' | undefined

/**
 * @alpha
 */
export interface ActionListenerMiddlewareAPI<S, D extends Dispatch<AnyAction>>
  extends MiddlewareAPI<D, S> {
  getOriginalState: () => S
  unsubscribe(): void
  subscribe(): void
  condition: ConditionFunction<S>
  currentPhase: MiddlewarePhase
  // TODO Figure out how to pass this through the other types correctly
  extra: unknown
}

/**
 * @alpha
 */
export type ActionListener<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>
> = (action: A, api: ActionListenerMiddlewareAPI<S, D>) => void

export interface ListenerErrorHandler {
  (error: unknown): void
}

export interface ActionListenerOptions {
  /**
   * Determines if the listener runs 'before' or 'after' the reducers have been called.
   * If set to 'before', calling `api.stopPropagation()` from the listener becomes possible.
   * Defaults to 'before'.
   */
  when?: When
}

export interface CreateListenerMiddlewareOptions<ExtraArgument = unknown> {
  extra?: ExtraArgument
  /**
   * Receives synchronous errors that are raised by `listener` and `listenerOption.predicate`.
   */
  onError?: ListenerErrorHandler
}

interface AddListenerOverloads<
  Return,
  S = unknown,
  D extends Dispatch = ThunkDispatch<S, unknown, AnyAction>
> {
  <MA extends AnyAction, LP extends ListenerPredicate<MA, S>>(
    options: {
      actionCreator?: never
      type?: never
      matcher?: never
      predicate: LP
      listener: ActionListener<ListenerPredicateGuardedActionType<LP>, S, D>
    } & ActionListenerOptions
  ): Return
  <C extends TypedActionCreator<any>>(
    options: {
      actionCreator: C
      type?: never
      matcher?: never
      predicate?: never
      listener: ActionListener<ReturnType<C>, S, D>
    } & ActionListenerOptions
  ): Return
  <T extends string>(
    options: {
      actionCreator?: never
      type: T
      matcher?: never
      predicate?: never
      listener: ActionListener<Action<T>, S, D>
    } & ActionListenerOptions
  ): Return
  <MA extends AnyAction, M extends MatchFunction<MA>>(
    options: {
      actionCreator?: never
      type?: never
      matcher: M
      predicate?: never
      listener: ActionListener<GuardedType<M>, S, D>
    } & ActionListenerOptions
  ): Return

  <LP extends AnyActionListenerPredicate<S>>(
    options: {
      actionCreator?: never
      type?: never
      matcher?: never
      predicate: LP
      listener: ActionListener<AnyAction, S, D>
    } & ActionListenerOptions
  ): Return
}

interface RemoveListenerOverloads<
  S = unknown,
  D extends Dispatch = ThunkDispatch<S, unknown, AnyAction>
> {
  <C extends TypedActionCreator<any>>(
    actionCreator: C,
    listener: ActionListener<ReturnType<C>, S, D>
  ): boolean
  (type: string, listener: ActionListener<AnyAction, S, D>): boolean
}

export type TypedAddListenerAction<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  Payload = ListenerEntry<S, D>,
  T extends string = 'actionListenerMiddleware/add'
> = BaseActionCreator<Payload, T> &
  AddListenerOverloads<PayloadAction<Payload>, S, D>

export type TypedAddListener<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>
> = AddListenerOverloads<Unsubscribe, S, D>

type ListenerEntry<
  S = unknown,
  D extends Dispatch<AnyAction> = Dispatch<AnyAction>
> = {
  id: string
  when: When
  listener: ActionListener<any, S, D>
  unsubscribe: () => void
  type?: string
  predicate: ListenerPredicate<AnyAction, S>
}

export type TypedCreateListenerEntry<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>
> = AddListenerOverloads<ListenerEntry<S, D>, S, D>

export type TypedAddListenerPrepareFunction<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>
> = AddListenerOverloads<{ payload: ListenerEntry<S, D> }, S, D>

type FallbackAddListenerOptions = (
  | { actionCreator: TypedActionCreator<string> }
  | { type: string }
  | { matcher: MatchFunction<any> }
  | { predicate: ListenerPredicate<any, any> }
) &
  ActionListenerOptions & { listener: ActionListener<any, any, any> }

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
  } else {
    predicate = options.predicate
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
  }

  return entry
}

export type ActionListenerMiddleware<
  S = unknown,
  // TODO Carry through the thunk extra arg somehow?
  D extends ThunkDispatch<S, unknown, AnyAction> = ThunkDispatch<
    S,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown
> = Middleware<
  {
    (action: Action<'actionListenerMiddleware/add'>): Unsubscribe
  },
  S,
  D
> & {
  addListener: AddListenerOverloads<Unsubscribe, S, D>
  removeListener: RemoveListenerOverloads<S, D>
  addListenerAction: TypedAddListenerAction<S, D>
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
  errorToNotify: unknown
): void => {
  try {
    errorHandler(errorToNotify)
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
      options as Parameters<AddListenerOverloads<unknown>>[0]
    )

    return {
      payload: entry,
    }
  }
) as TypedAddListenerAction<unknown>

interface RemoveListenerAction<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>
> {
  type: 'actionListenerMiddleware/remove'
  payload: {
    type: string
    listener: ActionListener<A, S, D>
  }
}

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
  type ListenerEntry = ActionListenerOptions & {
    id: string
    listener: ActionListener<any, S, D>
    unsubscribe: () => void
    type?: string
    predicate: ListenerPredicate<any, any>
  }

  const listenerMap = new Map<string, ListenerEntry>()
  const { extra, onError = defaultErrorHandler } = middlewareOptions

  assertFunction(onError, 'onError')

  const insertEntry = (entry: ListenerEntry) => {
    entry.unsubscribe = () => listenerMap.delete(entry!.id)

    listenerMap.set(entry.id, entry)
    return entry.unsubscribe
  }

  const middleware: Middleware<
    {
      (action: Action<'actionListenerMiddleware/add'>): Unsubscribe
    },
    S,
    D
  > = (api) => (next) => (action) => {
    if (addListenerAction.match(action)) {
      return insertEntry(action.payload)
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
            safelyNotifyError(onError, predicateError)
            runListener = false
          }
        }

        if (!runListener) {
          continue
        }

        try {
          entry.listener(action, {
            ...api,
            getOriginalState,
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            condition,
            currentPhase,
            extra,
            unsubscribe: entry.unsubscribe,
            subscribe: () => {
              listenerMap.set(entry.id, entry)
            },
          })
        } catch (listenerError) {
          safelyNotifyError(onError, listenerError)
        }
      }
      if (currentPhase === 'beforeReducer') {
        result = next(action)
      } else {
        return result
      }
    }
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

  const condition: ConditionFunction<S> = async (predicate, timeout) => {
    let unsubscribe: Unsubscribe = () => {}

    const conditionSucceededPromise = new Promise<boolean>(
      (resolve, reject) => {
        unsubscribe = addListener({
          predicate,
          listener: (action, listenerApi) => {
            // One-shot listener that cleans up as soon as the predicate resolves
            listenerApi.unsubscribe()
            resolve(true)
          },
        })
      }
    )

    if (timeout === undefined) {
      return conditionSucceededPromise
    }

    const timedOutPromise = new Promise<boolean>((resolve, reject) => {
      setTimeout(() => {
        resolve(false)
      }, timeout)
    })

    const result = await Promise.race([
      conditionSucceededPromise,
      timedOutPromise,
    ])

    unsubscribe()
    return result
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
