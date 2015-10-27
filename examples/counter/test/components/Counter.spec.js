import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Counter from '../../components/Counter'

function setup() {
  const actions = {
    increment: expect.createSpy(),
    incrementIfOdd: expect.createSpy(),
    incrementAsync: expect.createSpy(),
    decrement: expect.createSpy()
  }
  const component = TestUtils.renderIntoDocument(<Counter counter={1} {...actions} />)
  return {
    component: component,
    actions: actions,
    buttons: TestUtils.scryRenderedDOMComponentsWithTag(component, 'button'),
    p: TestUtils.findRenderedDOMComponentWithTag(component, 'p')
  }
}

describe('Counter component', () => {
  it('should display count', () => {
    const { p } = setup()
    expect(p.textContent).toMatch(/^Clicked: 1 times/)
  })

  it('first button should call increment', () => {
    const { buttons, actions } = setup()
    TestUtils.Simulate.click(buttons[0])
    expect(actions.increment).toHaveBeenCalled()
  })

  it('second button should call decrement', () => {
    const { buttons, actions } = setup()
    TestUtils.Simulate.click(buttons[1])
    expect(actions.decrement).toHaveBeenCalled()
  })

  it('third button should call incrementIfOdd', () => {
    const { buttons, actions } = setup()
    TestUtils.Simulate.click(buttons[2])
    expect(actions.incrementIfOdd).toHaveBeenCalled()
  })

  it('fourth button should call incrementAsync', () => {
    const { buttons, actions } = setup()
    TestUtils.Simulate.click(buttons[3])
    expect(actions.incrementAsync).toHaveBeenCalled()
  })
})
