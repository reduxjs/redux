import React from 'react'
import { createRenderer } from 'react-addons-test-utils'
import TodoList from '../../components/TodoList'
import { expect } from 'chai'

describe('TodoList', () => {
  let renderer

  beforeEach(() => {
    renderer = createRenderer()
  })

  it('should display a collection of todos', () => {
    const todos = [ todo(1), todo(2), todo(3) ]
    renderer.render(
      <TodoList
        todos = {todos}
        displayTodo = {todo => (
          <li key={todo.id}>{todo.id}</li>
        )}/>
    )

    const result = renderer.getRenderOutput()
    expect(result.props.children).to.have.lengthOf(todos.length)
  })

  function todo(id) {
    return { id, text: 'text', completed: true }
  }
})
