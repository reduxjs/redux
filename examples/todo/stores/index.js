import { ADD_TODO } from '../constants/ActionTypes';

export function TodoStore(state, action) {
  if (!state) {
    return {
      todos: [{
        text: 'do something',
        id: 0
      }]
    };
  }

  switch (action.type) {
  case ADD_TODO:
    return {
      todos: [{
        id: state.todos[0].id + 1,
        text: action.text
      }].concat(state.todos)
    };
  }

  return state;
}
