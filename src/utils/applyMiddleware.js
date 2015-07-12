import compose from './compose';
import composeMiddleware from './composeMiddleware';

/**
 * Creates a higher-order store that applies middleware to a store's dispatch.
 * Because middleware is potentially asynchronous, this should be the first
 * higher-order store in the composition chain.
 * @param {...Function} ...middlewares
 * @return {Function} A higher-order store
 */
export default function applyMiddleware(...middlewares) {
  return next => (...args) => {
    const store = next(...args);
    const middleware = composeMiddleware(...middlewares);

    function dispatch(action) {
      const methods = {
        dispatch,
        getState: store.getState
      };

      return compose(
        middleware(methods),
        store.dispatch
      )(action);
    }

    return {
      ...store,
      dispatch
    };
  };
}
