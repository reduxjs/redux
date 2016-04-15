import { head, tail, reverse, reduce } from 'lodash';

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
  if (funcs.length === 0) {
    return func => func;
  } else {
    reverse(funcs);
    const first = head(funcs);
    const rest = tail(funcs);
    return (...args) => reduce(rest, (composed, func) => func(composed), first(...args));
  }
}
