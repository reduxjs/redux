// @flow

import type { Id, Text, TodosAction } from '../types/todos';

let nextTodoId: Id = 0;

export const addTodo = (text: Text): TodosAction => {
  return {
    type: 'ADD_TODO',
    id: nextTodoId++,
    text
  };
};

export const toggleTodo = (id: Id): TodosAction => {
  return {
    type: 'TOGGLE_TODO',
    id
  };
};
