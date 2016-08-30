import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Todo from '../../components/Todo'

function setup({ completed, text }) {
  const actions = {
    onClick: expect.createSpy()
  }

  const component = shallow(
    <Todo completed={completed} text={text} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    li: component.find('li')
  }
}

describe('Todo component', () => {
  it('should render a li tag', () => {
    const { li } = setup({ completed: false, text: 'Buy Milk' })
    expect(li.length).toEqual(1)
    expect(li.type()).toEqual('li')
  })

  it('should render the text passed', () => {
    const { li } = setup({ completed: false, text: 'Use Redux' })
    expect(li.text()).toEqual('Use Redux')
  })

  it('should render crossed item when complete', () => {
    const { li } = setup({ completed: true, text: 'Use Redux' })
    const style = {
      textDecoration: 'line-through'
    }
    expect(li.prop('style')).toEqual(style)
  })

  it('should render a normal item when not complete', () => {
    const { li } = setup({ completed: false, text: 'Use Redux' })
    const style = {
      textDecoration: 'none'
    }
    expect(li.prop('style')).toEqual(style)
  })

  it('should call onClick handler on li tag', () => {
    const { actions, li } = setup({ completed: false, text: 'Use Redux' })
    li.simulate('click')
    expect(actions.onClick).toHaveBeenCalled()
  })
})
