/* @flow */

import type { CounterState, Action } from '../types';

export default function counter(state?: CounterState = 0, action: Action) : CounterState {
  switch (action.type) {
  case 'INCREMENT_COUNTER':
    return state + 1;
  case 'DECREMENT_COUNTER':
    return state - 1;
  default:
    return state;
  }
}
