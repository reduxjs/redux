import compose from './compose';
import composeMiddleware from './composeMiddleware';
import thunk from '../middleware/thunk';

/**
 * Creates a higher-order store that applies middleware to a store's dispatch.
 * Because middleware is potentially asynchronous, this should be the first
 * higher-order store in the composition chain.
 * @param {...Function} ...middlewares
 * @return {Function} A higher-order store
 */
export default function applyMiddleware(...middlewares) {
  const finalMiddlewares = middlewares.length ?
    middlewares :
    [thunk];

  return next => (...args) => {
    const store = next(...args);
    const methods = {
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
