import React from 'react'
import { render } from 'react-dom'
import { Simulate, findRenderedDOMComponentWithTag } from 'react-addons-test-utils'
import AddTodo from  '../../components/AddTodo'
import { expect } from 'chai'
import { wrap } from 'react-stateless-wrapper'

describe('AddTodo', () => {
  let node
  const WrappedTodo = wrap(AddTodo)

  beforeEach(() => {
    node = document.createElement('div')
  })

  it('submit should trigger onAddTodo with input text', (done) => {
    const text = 'text'
    const component = render((
      <WrappedTodo
        onAddTodo = {(received) => {
          expect(received).to.equal(text)
          done()
        }}
      />
    ), node)

    const input = findRenderedDOMComponentWithTag(component, 'input')
    const form = findRenderedDOMComponentWithTag(component, 'form')

    input.value = text
    Simulate.change(input)
    Simulate.submit(form)
  })

  it('input content should be cleared after submitted', (done) => {
    const text = 'text'
    const component = render((
      <WrappedTodo
        onAddTodo = {() => {
          const input = findRenderedDOMComponentWithTag(component, 'input')
          expect(input.value).to.be.empty
          done()
        }}
      />
    ), node)

    const input = findRenderedDOMComponentWithTag(component, 'input')
    const form = findRenderedDOMComponentWithTag(component, 'form')

    input.value = text
    Simulate.change(input)
    Simulate.submit(form)
  })
})
