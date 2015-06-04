import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';

export default function counterStore(counter = 0, action) {
  switch (action.type) {
  case INCREMENT_COUNTER:
    return counter + 1;
  case DECREMENT_COUNTER:
    return counter - 1;
  default:
    return counter;
  }
}
