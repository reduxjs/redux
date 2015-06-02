import { ADD_TODO } from '../constants/ActionTypes';

const initialState = {
  todos: [{
    text: 'do something',
    id: 0
  }]
};

export function todoStore(state = initialState, action) {
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
