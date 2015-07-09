/**
 * Given a list of middlewares, compose them from left to right.
 *
 * @param  {Array} middlewares - a list of middleware functions
 * @return {Function} the combined middleware function
 */
export default function composeMiddleware(...middlewares) {
  return middlewares.reduceRight((composed, m) => m(composed));
}
