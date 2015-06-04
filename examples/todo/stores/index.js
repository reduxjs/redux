import { ADD_TODO } from '../constants/ActionTypes';

const initialState = [{
  text: 'do something',
  id: 0
}];

export function todoStore(todos = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: todos[0].id + 1,
      text: action.text
    }, ...todos];
  }

  return todos;
}
