import { ADD_TODO } from './actionTypes';

export function todos(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [...state, {
      id: state.length ? state[state.length - 1].id + 1 : 1,
      text: action.text
    }];
  default:
    return state;
  }
}

export function todosReverse(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: state.length ? state[0].id + 1 : 1,
      text: action.text
    }, ...state];
  default:
    return state;
  }
}
