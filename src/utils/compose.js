/* @flow */

/**
 * Composes functions from left to right
 * @param  {...Function} funcs - Functions to compose
 * @return {Function}
 */
export default function compose(...funcs: Array<Function>): Function {
  return funcs.reduceRight((composed, f) => f(composed));
}
