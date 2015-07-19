/* @flow */
/*eslint-disable */
import type { Dispatch, Middleware } from '../types';
type StoreMethods = { dispatch: Dispatch, getState: () => State };
/*eslint-enable */

import compose from './compose';

/**
 * Compose middleware from left to right
 * @param  {...Function} middlewares
 * @return {Function}
 */
export default function composeMiddleware(
  ...middlewares: Array<Middleware>
): Middleware {
  return (methods: StoreMethods) => (next: Dispatch) =>
    compose(...middlewares.map(m => m(methods)), next);
}
