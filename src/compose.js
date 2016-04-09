/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */
 
export default function compose(...funcs) {
  const isEmpty = funcs.length === 0
  const last = isEmpty ? null : funcs[funcs.length - 1]
  const rest = isEmpty ? [] : funcs.slice(0, -1)
    
  return (...args) => {
    if (isEmpty) {
      return args[0]
    }else {
      return rest.reduceRight((composed, f) => f(composed), last(...args))
    }
  }
}
