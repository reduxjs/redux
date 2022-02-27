import type { PayloadAction, BaseActionCreator } from '../createAction'
import type {
  Dispatch as ReduxDispatch,
  AnyAction,
  MiddlewareAPI,
  Middleware,
  Action as ReduxAction,
} from 'redux'
import type { ThunkDispatch } from 'redux-thunk'
import type { TaskAbortError } from './exceptions'

/**
 * @internal
 * At the time of writing `lib.dom.ts` does not provide `abortSignal.reason`.
 */
export type AbortSignalWithReason<T> = AbortSignal & { reason?: T }

/**
 * Types copied from RTK
 */

/** @internal */
export interface TypedActionCreator<Type extends string> {
  (...args: any[]): ReduxAction<Type>
  type: Type
  match: MatchFunction<any>
}

/** @internal */
export type AnyListenerPredicate<State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => boolean

/** @public */
export type ListenerPredicate<Action extends AnyAction, State> = (
  action: AnyAction,
  currentState: State,
  originalState: State
) => action is Action

/** @public */
export interface ConditionFunction<State> {
  (predicate: AnyListenerPredicate<State>, timeout?: number): Promise<boolean>
  (predicate: AnyListenerPredicate<State>, timeout?: number): Promise<boolean>
  (predicate: () => boolean, timeout?: number): Promise<boolean>
}

/** @internal */
export type MatchFunction<T> = (v: any) => v is T

/** @public */
export interface ForkedTaskAPI {
  /**
   * Returns a promise that resolves when `waitFor` resolves or
   * rejects if the task or the parent listener has been cancelled or is completed.
   */
  pause<W>(waitFor: Promise<W>): Promise<W>
  /**
   * Returns a promise resolves after `timeoutMs` or
   * rejects if the task or the parent listener has been cancelled or is completed.
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

/** @public */
export interface AsyncTaskExecutor<T> {
  (forkApi: ForkedTaskAPI): Promise<T>
}

/** @public */
export interface SyncTaskExecutor<T> {
  (forkApi: ForkedTaskAPI): T
}

/** @public */
export type ForkedTaskExecutor<T> = AsyncTaskExecutor<T> | SyncTaskExecutor<T>

/** @public */
export type TaskResolved<T> = {
  readonly status: 'ok'
  readonly value: T
}

/** @public */
export type TaskRejected = {
  readonly status: 'rejected'
  readonly error: unknown
}

/** @public */
export type TaskCancelled = {
  readonly status: 'cancelled'
  readonly error: TaskAbortError
}

/** @public */
export type TaskResult<Value> =
  | TaskResolved<Value>
  | TaskRejected
  | TaskCancelled

/** @public */
export interface ForkedTask<T> {
  /**
   * A promise that resolves when the task is either completed or cancelled or rejects
   * if parent listener execution is cancelled or completed.
   *
   * ### Example
   * ```ts
   * const result = await fork(async (forkApi) => Promise.resolve(4)).result
   *
   * if(result.status === 'ok') {
   *   console.log(result.value) // logs 4
   * }}
   * ```
   */
  result: Promise<TaskResult<T>>
  /**
   * Cancel task if it is in progress or not yet started,
   * it is noop otherwise.
   */
  cancel(): void
}

/** @public */
export interface ListenerEffectAPI<
  State,
  Dispatch extends ReduxDispatch<AnyAction>,
  ExtraArgument = unknown
> extends MiddlewareAPI<Dispatch, State> {
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
  getOriginalState: () => State
  unsubscribe(): void
  subscribe(): void
  condition: ConditionFunction<State>
  take: TakePattern<State>
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

/** @public */
export type ListenerEffect<
  Action extends AnyAction,
  State,
  Dispatch extends ReduxDispatch<AnyAction>,
  ExtraArgument = unknown
> = (
  action: Action,
  api: ListenerEffectAPI<State, Dispatch, ExtraArgument>
) => void | Promise<void>

/**
 * @public
 * Additional infos regarding the error raised.
 */
export interface ListenerErrorInfo {
  /**
   * Which function has generated the exception.
   */
  raisedBy: 'effect' | 'predicate'
}

/**
 * @public
 * Gets notified with synchronous and asynchronous errors raised by `listeners` or `predicates`.
 * @param error The thrown error.
 * @param errorInfo Additional information regarding the thrown error.
 */
export interface ListenerErrorHandler {
  (error: unknown, errorInfo: ListenerErrorInfo): void
}

/** @public */
export interface CreateListenerMiddlewareOptions<ExtraArgument = unknown> {
  extra?: ExtraArgument
  /**
   * Receives synchronous errors that are raised by `listener` and `listenerOption.predicate`.
   */
  onError?: ListenerErrorHandler
}

/** @public */
export type ListenerMiddleware<
  State = unknown,
  Dispatch extends ThunkDispatch<State, unknown, AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown
> = Middleware<
  {
    (action: ReduxAction<'listenerMiddleware/add'>): UnsubscribeListener
  },
  State,
  Dispatch
>

/** @public */
export interface ListenerMiddlewareInstance<
  State = unknown,
  Dispatch extends ThunkDispatch<State, unknown, AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown
> {
  middleware: ListenerMiddleware<State, Dispatch, ExtraArgument>
  startListening: AddListenerOverloads<
    UnsubscribeListener,
    State,
    Dispatch,
    ExtraArgument
  >
  stopListening: RemoveListenerOverloads<State, Dispatch>
  /**
   * Unsubscribes all listeners, cancels running listeners and tasks.
   */
  clearListeners: () => void
}

/**
 * API Function Overloads
 */

/** @public */
export type TakePatternOutputWithoutTimeout<
  State,
  Predicate extends AnyListenerPredicate<State>
> = Predicate extends MatchFunction<infer Action>
  ? Promise<[Action, State, State]>
  : Promise<[AnyAction, State, State]>

/** @public */
export type TakePatternOutputWithTimeout<
  State,
  Predicate extends AnyListenerPredicate<State>
> = Predicate extends MatchFunction<infer Action>
  ? Promise<[Action, State, State] | null>
  : Promise<[AnyAction, State, State] | null>

/** @public */
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

/** @public */
export interface UnsubscribeListenerOptions {
  cancelActive?: true
}

/** @public */
export type UnsubscribeListener = (
  unsuscribeOptions?: UnsubscribeListenerOptions
) => void

/**
 * @public
 * The possible overloads and options for defining a listener. The return type of each function is specified as a generic arg, so the overloads can be reused for multiple different functions
 */
export interface AddListenerOverloads<
  Return,
  State = unknown,
  Dispatch extends ReduxDispatch = ThunkDispatch<State, unknown, AnyAction>,
  ExtraArgument = unknown,
  AdditionalOptions = unknown
> {
  /** Accepts a "listener predicate" that is also a TS type predicate for the action*/
  <MA extends AnyAction, LP extends ListenerPredicate<MA, State>>(
    options: {
      actionCreator?: never
      type?: never
      matcher?: never
      predicate: LP
      effect: ListenerEffect<
        ListenerPredicateGuardedActionType<LP>,
        State,
        Dispatch,
        ExtraArgument
      >
    } & AdditionalOptions
  ): Return

  /** Accepts an RTK action creator, like `incrementByAmount` */
  <C extends TypedActionCreator<any>>(
    options: {
      actionCreator: C
      type?: never
      matcher?: never
      predicate?: never
      effect: ListenerEffect<ReturnType<C>, State, Dispatch, ExtraArgument>
    } & AdditionalOptions
  ): Return

  /** Accepts a specific action type string */
  <T extends string>(
    options: {
      actionCreator?: never
      type: T
      matcher?: never
      predicate?: never
      effect: ListenerEffect<ReduxAction<T>, State, Dispatch, ExtraArgument>
    } & AdditionalOptions
  ): Return

  /** Accepts an RTK matcher function, such as `incrementByAmount.match` */
  <MA extends AnyAction, M extends MatchFunction<MA>>(
    options: {
      actionCreator?: never
      type?: never
      matcher: M
      predicate?: never
      effect: ListenerEffect<GuardedType<M>, State, Dispatch, ExtraArgument>
    } & AdditionalOptions
  ): Return

  /** Accepts a "listener predicate" that just returns a boolean, no type assertion */
  <LP extends AnyListenerPredicate<State>>(
    options: {
      actionCreator?: never
      type?: never
      matcher?: never
      predicate: LP
      effect: ListenerEffect<AnyAction, State, Dispatch, ExtraArgument>
    } & AdditionalOptions
  ): Return
}

/** @public */
export type RemoveListenerOverloads<
  State = unknown,
  Dispatch extends ReduxDispatch = ThunkDispatch<State, unknown, AnyAction>
> = AddListenerOverloads<
  boolean,
  State,
  Dispatch,
  any,
  UnsubscribeListenerOptions
>

/** @public */
export interface RemoveListenerAction<
  Action extends AnyAction,
  State,
  Dispatch extends ReduxDispatch<AnyAction>
> {
  type: 'listenerMiddleware/remove'
  payload: {
    type: string
    listener: ListenerEffect<Action, State, Dispatch>
  }
}

/**
 * @public
 * A "pre-typed" version of `addListenerAction`, so the listener args are well-typed */
export type TypedAddListener<
  State,
  Dispatch extends ReduxDispatch<AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown,
  Payload = ListenerEntry<State, Dispatch>,
  T extends string = 'listenerMiddleware/add'
> = BaseActionCreator<Payload, T> &
  AddListenerOverloads<
    PayloadAction<Payload, T>,
    State,
    Dispatch,
    ExtraArgument
  >

/**
 * @public
 * A "pre-typed" version of `removeListenerAction`, so the listener args are well-typed */
export type TypedRemoveListener<
  State,
  Dispatch extends ReduxDispatch<AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >,
  Payload = ListenerEntry<State, Dispatch>,
  T extends string = 'listenerMiddleware/remove'
> = BaseActionCreator<Payload, T> &
  AddListenerOverloads<
    PayloadAction<Payload, T>,
    State,
    Dispatch,
    any,
    UnsubscribeListenerOptions
  >

/**
 * @public
 * A "pre-typed" version of `middleware.startListening`, so the listener args are well-typed */
export type TypedStartListening<
  State,
  Dispatch extends ReduxDispatch<AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >,
  ExtraArgument = unknown
> = AddListenerOverloads<UnsubscribeListener, State, Dispatch, ExtraArgument>

/** @public
 * A "pre-typed" version of `middleware.stopListening`, so the listener args are well-typed */
export type TypedStopListening<
  State,
  Dispatch extends ReduxDispatch<AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >
> = RemoveListenerOverloads<State, Dispatch>

/** @public
 * A "pre-typed" version of `createListenerEntry`, so the listener args are well-typed */
export type TypedCreateListenerEntry<
  State,
  Dispatch extends ReduxDispatch<AnyAction> = ThunkDispatch<
    State,
    unknown,
    AnyAction
  >
> = AddListenerOverloads<ListenerEntry<State, Dispatch>, State, Dispatch>

/**
 * Internal Types
 */

/** @internal An single listener entry */
export type ListenerEntry<
  State = unknown,
  Dispatch extends ReduxDispatch<AnyAction> = ReduxDispatch<AnyAction>
> = {
  id: string
  effect: ListenerEffect<any, State, Dispatch>
  unsubscribe: () => void
  pending: Set<AbortController>
  type?: string
  predicate: ListenerPredicate<AnyAction, State>
}

/**
 * @internal
 * A shorthand form of the accepted args, solely so that `createListenerEntry` has validly-typed conditional logic when checking the options contents
 */
export type FallbackAddListenerOptions = {
  actionCreator?: TypedActionCreator<string>
  type?: string
  matcher?: MatchFunction<any>
  predicate?: ListenerPredicate<any, any>
} & { effect: ListenerEffect<any, any, any> }

/**
 * Utility Types
 */

/** @public */
export type GuardedType<T> = T extends (
  x: any,
  ...args: unknown[]
) => x is infer T
  ? T
  : never

/** @public */
export type ListenerPredicateGuardedActionType<T> = T extends ListenerPredicate<
  infer Action,
  any
>
  ? Action
  : never
