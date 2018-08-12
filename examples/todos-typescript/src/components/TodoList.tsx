import * as React from "react";
import { TodoItem } from "../reducers/todos";
import Todo from "./Todo";

interface Props {
  todos: TodoItem[];
  toggleTodo(id: number): void;
}

const TodoList = ({ todos, toggleTodo }: Props) => (
  <ul>
    {todos.map(todo => (
      <Todo key={todo.id} {...todo} onClick={() => toggleTodo(todo.id)} />
    ))}
  </ul>
);

export default TodoList;
