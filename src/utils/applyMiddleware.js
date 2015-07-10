/* @flow */

import compose from './compose';
import composeMiddleware from './composeMiddleware';
import thunk from '../middleware/thunk';

import type { Middleware, Dispatch, CreateStore } from '../types';

/**
 * Creates a higher-order store that applies middleware to a store's dispatch.
 * Because middleware is potentially asynchronous, this should be the first
 * higher-order store in the composition chain.
 * @param {...Function} ...middlewares
 * @return {Function} A higher-order store
 */
export default function applyMiddleware(
  ...middlewares: Array<Middleware>
): Dispatch {
  var finalMiddlewares = middlewares.length ?
    middlewares :
    [thunk];

  return (next: CreateStore) => (...args) => {
    var store = next(...args);
    var methods = {
      dispatch: store.dispatch,
      getState: store.getState
    };
    return {
      ...store,
      dispatch: compose(
        composeMiddleware(...finalMiddlewares)(methods),
        store.dispatch
      )
    };
  };
}
