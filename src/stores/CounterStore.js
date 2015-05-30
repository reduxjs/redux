import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';

export default function CounterStore(state, action) {
  if (!state) {
    return { counter: 0 };
  }

  switch (action.type) {
  case INCREMENT_COUNTER:
    return { counter: state.counter + 1 };
  case DECREMENT_COUNTER:
    return { counter: state.counter - 1 };
  default:
    return state;
  }
}
