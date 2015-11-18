/**
 * Composes single-argument functions from right to left.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing functions from right to
 * left. For example, compose(f, g, h) is identical to arg => f(g(h(arg))).
 */
export default function compose(...funcs) {
  return (...args) => funcs.slice(0, -1).reduceRight((composed, f) =>
    f(composed), funcs[funcs.length - 1](...args)
  )
}
