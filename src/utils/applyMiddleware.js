/* @flow */
/*eslint-disable */
import type {
  Dispatch, Middleware, Reducer, State,
  Store, CreateStore, HigherOrderStore
} from '../types';
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
): HigherOrderStore {
  return (next: CreateStore) => (reducer: Reducer, initialState: State) => {
    var store = next(reducer, initialState);
    var middleware = composeMiddleware(...middlewares);
    var composedDispatch = () => {};

    function dispatch(action) {
      return composedDispatch(action);
    }

    var middlewareAPI = {
      getState: store.getState,
      dispatch
    };

    composedDispatch = compose(
      middleware(middlewareAPI),
      store.dispatch
    );

    return {
      ...store,
      dispatch
    };
  };
}
