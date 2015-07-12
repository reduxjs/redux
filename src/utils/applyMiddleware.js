/* @flow */

import compose from './compose';
import composeMiddleware from './composeMiddleware';
import thunk from '../middleware/thunk';

/*eslint-disable */
import type { Dispatch, CreateStore, Middleware } from '../types';
/*eslint-enable */

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
    var middleware = composeMiddleware(...finalMiddlewares);
    return {
      ...store,
      dispatch: function dispatch(action) {
        var methods = { dispatch, getState: store.getState };

        return compose(
          middleware(methods),
          store.dispatch
        )(action);
      }
    };
  };
}
