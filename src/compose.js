/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {Function} first The leftmost function to compose, defaults to
 * arg => arg if not provided
 * @param {...Function} funcs The rest of the functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(first = arg => arg, ...funcs) {
  return funcs.reduce((a, b) => (...args) => a(b(...args)), first)
}
