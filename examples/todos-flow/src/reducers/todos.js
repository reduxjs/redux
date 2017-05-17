// @flow

import type { Todos, Todo, Id, Text } from '../types/todos';
import type { Action } from '../types';

const createTodo = (id: Id, text: Text): Todo => ({
  id,
  text,
  completed: false
});

const toggleTodo = (todos: Todos, id: Id): Todos =>
  todos.map(t => (t.id !== id ? t : { ...t, completed: !t.completed }));

const todos = (state: Todos = [], action: Action): Todos => {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, createTodo(action.id, action.text)];
    case 'TOGGLE_TODO':
      return toggleTodo(state, action.id);
    default:
      return state;
  }
};

export default todos;
