/* @flow */
/*eslint-disable */
import type { Dispatch } from '../index';
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
