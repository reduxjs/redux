import { ADD_TODO } from './actionTypes';

export function addTodo(text) {
  return { type: ADD_TODO, text };
}

export function addTodoAsync(text) {
  return dispatch => new Promise(resolve => setImmediate(() => {
    dispatch(addTodo(text));
    resolve();
  }));
}

export function addTodoIfEmpty(text) {
  return (dispatch, getState) => {
    if (!getState().length) {
      dispatch(addTodo(text));
    }
  };
}
