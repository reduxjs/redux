import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'

import TodoList from '../../components/TodoList'
import Todo from '../../components/Todo'

function setup(propsOveride) {
  const renderer = TestUtils.createRenderer()
  renderer.render(
    <TodoList
      todos={[
        {
          id: 1,
          completed: false,
          text: 'Request a raise'
        }
      ]}
      onTodoClick={() => {}}
      {...propsOveride}
    />
  )
  return renderer.getRenderOutput()
}

describe('Components', () => {
  describe('TodoList', () => {
    it('Renders a list of todo items', () => {
      const output = setup()
      expect(output.type).toBe('ul')

      const children = output.props.children
      expect(children[0].type).toBe(Todo)
    })

    it('Passes onTodoClick to each child', () => {
      let hasFired = false
      const output = setup({
        onTodoClick() {
          hasFired = true
        }
      })

      const children = output.props.children
      children[0].props.onClick()
      expect(hasFired).toBe(true)
    })
  })
})
