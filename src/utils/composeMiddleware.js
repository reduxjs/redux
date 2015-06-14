/* @flow */

import { Middleware, Dispatch } from '../types';

export default function compose(...middlewares: Middleware[]): Middleware {
  return middlewares.reduceRight(
    (composed: Middleware | Dispatch, m: Middleware | Dispatch) => m(composed)
  );
}
