import compose from './compose';

/**
 * Compose middleware from left to right
 * @param  {...Function} middlewares
 * @return {Function}
 */
export default function composeMiddleware(...middlewares) {
  return methods => next => compose(...middlewares.map(m => m(methods)), next);
}
