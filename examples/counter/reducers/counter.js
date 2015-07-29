/* @flow */

import type {State, Action} from '../types';

export default function counter(state: State, action: Action) : State {
  switch (action.type) {
  case 'INCREMENT_COUNTER':
    return state + 1;
  case 'DECREMENT_COUNTER':
    return state - 1;
  default:
    return state;
  }
}
