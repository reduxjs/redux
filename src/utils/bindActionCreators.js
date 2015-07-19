/* @flow */
/*eslint-disable */
import type { Dispatch } from '../types';
/*eslint-enable */

import mapValues from '../utils/mapValues';

export default function bindActionCreators(
  actionCreators: Object,
  dispatch: Dispatch
): Object {
  return mapValues(actionCreators, actionCreator =>
    (...args) => dispatch(actionCreator(...args))
  );
}
