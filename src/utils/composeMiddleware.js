import compose from './compose';

/**
 * Compose middleware from left to right
 * @param  {...Function} middlewares
 * @return {Function}
 */
export default function composeMiddleware(...middlewares) {
  return args => rawDispatch => {
    var dispatchChain = middlewares.map(middleware => middleware(args));
    return compose(...dispatchChain, rawDispatch);
  };
}
