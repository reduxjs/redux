import { ADD_TODO, BAD_TODO, BAD_TODO_ERROR } from './actionTypes';


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

export function antipatternTodo(state = [], action) {
  switch (action.type) {
  case BAD_TODO:
    action.boundDispatchFn();
    return state;
  default:
    return state;
  }
}

export function antipatternTodoWithError(state = [], action) {
  switch (action.type) {
  case BAD_TODO_ERROR:
    throw new Error();
  default:
    return state;
  }
}
