import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';

export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

export function incrementIfOdd() {
  return (perform, { counter }) => {
    if (counter % 2 === 0) {
      return;
    }

    perform(increment());
  };
}

export function incrementAsync() {
  return perform => {
    setTimeout(() => {
      perform(increment());
    }, 1000);
  };
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}
