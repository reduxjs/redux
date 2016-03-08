import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Todo from '../../components/Todo'

function setup({ completed, text }) {
  const actions = {
    onClick: expect.createSpy()
  }

  const component = shallow(
    <Todo completed={completed} {...actions} text={text} />
  )

  return {
    component: component,
    actions: actions,
    li: component.find('li')
  }
}

describe('<Todo />', () => {
  it('should render a single li tag', () => {
    const { li } = setup({ completed: false, text: 'Use Redux' })
    expect(li.length).toEqual(1)
  })

  it('should render the text passed', () => {
    const { li } = setup({ completed: true, text: 'Use Redux' })
    li.render()
    expect(li.text()).toEqual('Use Redux')
  })

  it('should render a line-through text-decoration if complete', () => {
    const { li } = setup({ completed: true, text: 'Use Redux' })
    const html = '<li style="text-decoration:line-through;">Use Redux</li>'
    expect(li.html()).toEqual(html)
  })

  it('should not render a line-through text-decoration if complete', () => {
    const { li } = setup({ completed: false, text: 'Use Redux' })
    const html = '<li style="text-decoration:none;">Use Redux</li>'
    expect(li.html()).toEqual(html)
  })

  it('should call onClick on click of li tag', () => {
    const { actions, li } = setup({ completed: true, text: 'Use Redux' })
    li.props().onClick()
    expect(actions.onClick).toHaveBeenCalled()
  })
})
