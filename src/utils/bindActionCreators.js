/* @flow */

import mapValues from '../utils/mapValues';

import type { Dispatch } from '../types';

export default function bindActionCreators(
  actionCreators: Object, dispatch: Dispatch
): Object {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatch(actionCreator(...args))
  );
}
