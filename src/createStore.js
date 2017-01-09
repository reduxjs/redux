import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import createEvent from './createEvent'

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify
 * it to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must
 * be an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify
 * it to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(
  reducer,
  preloadedState,
  classicEnhancer,
  modernEnhancers,
) {
  if (typeof preloadedState === 'function'
    && typeof classicEnhancer === 'undefined'
    && typeof modernEnhancers === 'undefined'
  ) {
    return createStore(reducer, undefined, preloadedState)
  }

  if (typeof classicEnhancer !== 'undefined'
    && typeof modernEnhancers !== 'undefined'
  ) {
    throw new Error(
      `Expected either 'classicEnhancer' or 'modernEnhancers' to be undefined.`
    )
  }

  if (typeof classicEnhancer === 'function') {
    return classicEnhancer(createStore)(reducer, preloadedState)
  } else if (typeof classicEnhancer !== 'undefined') {
    throw new Error(`Expected 'classicEnhancer' to be a function.`)
  }

  validateModernEnhancers(modernEnhancers)

  // The setter function for the `final` prop is hidden from store enhancers,
  // because setting the `finalStore` should only be done by `createStore`.
  const { set: setFinal, ...finalPropDescriptor } = createFinalStoreProp()

  // Building a store is defined as running a series of store enhancers. They
  // are run in last->first order to maintain consistency with `compose` and
  // `applyMiddleware`.
  const allEnhancers = [
    makeStoreInitializeStateViaDispatch,
    blockReducerFromAccessingStore,
    ...(modernEnhancers || []),
    makeStoreObservable,
    createBaseStore,
  ]
  const finalStore = allEnhancers.reduceRight((store, enhancer) => {
    // Each enhancer receives the store as it exists after the previous enhancer
    // has run. It cannot modify that store directly, since it has been frozen.
    // It must return a new (partial) store that is then merged with the current
    // store. This prevents an enhancer from omitting any properties that were
    // previously defined; it can only add/override properties.
    Object.defineProperty(store, 'final', finalPropDescriptor)
    Object.freeze(store)
    const enhancements = enhancer(store)
    return { ...store, ...enhancements }
  }, {})

  setFinal(Object.freeze(finalStore))

  // Once the final store has been constructed, `init` is called. Any enhancer
  // can use `init` as a chance to do its initialization work; for example,
  // subscribing to the store, or changing the values of reducer/preloadedState.
  finalStore.init(Object.freeze({ reducer, preloadedState }))

  // Certain properties made available to the store enhancers are omitted from
  // the public store API, since they should not be called by application code.
  const publicStore = { ...finalStore }
  delete publicStore.final
  delete publicStore.init
  delete publicStore.onChange
  delete publicStore.reducer
  return Object.freeze(publicStore)
}

export function validateModernEnhancers(modernEnhancers) {
  if (typeof modernEnhancers === 'undefined') return

  if (!Array.isArray(modernEnhancers)) {
    throw new Error(`Expected 'modernEnhancers' to be an array of functions.`)
  }

  if (!modernEnhancers.every(func => typeof func === 'function')) {
    throw new Error(`Expected 'modernEnhancers' to be an array of functions.`)
  }
}

// Each store enhancer receives a store with a `final` prop. The value of this
// prop gets backfilled with the final store object once all the enhancers have
// run. This allows an enhancer to rely on enhancements provided by an enhancer
// later in the chain.
//
// For example, `dispatch` can rely on `store.final.onChange`, instead of
// `store.onChange`, allowing enhancers to override the `onChange` behavior that
// exists when `dispatch` gets defined.
//
// The getter/setter functions for this prop are defined outside of
// `createStore` so that the closures don't capture any of the args/variables
// from `createStore`. The property descriptor is defined with
// `enumerable: false` so that the getter doesn't get accidentally called when
// doing `{ ...store, ...enhancements }`.
function createFinalStoreProp() {
  let finalStore = undefined
  return {
    configurable: false,
    enumerable: false,
    get() {
      if (finalStore) return finalStore
      throw new Error(`Cannot access 'store.final' during the build phase.`)
    },
    set(value) {
      finalStore = value
    },
  }
}

function createBaseStore(store) {
  let currentReducer = uninitializedReducer
  let currentState = undefined

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will be
   * considered the **next** state of the tree, and the change listeners will be
   * notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is a
   * good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    validateAction(action)
    currentState = store.final.reducer(currentState, action)
    store.final.onChange()
    return action
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState
  }

  function init({ preloadedState, reducer }) {
    if (typeof reducer !== 'function') {
      throw new Error('Expected the reducer to be a function.')
    }
    currentReducer = reducer
    currentState = preloadedState
  }

  function reducer(...args) {
    return currentReducer(...args)
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }
    currentReducer = nextReducer
  }

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
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()`
   * before the listener is called. It is, however, guaranteed that all
   * subscribers registered before the `dispatch()` started will be called
   * with the latest state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  const { subscribe, invoke: onChange } = createEvent()

  return {
    dispatch,
    getState,
    init,
    onChange,
    reducer,
    replaceReducer,
    subscribe
  }
}

function uninitializedReducer() {
  throw new Error('Reducer has not been initialized.')
}

function validateAction(action) {
  if (!isPlainObject(action)) {
    throw new Error(
      'Actions must be plain objects. ' +
      'Use custom middleware for async actions.'
    )
  }

  if (typeof action.type === 'undefined') {
    throw new Error(
      'Actions may not have an undefined "type" property. ' +
      'Have you misspelled a constant?'
    )
  }
}

function blockReducerFromAccessingStore(store) {
  const messages = {
    forbiddenDispatch:
      'Reducers may not dispatch actions.',

    forbiddenGetState:
      'You may not call store.getState() while the reducer is executing. The'
      + ' reducer has already received the state as an argument. Pass it down'
      + ' from the top reducer instead of reading it from the store.',

    forbiddenSubscribe:
      'You may not call store.subscribe() while the reducer is executing. If'
      + ' you would like to be notified after the store has been updated,'
      + ' subscribe from a component and invoke store.getState() in the'
      + ' callback to access the latest state. See'
      + ' http://redux.js.org/docs/api/Store.html#subscribe for more details.',

    forbiddenUnsubscribe:
      'You may not unsubscribe from a store listener while the reducer is'
      + ' executing. See http://redux.js.org/docs/api/Store.html#subscribe for'
      + ' more details.',
  }

  let runningReducer = 0

  function blockReducer(message) {
    if (runningReducer) {
      throw new Error(message)
    }
  }

  function reducer(...args) {
    try {
      runningReducer += 1
      return store.reducer(...args)
    } finally {
      runningReducer -= 1
    }
  }

  function dispatch(...args) {
    blockReducer(messages.forbiddenDispatch)
    return store.dispatch(...args)
  }

  function getState(...args) {
    blockReducer(messages.forbiddenGetState)
    return store.getState(...args)
  }

  function wrapUnsubscribe(baseUnsubscribe) {
    return function unsubscribe(...args) {
      blockReducer(messages.forbiddenUnsubscribe)
      return baseUnsubscribe(...args)
    }
  }

  function subscribe(...args) {
    blockReducer(messages.forbiddenSubscribe)
    const baseSubscribe = store.subscribe(...args)
    return wrapUnsubscribe(baseSubscribe)
  }

  return { dispatch, getState, reducer, subscribe }
}

function makeStoreInitializeStateViaDispatch(store) {
  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.

  function init(...args) {
    store.init(...args)
    store.final.dispatch({ type: ActionTypes.INIT })
  }

  function replaceReducer(...args) {
    store.replaceReducer(...args)
    store.final.dispatch({ type: ActionTypes.INIT })
  }

  return { init, replaceReducer }
}

function makeStoreObservable(store) {
  /**
   * The minimal observable subscription method.
   * @param {Object} observer Any object that can be used as an observer.
   * The observer object should have a `next` method.
   * @returns {subscription} An object with an `unsubscribe` method that can
   * be used to unsubscribe the observable from the store, and prevent further
   * emission of values from the observable.
   */
  function subscribe(observer) {
    if (typeof observer !== 'object') {
      throw new TypeError('Expected the observer to be an object.')
    }

    function observeState() {
      if (observer.next) {
        const state = store.final.getState()
        observer.next(state)
      }
    }

    observeState()
    const unsubscribe = store.final.subscribe(observeState)
    return { unsubscribe }
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    return {
      subscribe,
      [$$observable]() {
        return this
      }
    }
  }

  return { [$$observable]: observable }
}
