import { ADD_TODO } from './actionTypes';


function id(state = []) {
  return state.reduce((result, item) => (
    item.id > result ? item.id : result
  ), 0) + 1;
}

export function todos(state = [], action) {
  switch (action.type) {
  case ADD_TODO:
    return [...state, {
      id: id(state),
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
      id: id(state),
      text: action.text
    }, ...state];
  default:
    return state;
  }
}
