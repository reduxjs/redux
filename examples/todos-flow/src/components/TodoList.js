// @flow

import React from 'react';

import Todo from './Todo';

import type { Todos, Id } from '../types/todos';

export type Props = {
  todos: Todos,
  onTodoClick: (id: Id) => void
};

const TodoList = ({ todos, onTodoClick }: Props) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    ))}
  </ul>
);

export default TodoList;
