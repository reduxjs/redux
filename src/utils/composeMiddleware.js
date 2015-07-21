/* @flow */
/*eslint-disable */
import type { Dispatch, Middleware, MiddlewareArgs } from '../index';
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
  return (args: MiddlewareArgs) => (next: Dispatch) => {
    var dispatchChain = middlewares.map(middleware => middleware(args));
    dispatchChain.push(next);
    return compose.apply(null, dispatchChain);
  };
}
