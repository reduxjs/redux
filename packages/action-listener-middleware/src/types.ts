import type {
  PayloadAction,
  Middleware,
  Dispatch,
  AnyAction,
  MiddlewareAPI,
  Action,
  ThunkDispatch,
} from '@reduxjs/toolkit'
import type { TaskAbortError } from './exceptions'

/**
 * @internal
 * At the time of writing `lib.dom.ts` does not provide `abortSignal.reason`.
 */
export type AbortSignalWithReason<T> = AbortSignal & { reason?: T }

/**
 * Types copied from RTK
 */

export interface BaseActionCreator<P, T extends string, M = never, E = never> {
  type: T
  match(action: Action<unknown>): action is PayloadAction<P, T, M, E>
}

export interface TypedActionCreator<Type extends string> {
  (...args: any[]): Action<Type>
  type: Type
  match: MatchFunction<any>
}

export type AnyListenerPredicate<State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => boolean

export type ListenerPredicate<Action extends AnyAction, State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => action is Action

export interface ConditionFunction<State> {
  (predicate: AnyListenerPredicate<State>, timeout?: number): Promise<boolean>
  (predicate: AnyListenerPredicate<State>, timeout?: number): Promise<boolean>
  (predicate: () => boolean, timeout?: number): Promise<boolean>
}

export type MatchFunction<T> = (v: any) => v is T

export interface HasMatchFunction<T> {
  match: MatchFunction<T>
}

export interface ForkedTaskAPI {
  /**
   * Returns a promise that resolves when `waitFor` resolves or
   * rejects if the task has been cancelled or completed.
   */
  pause<W>(waitFor: Promise<W>): Promise<W>
  /**
   * Returns a promise resolves after `timeoutMs` or
   * rejects if the task has been cancelled or is completed.
   * @param timeoutMs
   */
  delay(timeoutMs: number): Promise<void>
  /**
   * An abort signal whose `aborted` property is set to `true`
   * if the task execution is either aborted or completed.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal: AbortSignal
}

export interface AsyncTaskExecutor<T> {
  (forkApi: ForkedTaskAPI): Promise<T>
}

export interface SyncTaskExecutor<T> {
  (forkApi: ForkedTaskAPI): T
}

export type ForkedTaskExecutor<T> = AsyncTaskExecutor<T> | SyncTaskExecutor<T>

export type TaskResolved<T> = {
  readonly status: 'ok'
  readonly value: T
}

export type TaskRejected = {
  readonly status: 'rejected'
  readonly error: unknown
}

export type TaskCancelled = {
  readonly status: 'cancelled'
  readonly error: TaskAbortError
}

export type TaskResult<Value> =
  | TaskResolved<Value>
  | TaskRejected
  | TaskCancelled

export interface ForkedTask<T> {
  result: Promise<TaskResult<T>>
  /**
   * Cancel task if it is in progress or not yet started,
   * it is noop otherwise.
   */
  cancel(): void
}

/**
 * @alpha
 */
export interface ListenerEffectAPI<
  S,
  D extends Dispatch<AnyAction>,
  ExtraArgument = unknown
> extends MiddlewareAPI<D, S> {
  /**
   * Returns the store state as it existed when the action was originally dispatched, _before_ the reducers ran.
   *
   * ### Synchronous invocation
   *
   * This function can **only** be invoked **synchronously**, it throws error otherwise.
   *
   * @example
   *
   * ```ts
   * middleware.startListening({
   *  predicate: () => true,
   *  async listener(_, { getOriginalState }) {
   *    getOriginalState(); // sync: OK!
   *
   *    setTimeout(getOriginalState, 0); // async: throws Error
   *
   *    await Promise().resolve();
   *
   *    getOriginalState() // async: throws Error
   *  }
   * })
   * ```
   */
  getOriginalState: () => S
  unsubscribe(): void
  subscribe(): void
  condition: ConditionFunction<S>
  take: TakePattern<S>
  cancelActiveListeners: () => void
  /**
   * An abort signal whose `aborted` property is set to `true`
   * if the listener execution is either aborted or completed.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
   */
  signal: AbortSignal
  /**
   * Returns a promise resolves after `timeoutMs` or
   * rejects if the listener has been cancelled or is completed.
   */
  delay(timeoutMs: number): Promise<void>
  /**
   * Queues in the next microtask the execution of a task.
   * @param executor
   */
  fork<T>(executor: ForkedTaskExecutor<T>): ForkedTask<T>
  /**
   * Returns a promise that resolves when `waitFor` resolves or
   * rejects if the listener has been cancelled or is completed.
   * @param promise
   */
  pause<M>(promise: Promise<M>): Promise<M>
  // TODO Figure out how to pass this through the other types correctly
  extra: ExtraArgument
}

/**
 * @alpha
 */
export type ListenerEffect<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>,
  ExtraArgument = unknown
> = (
  action: A,
  api: ListenerEffectAPI<S, D, ExtraArgument>
) => void | Promise<void>

export interface ListenerErrorHandler {
  (error: unknown): void
}

export interface CreateListenerMiddlewareOptions<ExtraArgument = unknown> {
  extra?: ExtraArgument
  /**
   * Receives synchronous errors that are raised by `listener` and `listenerOption.predicate`.
   */
  onError?: ListenerErrorHandler
}

export type ListenerMiddleware<
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
    (action: Action<'listenerMiddleware/add'>): Unsubscribe
  },
  S,
  D
>

export interface ListenerMiddlewareInstance<
  S = unknown,
  // TODO Carry through the thunk extra arg somehow?
  D extends ThunkDispatch<S, unknown, AnyAction> = ThunkDispatch<
    S,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown
> {
  middleware: ListenerMiddleware<S, D, ExtraArgument>
  startListening: AddListenerOverloads<Unsubscribe, S, D, ExtraArgument>
  stopListening: RemoveListenerOverloads<S, D>
  /**
   * Unsubscribes all listeners, cancels running listeners and tasks.
   */
  clearListeners: () => void
}

/**
 * API Function Overloads
 */

export type TakePatternOutputWithoutTimeout<
  State,
  Predicate extends AnyListenerPredicate<State>
> = Predicate extends MatchFunction<infer Action>
  ? Promise<[Action, State, State]>
  : Promise<[AnyAction, State, State]>

export type TakePatternOutputWithTimeout<
  State,
  Predicate extends AnyListenerPredicate<State>
> = Predicate extends MatchFunction<infer Action>
  ? Promise<[Action, State, State] | null>
  : Promise<[AnyAction, State, State] | null>

export interface TakePattern<State> {
  <Predicate extends AnyListenerPredicate<State>>(
    predicate: Predicate
  ): TakePatternOutputWithoutTimeout<State, Predicate>
  <Predicate extends AnyListenerPredicate<State>>(
    predicate: Predicate,
    timeout: number
  ): TakePatternOutputWithTimeout<State, Predicate>
  <Predicate extends AnyListenerPredicate<State>>(
    predicate: Predicate,
    timeout?: number | undefined
  ): Promise<[AnyAction, State, State] | null>
}

/**
 * The possible overloads and options for defining a listener. The return type of each function is specified as a generic arg, so the overloads can be reused for multiple different functions
 */
export interface AddListenerOverloads<
  Return,
  S = unknown,
  D extends Dispatch = ThunkDispatch<S, unknown, AnyAction>,
  ExtraArgument = unknown
> {
  /** Accepts a "listener predicate" that is also a TS type predicate for the action*/
  <MA extends AnyAction, LP extends ListenerPredicate<MA, S>>(options: {
    actionCreator?: never
    type?: never
    matcher?: never
    predicate: LP
    effect: ListenerEffect<
      ListenerPredicateGuardedActionType<LP>,
      S,
      D,
      ExtraArgument
    >
  }): Return

  /** Accepts an RTK action creator, like `incrementByAmount` */
  <C extends TypedActionCreator<any>>(options: {
    actionCreator: C
    type?: never
    matcher?: never
    predicate?: never
    effect: ListenerEffect<ReturnType<C>, S, D, ExtraArgument>
  }): Return

  /** Accepts a specific action type string */
  <T extends string>(options: {
    actionCreator?: never
    type: T
    matcher?: never
    predicate?: never
    effect: ListenerEffect<Action<T>, S, D, ExtraArgument>
  }): Return

  /** Accepts an RTK matcher function, such as `incrementByAmount.match` */
  <MA extends AnyAction, M extends MatchFunction<MA>>(options: {
    actionCreator?: never
    type?: never
    matcher: M
    predicate?: never
    effect: ListenerEffect<GuardedType<M>, S, D, ExtraArgument>
  }): Return

  /** Accepts a "listener predicate" that just returns a boolean, no type assertion */
  <LP extends AnyListenerPredicate<S>>(options: {
    actionCreator?: never
    type?: never
    matcher?: never
    predicate: LP
    effect: ListenerEffect<AnyAction, S, D, ExtraArgument>
  }): Return
}

export type RemoveListenerOverloads<
  S = unknown,
  D extends Dispatch = ThunkDispatch<S, unknown, AnyAction>
> = AddListenerOverloads<boolean, S, D>

export interface RemoveListenerAction<
  A extends AnyAction,
  S,
  D extends Dispatch<AnyAction>
> {
  type: 'listenerMiddleware/remove'
  payload: {
    type: string
    listener: ListenerEffect<A, S, D>
  }
}

/** A "pre-typed" version of `addListenerAction`, so the listener args are well-typed */
export type TypedAddListener<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  ExtraArgument = unknown,
  Payload = ListenerEntry<S, D>,
  T extends string = 'listenerMiddleware/add'
> = BaseActionCreator<Payload, T> &
  AddListenerOverloads<PayloadAction<Payload, T>, S, D, ExtraArgument>

/** A "pre-typed" version of `removeListenerAction`, so the listener args are well-typed */
export type TypedRemoveListener<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  Payload = ListenerEntry<S, D>,
  T extends string = 'listenerMiddleware/remove'
> = BaseActionCreator<Payload, T> &
  AddListenerOverloads<PayloadAction<Payload, T>, S, D>

/** A "pre-typed" version of `middleware.startListening`, so the listener args are well-typed */
export type TypedStartListening<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>,
  ExtraArgument = unknown
> = AddListenerOverloads<Unsubscribe, S, D, ExtraArgument>

/** A "pre-typed" version of `middleware.stopListening`, so the listener args are well-typed */
export type TypedStopListening<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>
> = RemoveListenerOverloads<S, D>

/** A "pre-typed" version of `createListenerEntry`, so the listener args are well-typed */
export type TypedCreateListenerEntry<
  S,
  D extends Dispatch<AnyAction> = ThunkDispatch<S, unknown, AnyAction>
> = AddListenerOverloads<ListenerEntry<S, D>, S, D>

/**
 * Internal Types
 */

/** @internal An single listener entry */
export type ListenerEntry<
  S = unknown,
  D extends Dispatch<AnyAction> = Dispatch<AnyAction>
> = {
  id: string
  effect: ListenerEffect<any, S, D>
  unsubscribe: () => void
  pending: Set<AbortController>
  type?: string
  predicate: ListenerPredicate<AnyAction, S>
}

const declaredMiddlewareType: unique symbol = undefined as any
export type WithMiddlewareType<T extends Middleware<any, any, any>> = {
  [declaredMiddlewareType]: T
}

// A shorthand form of the accepted args, solely so that `createListenerEntry` has validly-typed conditional logic when checking the options contents
export type FallbackAddListenerOptions = {
  actionCreator?: TypedActionCreator<string>
  type?: string
  matcher?: MatchFunction<any>
  predicate?: ListenerPredicate<any, any>
} & { effect: ListenerEffect<any, any, any> }

/**
 * Utility Types
 */

export type Unsubscribe = () => void

export type GuardedType<T> = T extends (
  x: any,
  ...args: unknown[]
) => x is infer T
  ? T
  : never

export type ListenerPredicateGuardedActionType<T> = T extends ListenerPredicate<
  infer Action,
  any
>
  ? Action
  : never

/**
 * Additional infos regarding the error raised.
 */
export interface ListenerErrorInfo {
  /**
   * Which function has generated the exception.
   */
  raisedBy: 'effect' | 'predicate'
}

/**
 * Gets notified with synchronous and asynchronous errors raised by `listeners` or `predicates`.
 * @param error The thrown error.
 * @param errorInfo Additional information regarding the thrown error.
 */
export interface ListenerErrorHandler {
  (error: unknown, errorInfo: ListenerErrorInfo): void
}

export interface CreateListenerMiddlewareOptions<ExtraArgument = unknown> {
  extra?: ExtraArgument
  /**
   * Receives synchronous and asynchronous errors that are raised by `listener` and `listenerOption.predicate`.
   */
  onError?: ListenerErrorHandler
}
