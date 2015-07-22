/* @flow */
/*eslint-disable */
import type { State, Reducer, Action, IntermediateAction, Store } from './index';
/*eslint-enable */

import invariant from 'invariant';
import isPlainObject from './utils/isPlainObject';

// Don't ever try to handle these action types in your code. They are private.
// For any unknown actions, you must return the current state.
// If the current state is undefined, you must return the initial state.
export var ActionTypes = {
  INIT: '@@redux/INIT'
};

export default function createStore(
  reducer: Reducer,
  initialState: State
): Store {
  invariant(
    typeof reducer === 'function',
    'Expected the reducer to be a function.'
  );

  var currentReducer = reducer;
  var currentState = initialState;
  var listeners = [];

  function getState() {
    return currentState;
  }

  function subscribe(listener: Function) {
    listeners.push(listener);

    return function unsubscribe() {
      var index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function dispatch(action: Action) {
    invariant(
      isPlainObject(action),
      'Actions must be plain objects. Use custom middleware for async actions.'
    );

    currentState = currentReducer(currentState, action);
    listeners.forEach(listener => listener());
    return action;
  }

  function getReducer() {
    return currentReducer;
  }

  function replaceReducer(nextReducer: Reducer) {
    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  dispatch({ type: ActionTypes.INIT });

  return {
    dispatch,
    subscribe,
    getState,
    getReducer,
    replaceReducer
  };
}
