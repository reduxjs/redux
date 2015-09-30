/* @flow */

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import type { ThunkMiddlewareDispatchable } from 'redux-thunk';
import reducer from '../reducers';
import type { AppState, Action } from '../types';

type ThunkMiddlewareDispatchable<S, D> = reduxThunk$ThunkMiddlewareDispatchable<S, D>;

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
