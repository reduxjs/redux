import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';
import { counterStore } from '../stores';

export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

export function incrementIfOdd() {
  return (dispatch, read) => {
    if (read(counterStore) % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment());
    }, 1000);
  };
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}
