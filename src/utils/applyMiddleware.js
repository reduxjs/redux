/* @flow */
/*eslint-disable */
import type { Dispatch, CreateStore, Middleware } from '../types';
/*eslint-enable */

import compose from './compose';
import composeMiddleware from './composeMiddleware';

/**
 * Creates a higher-order store that applies middleware to a store's dispatch.
 * Because middleware is potentially asynchronous, this should be the first
 * higher-order store in the composition chain.
 * @param {...Function} ...middlewares
 * @return {Function} A higher-order store
 */
export default function applyMiddleware(
  ...middlewares: Array<Middleware>
): CreateStore {
  return (next: CreateStore) => (reducer, initialState) => {
    var store = next(reducer, initialState);
    var middleware = composeMiddleware(...middlewares);
    var composedDispatch = null;

    function dispatch(action) {
      return composedDispatch(action);
    }

    var methods = {
      dispatch,
      getState: store.getState
    };

    composedDispatch = compose(middleware(methods), store.dispatch);

    return {
      ...store,
      dispatch
    };
  };
}
