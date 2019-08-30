/// <reference types="symbol-observable" />
import { Dispatch, PreloadedState } from '../..'
import { Action, AnyAction } from './actions'
import { Reducer } from './reducers'

/**
 * Function to remove listener added by `Store.subscribe()`.
 */
export interface Unsubscribe {
  (): void
}

/**
 * A minimal observable of state changes.
 * For more information, see the observable proposal:
 * https://github.com/tc39/proposal-observable
 */
export type Observable<T> = {
  /**
   * The minimal observable subscription method.
   * @param {Object} observer Any object that can be used as an observer.
   * The observer object should have a `next` method.
   * @returns {subscription} An object with an `unsubscribe` method that can
   * be used to unsubscribe the observable from the store, and prevent further
   * emission of values from the observable.
   */
  subscribe: (observer: Observer<T>) => { unsubscribe: Unsubscribe }
  [Symbol.observable](): Observable<T>
}

/**
 * An Observer is used to receive data from an Observable, and is supplied as
 * an argument to subscribe.
 */
export type Observer<T> = {
  next?(value: T): void
}

/**
 * A store is an object that holds the application's state tree.
 * There should only be a single store in a Redux app, as the composition
 * happens on the reducer level.
 *
 * @template S The type of state held by this store.
 * @template A the type of actions which may be dispatched by this store.
 */
export interface Store<S = any, A extends Action = AnyAction> {
  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will be
   * considered the **next** state of the tree, and the change listeners will
   * be notified.
   *
   * The base implementation only supports plain object actions. If you want
   * to dispatch a Promise, an Observable, a thunk, or something else, you
   * need to wrap your store creating function into the corresponding
   * middleware. For example, see the documentation for the `redux-thunk`
   * package. Even the middleware will eventually dispatch plain object
   * actions using this method.
   *
   * @param action A plain object representing “what changed”. It is a good
   *   idea to keep actions serializable so you can record and replay user
   *   sessions, or use the time travelling `redux-devtools`. An action must
   *   have a `type` property which may not be `undefined`. It is a good idea
   *   to use string constants for action types.
   *
   * @returns For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  dispatch: Dispatch<A>

  /**
   * Reads the state tree managed by the store.
   *
   * @returns The current state tree of your application.
   */
  getState(): S

  /**
   * Adds a change listener. It will be called any time an action is
   * dispatched, and some part of the state tree may potentially have changed.
   * You may then call `getState()` to read the current state tree inside the
   * callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked,
   * this will not have any effect on the `dispatch()` that is currently in
   * progress. However, the next `dispatch()` call, whether nested or not,
   * will use a more recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all states changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param listener A callback to be invoked on every dispatch.
   * @returns A function to remove this change listener.
   */
  subscribe(listener: () => void): Unsubscribe

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param nextReducer The reducer for the store to use instead.
   */
  replaceReducer<NewState = S, NewActions extends A = A>(
    nextReducer: Reducer<NewState, NewActions>
  ): Store<NewState, NewActions>

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  [Symbol.observable](): Observable<S>
}

/**
 * A store creator is a function that creates a Redux store. Like with
 * dispatching function, we must distinguish the base store creator,
 * `createStore(reducer, preloadedState)` exported from the Redux package, from
 * store creators that are returned from the store enhancers.
 *
 * @template S The type of state to be held by the store.
 * @template A The type of actions which may be dispatched.
 * @template Ext Store extension that is mixed in to the Store type.
 * @template StateExt State extension that is mixed into the state type.
 */
export interface StoreCreator {
  <S, A extends Action, Ext, StateExt>(
    reducer: Reducer<S, A>,
    enhancer?: StoreEnhancer<Ext, StateExt>
  ): Store<S & StateExt, A> & Ext
  <S, A extends Action, Ext, StateExt>(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>,
    enhancer?: StoreEnhancer<Ext>
  ): Store<S & StateExt, A> & Ext
}

/**
 * A store enhancer is a higher-order function that composes a store creator
 * to return a new, enhanced store creator. This is similar to middleware in
 * that it allows you to alter the store interface in a composable way.
 *
 * Store enhancers are much the same concept as higher-order components in
 * React, which are also occasionally called “component enhancers”.
 *
 * Because a store is not an instance, but rather a plain-object collection of
 * functions, copies can be easily created and modified without mutating the
 * original store. There is an example in `compose` documentation
 * demonstrating that.
 *
 * Most likely you'll never write a store enhancer, but you may use the one
 * provided by the developer tools. It is what makes time travel possible
 * without the app being aware it is happening. Amusingly, the Redux
 * middleware implementation is itself a store enhancer.
 *
 * @template Ext Store extension that is mixed into the Store type.
 * @template StateExt State extension that is mixed into the state type.
 */
export type StoreEnhancer<Ext = {}, StateExt = {}> = (
  next: StoreEnhancerStoreCreator
) => StoreEnhancerStoreCreator<Ext, StateExt>
export type StoreEnhancerStoreCreator<Ext = {}, StateExt = {}> = <
  S = any,
  A extends Action = AnyAction
>(
  reducer: Reducer<S, A>,
  preloadedState?: PreloadedState<S>
) => Store<S & StateExt, A> & Ext
