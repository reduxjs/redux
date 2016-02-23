import React from 'react'
import autobind from 'autobind-decorator'
import Todo from './Todo'

@autobind
export class TodoFactory {
  constructor(onTodoClick) {
    this._onTodoClick = onTodoClick
  }

  create(todo) {
    return (
      <Todo
        key={todo.id}
        {...todo}
        onClick={() => this._onTodoClick(todo.id)}
      />
    )
  }
}
