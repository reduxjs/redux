/* @flow */

import type { ThunkMiddlewareDispatchable } from 'redux-thunk';
import type { ReduxAction } from 'redux';

export type CounterState = number;

export type AppState = {
  counter: CounterState
}

// Need to explicitly put this here due to a bug in Flow: https://github.com/facebook/flow/issues/582
export type Action =
  { type: '@@redux/INIT'} |
  { type: 'INCREMENT_COUNTER' } |
  { type: 'DECREMENT_COUNTER' };

export type Dispatchable = ThunkMiddlewareDispatchable<AppState, ReduxAction<Action>>;
