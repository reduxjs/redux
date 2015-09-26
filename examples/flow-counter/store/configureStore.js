/* @flow */

import { createStore, applyMiddleware } from 'redux';
import type { Middleware, MiddlewareAPI, Dispatch, Store, ReduxAction } from 'redux';
// import thunk from 'redux-thunk';
import type { Thunk, ThunkMiddlewareDispatchable } from 'redux-thunk';
import reducer from '../reducers';
import type { AppState, Action } from '../types';

// Re-defining redux-thunk here first to show how to type it, and also
// because I don't know how to put the type in the declaration module.
function thunk<State, Dispatchable: Object>(_ref: MiddlewareAPI<State, ThunkMiddlewareDispatchable<State, Dispatchable>>) : (next: Dispatch<Dispatchable>) => Dispatch<ThunkMiddlewareDispatchable<State, Dispatchable>> {
  var dispatch = _ref.dispatch;
  var getState = _ref.getState;

  return function (next) {
    return function (action: ThunkMiddlewareDispatchable<State, Dispatchable>) : ?ThunkMiddlewareDispatchable<State, Dispatchable> {
      return typeof action === 'function' ? action(dispatch, getState) : next(action);
    };
  };
}

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore);

export default function configureStore(initialState?: AppState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
