import React from 'react'
import { shallow } from 'enzyme'
import CartList from './CartList'

const setup = props => {
  const component = shallow(
    <CartList title={props.title}>{props.children}</CartList>
  )

  return {
    component: component,
    children: component.children().at(1),
    h3: component.find('h3')
  }
}

describe('CartList component', () => {
  it('should render title', () => {
    const { h3 } = setup({ title: 'Test Cart Products' })
    expect(h3.text()).toMatch(/^Test Cart Products$/)
  })

  it('should render children', () => {
    const { children } = setup({ title: 'Test Cart Products', children: 'Test Cart Children' })
    expect(children.text()).toMatch(/^Test Cart Children$/)
  })
})
