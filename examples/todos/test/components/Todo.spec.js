import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'

import Todo from '../../components/Todo'

function setup(propsOveride) {
  const renderer = TestUtils.createRenderer()
  renderer.render(
    <Todo
      onClick={() => {}}
      completed={false}
      text={'Call Jon Tewksbury'}
      {...propsOveride}
    />
  )
  return renderer.getRenderOutput()
}

describe('Components', () => {
  describe('Todo', () => {
    it('Displays text passed in', () => {
      const output = setup()
      expect(output.props.children).toBe('Call Jon Tewksbury')
    })

    it('Fires onClick passed in', () => {
      let hasFired = false
      const output = setup({
        onClick() {
          hasFired = true
        }
      })
      output.props.onClick()

      expect(hasFired).toBe(true)
    })

    it('Crosses through text when completed', () => {
      const notCompleted = setup()
      expect(notCompleted.props.style.textDecoration).toBe('none')

      const completed = setup({
        completed: true
      })
      expect(completed.props.style.textDecoration).toBe('line-through')
    })
  })
})
