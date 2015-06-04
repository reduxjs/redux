import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';

const initialState = 0;

function increment(counter) {
  return counter + 1;
}

function decrement(counter) {
  return counter - 1;
}

export default function counterStore(state = initialState, action) {
  switch (action.type) {
  case INCREMENT_COUNTER:
    return increment(state, action);
  case DECREMENT_COUNTER:
    return decrement(state, action);
  default:
    return state;
  }
}
