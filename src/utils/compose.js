/**
 * Composes functions from left to right.
 *
 * @param {...Function} funcs - The functions to compose.
 * @returns {Function} A function that passes its only argument to the first of
 * the `funcs`, then pipes its return value to the second one, and so on, until
 * the last of the `funcs` is called, and its result is returned.
 */
export default function compose(...funcs) {
  return funcs.reduceRight((composed, f) => f(composed));
}
