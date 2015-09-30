/* @flow */

import type { ReduxAction } from 'redux';
// import type { ThunkMiddlewareDispatchable } from 'redux-thunk';
type ThunkMiddlewareDispatchable<S, D> = reduxThunk$ThunkMiddlewareDispatchable<S, D>;

export type CounterState = number;

export type AppState = {
  counter: CounterState
}

type AppAction =
  { type: 'INCREMENT_COUNTER' } |
  { type: 'DECREMENT_COUNTER' };

export type Action = ReduxAction<AppAction>;

export type Dispatchable = ThunkMiddlewareDispatchable<AppState, Action>;
