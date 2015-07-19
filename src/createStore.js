/* @flow */
/*eslint-disable */
import type { State, Reducer, Store } from './types';
/*eslint-enable */

import invariant from 'invariant';
import isPlainObject from './utils/isPlainObject';

// Don't ever try to handle these action types in your code. They are private.
// For any unknown actions, you must return the current state.
// If the current state is undefined, you must return the initial state.
export const ActionTypes = {
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

  let currentReducer = null;
  let currentState = initialState;
  let listeners = [];

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  function dispatch(action) {
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

  function replaceReducer(nextReducer) {
    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  replaceReducer(reducer);

  return {
    dispatch,
    subscribe,
    getState,
    getReducer,
    replaceReducer
  };
}
