/**
 * Composes functions from left to right
 * @param  {...Function} funcs - Functions to compose
 * @return {Function}
 */
export default function compose(...funcs) {
  return funcs.reduceRight((composed, f) => f(composed));
}
