import { ADD_TODO, DELETE_TODO, EDIT_TODO, MARK_TODO, MARK_ALL, CLEAR_MARKED } from '../constants/ActionTypes';

export function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  };
}

export function deleteTodo(id) {
  return {
    type: DELETE_TODO,
    id
  };
}

export function editTodo(id, text) {
  return {
    type: EDIT_TODO,
    id,
    text
  };
}

export function markTodo(id) {
  return {
    type: MARK_TODO,
    id
  };
}

export function markAll() {
  return {
    type: MARK_ALL
  };
}

export function clearMarked() {
  return {
    type: CLEAR_MARKED
  };
}
