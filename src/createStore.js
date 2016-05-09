import isPlainObject from 'lodash/isPlainObject'
import $$observable from 'symbol-observable'

export var ActionTypes = {
  INIT: '@@redux/INIT'
}

function createStoreBase(reducer, initialState, onChange) {
  var currentState = initialState
  var isDispatching = false

  function getState() {
    return currentState
  }

  function dispatch(action) {
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = reducer(currentState, action)
    } finally {
      isDispatching = false
    }

    onChange()
    return action
  }

  return {
    dispatch,
    getState
  }
}

function coreEnhancer(nextCreateStoreBase) {
  return (reducer, initialState, onChange) => {
    const storeBase = nextCreateStoreBase(reducer, initialState, onChange)

    function dispatch(action) {
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
      return storeBase.dispatch(action)
    }

    function getState() {
      return storeBase.getState()
    }

    return {
      dispatch,
      getState
    }
  }
}

export default function createStore(reducer, initialState, enhancer) {
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  if (typeof initialState === 'function' && typeof enhancer === 'undefined') {
    enhancer = initialState
    initialState = undefined
  }
  if (typeof enhancer !== 'undefined' && typeof enhancer !== 'function') {
    throw new Error('Expected the enhancer to be a function.')
  }

  enhancer = enhancer || (x => x)
  var createFinalStoreBase = enhancer(coreEnhancer(createStoreBase))

  var storeBase
  var currentListeners = []
  var nextListeners = currentListeners

  function onChange() {
    var listeners = currentListeners = nextListeners
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]()
    }
  }

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    var isSubscribed = true
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false
      ensureCanMutateNextListeners()
      var index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    return storeBase.dispatch(action)
  }

  function getState() {
    return storeBase.getState()
  }

  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    var nextInitialState = storeBase ? getState() : initialState
    storeBase = createFinalStoreBase(nextReducer, nextInitialState, onChange)
    dispatch({ type: ActionTypes.INIT })
  }

  function observable() {
    return {
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }
        observeState()
        var unsubscribe = subscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  replaceReducer(reducer)

  return {
    dispatch,
    getState,
    subscribe,
    replaceReducer,
    [$$observable]: observable
  }
}
