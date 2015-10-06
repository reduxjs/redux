/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
export default function compose(...funcs) {
  return arg => funcs
    .filter(Boolean)
    .reduceRight((composed, f) => f(composed), arg);
}
