import * as React from 'react';
import Todo from './Todo';
import { Todos, Id } from '../types/todos';

export type Props = {
  todos: Todos,
  onTodoClick: (id: Id) => void
};

const TodoList: React.SFC<Props> = ({ todos, onTodoClick }) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
    ))}
  </ul>
);

export default TodoList;
