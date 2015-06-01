import { ADD_TODO } from '../constants/ActionTypes';

export function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  };
}
