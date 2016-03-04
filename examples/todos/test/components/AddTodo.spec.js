import React from 'react'
import { render } from 'react-dom'
import { Simulate, findRenderedDOMComponentWithTag } from 'react-addons-test-utils'
import AddTodo from  '../../src/components/AddTodo'
import { expect } from 'chai'

describe('AddTodo', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  it('submit should trigger onAddTodo with input text', (done) => {
    const text = 'text'
    const component = render((
      <AddTodo
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
      <AddTodo
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
