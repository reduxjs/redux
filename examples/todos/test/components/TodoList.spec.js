import React from 'react'
import { createRenderer } from 'react-addons-test-utils'
import TodoList from '../../src/components/TodoList'
import TodoFactory from  '../../src/components/TodoFactory'
import { expect } from 'chai'

describe('TodoList', () => {
  let renderer

  beforeEach(() => {
    renderer = createRenderer()
  })

  it('should display a collection of todos', () => {
    const todos = [todo(1), todo(2), todo(3)]
    const todoFactory = new MockTodoFactory()
    renderer.render(
      <TodoList
        todos = {todos}
        todoFactory = {todoFactory}/>
    )

    const result = renderer.getRenderOutput()
    expect(result.props.children).to.have.lengthOf(todos.length)
  })

  function todo(id) {
    return {id, text: 'text', completed: true}
  }

  class MockTodoFactory extends TodoFactory {
    constructor() {
      super(()=>{})
    }
    create(todo) {
      return(
        <li key={todo.id}>{todo.id}</li>
      )
    }
  }
})