import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';

const initialState = { counter: 0 };

function increment({ counter }) {
  return { counter: counter + 1 };
}

function decrement({ counter }) {
  return { counter: counter - 1 };
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
