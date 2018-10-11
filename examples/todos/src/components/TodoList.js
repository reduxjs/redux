// @flow
import React from 'react'
import Todo from './Todo'

type todoProps = {
  id: number,
  completed: boolean,
  text: string,
  createdTime: string
}

type props = {
  todos: Array<todoProps>,
  toggleTodo: Function
}

const TodoList = ({ todos, toggleTodo }: props) => (
  <ul>
    {todos.map(todo =>
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => toggleTodo(todo.id)}
      />
    )}
  </ul>
)

export default TodoList
