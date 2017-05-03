import React from 'react'
import TestUtils from 'react-addons-test-utils'
import expect from 'expect'

import App from '../../components/App'
import Footer from '../../components/Footer'
import AddTodo from '../../containers/AddTodo'
import VisibleTodoList from '../../containers/VisibleTodoList'

function setup() {
  const renderer = TestUtils.createRenderer()
  renderer.render(<App />)
  return renderer.getRenderOutput()
}

describe('Components', () => {
  describe('App', () => {
    it('Displays correct content', () => {
      const children = setup().props.children
      expect(children[0].type).toBe(AddTodo)
      expect(children[1].type).toBe(VisibleTodoList)
      expect(children[2].type).toBe(Footer)
    })
  })
})
