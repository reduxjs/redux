import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Product from '../../components/Product'

function setup(props) {
  const component = shallow(
    <Product {...props} />
  )

  return {
    component: component
  }
}

describe('Product component', () => {
  it('should render title and price', () => {
    const { component } = setup({ title: 'Test Product', price: 9.99 })
    expect(component.text()).toMatch(/^ Test Product - \$9.99 {2}$/)
  })

  describe('when given quantity', () => {
    it('should render title, price, and quantity', () => {
      const { component } = setup({ title: 'Test Product', price: 9.99, quantity: 6 })
      expect(component.text()).toMatch(/^ Test Product - \$9.99 x 6 $/)
    })
  })
})
