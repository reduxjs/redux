import React from 'react'
import { shallow } from 'enzyme'
import CartProduct from './CartProduct'

const setup = props => {
  const component = shallow(
    <CartProduct {...props} />
  )

  return {
    component: component
  }
}

describe('CartProduct component', () => {
  it('should render title and price', () => {
    const { component } = setup({ title: 'Test Product', price: 9.99 })
    // console.log(component.text());
    expect(component.text()).toBe(' Test Product - $9.99')
  })

  describe('when given quantity', () => {
    it('should render title, price, and quantity', () => {
      const { component } = setup({ title: 'Test Product', price: 9.99, quantity: 6 })
      // console.log(component.text());
      expect(component.text()).toBe('6 Test Product - $9.99 x 6')
    })
  })
})
