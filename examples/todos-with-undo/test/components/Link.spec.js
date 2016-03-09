import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Link from '../../components/Link'

function setup({active, text}) {
  const actions = {
    onClick: expect.createSpy()
  }

  const component = shallow(
    <Link active={active} {...actions}>
      {text}
    </Link>
  )

  return {
    component: component,
    actions: actions,
    a: component.find('a'),
    span: component.find('span')
  }
}

describe('Link component', () => {
  it('should render an active tag if not active', () => {
    const { a } = setup({ active: false, text: 'All' })
    expect(a.length).toEqual(1)
    expect(a.text()).toMatch(/^All/)
  })

  it('should render a span tag if active', () => {
    const { span } = setup({ active: true, text: 'Completed'})
    expect(span.length).toEqual(1)
    expect(span.text()).toMatch(/^Completed/)
  })

  it('should call onClick handler on a tag', () => {
    const e = {
      type: 'click',
      preventDefault: () => {}
    }
    const { actions, a } = setup({ active: false, text: 'Active' })
    a.simulate('click', e)
    expect(actions.onClick).toHaveBeenCalled()
  })
})
