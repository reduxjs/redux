import React from 'react'
import { render } from 'react-dom'
import { Simulate, createRenderer, findRenderedDOMComponentWithTag } from 'react-addons-test-utils'
import Todo from  '../../components/Todo'
import { expect } from 'chai'
import { wrap } from 'react-stateless-wrapper'

describe('Todo', () => {
  let renderer
  const anyText = 'text'
  let node

  beforeEach(() => {
    renderer = createRenderer()
    node = document.createElement('div')
  })

  it('should be crossed out when it is completed', () => {
    renderer.render(
      <Todo
        completed = {true}>
        {anyText}
      </Todo>
    )

    const result = renderer.getRenderOutput()
    expect(result.props.style).to.deep.equal({ textDecoration: 'line-through' })
  })

  it('should be displayed as normal text when it is not completed', () => {
    renderer.render(
      <Todo
        completed = {false}>
        {anyText}
      </Todo>
    )

    const result = renderer.getRenderOutput()
    expect(result.props.style).to.deep.equal({ textDecoration: 'none' })
  })

  it('should receive onClick event when click on the todo', (done) => {
    const WrappedTodo = wrap(Todo)
    const component = render((
      <WrappedTodo
        completed = {anyBoolean()}
        onClick = {() =>
          done()
        }>
        {anyText}
      </WrappedTodo>
    ), node)

    const li = findRenderedDOMComponentWithTag(component, 'li')
    Simulate.click(li)
  })

  function anyBoolean() {
    return Math.random() < .5
  }
})
