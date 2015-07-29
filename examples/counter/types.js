/* @flow */
export type State = number;

export type Action =
  { type: '@@redux/INIT' } |
  { type: 'INCREMENT_COUNTER' } |
  { type: 'DECREMENT_COUNTER' };
