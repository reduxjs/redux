const ADD_TODO = 'ADD_TODO';
const ADD_TODO_ASYNC = 'ADD_TODO_ASYNC';

export const initialState = [];
export const defaultText = 'Hello World!';
export const constants = { ADD_TODO, ADD_TODO_ASYNC };

export function todoStore(state = initialState, action) {
  const { type } = action;
  if (type === ADD_TODO || type === ADD_TODO_ASYNC) {
    return [{
      id: state[0] ? state[0].id + 1 : 1,
      text: action.text
    }, ...state];
  }
  return state;
}

export const todoActions = {
  addTodo(text) {
    return { type: ADD_TODO, text };
  },

  addTodoAsync(text, cb/* for testing only */) {
    return dispatch => {
      setImmediate(() => {
        dispatch({ type: ADD_TODO_ASYNC, text });
        cb();
      });
    };
  }
};
