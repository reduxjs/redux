import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Link from '../../components/Link'

function setup(active, displayName) {
  const actions = {
    onClick: expect.createSpy()
  }

  const component = shallow(
    <Link active={active} {...actions}>
      {displayName}
    </Link>
  )

  return {
    component: component,
    actions: actions,
    listItem: component.find('li'),
    anchor: component.find('a')
  }
}

describe('<Link />', () => {
  it('should render a list item', () => {
    const { listItem } = setup(true, 'All')
    expect(listItem.length).toEqual(1)
  })

  it('should render the specified text for the text', () => {
    const { anchor } = setup(true, 'All')
    expect(anchor.text()).toEqual('All')
  })

  it('should render selected class if was passed active as true', () => {
    const { listItem } = setup(true, 'All')
    expect(listItem.find('.selected').length).toEqual(1)
  })

  it('should not render selected class if was passed active as false', () => {
    const { listItem } = setup(false, 'All')
    expect(listItem.find('.selected').length).toEqual(0)
  })

  it('should call onClick when clicked', () => {
    const { actions, anchor } = setup(true, 'All')
    anchor.props().onClick({ preventDefault: () => {}, target: { value: '' } })
    expect(actions.onClick).toHaveBeenCalled()
  })
})
