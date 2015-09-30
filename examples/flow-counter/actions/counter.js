/* @flow */

import type { Action, AppState } from '../types';

type Thunk<S, D> = reduxThunk$Thunk<S, D>;

export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

export function increment() : Action {
  return {
    type: INCREMENT_COUNTER
  };
}

export function decrement() : Action {
  return {
    type: DECREMENT_COUNTER
  };
}

export function incrementIfOdd() : Thunk<AppState, Action> {
  return (dispatch, getState) => {
    let { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

export function incrementAsync(delay: number = 1000) : Thunk<AppState, Action> {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment());
    }, delay);
  };
}
