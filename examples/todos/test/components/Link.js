import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Link from '../../components/Link'

function setup({ active, text }) {
  const actions = {
    onClick: expect.createSpy()
  }

  const component = shallow(
    <Link active={active} {...actions} >
      {text}
    </Link>
  )

  return {
    component: component,
    actions: actions
  }
}

describe('<Link />', () => {
  it('should render an anchor tag if not active', () => {
    const { component } = setup({ active: false, text: 'All' })
    expect(component.find('a').length).toEqual(1)
  })

  it('should render a span tag if active', () => {
    const { component } = setup({ active: true, text: 'All' })
    expect(component.find('span').length).toEqual(1)
  })

  it('should render the text passed', () => {
    const { component } = setup({ active: true, text: 'All' })
    expect(component.find('span').text()).toEqual('All')
  })

  it('should call onClick on click of anchor tag', () => {
    const { actions, component } = setup({ active: false, text: 'All' })
    const a = component.find('a')
    a.props().onClick({ preventDefault: () => {} })
    expect(actions.onClick).toHaveBeenCalled()
  })
})
