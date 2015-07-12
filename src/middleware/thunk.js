/* @flow */

import type { Dispatch, State, Action } from '../types';

type StoreMethods = { dispatch: Dispatch, getState: () => State };

export default function thunkMiddleware(storeMethods: StoreMethods): Dispatch {
  var { dispatch, getState } = storeMethods;
  return (next: Dispatch) => (action: Action) =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}
