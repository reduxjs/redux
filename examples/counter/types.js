/* @flow */
export type State = number;

export type Action =
  // Need to explicitly put this here due to a bug in Flow: https://github.com/facebook/flow/issues/582
  { type: '@@redux/INIT'} |
  { type: 'INCREMENT_COUNTER' } |
  { type: 'DECREMENT_COUNTER' };
