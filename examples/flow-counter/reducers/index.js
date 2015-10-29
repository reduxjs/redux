/* @flow */

import counter from './counter';
import type { AppState, Action } from '../types';

export default function rootReducer(state?: AppState, action : Action) : AppState {
  return {
    counter: counter(state && state.counter, action)
  };
}
