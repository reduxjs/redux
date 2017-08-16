import React from 'react'
import { shallow } from 'enzyme'
import CartProduct from './CartProduct'
import CartItem from './CartItem'

const setup = product => {
  const actions = {
    onRemoveFromCartClicked: jest.fn()
  }

  const component = shallow(
    <CartItem product={product} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    button: component.find('button'),
    product: component.find(CartProduct)
  }
}

let productProps

describe('CartItem component', () => {
  beforeEach(() => {
    productProps = {
      title: 'Product 1',
      price: 9.99,
      quantity: 6
    }
  })

  it('should render product', () => {
    const { product } = setup(productProps)
    expect(product.props()).toEqual({ title: 'Product 1', price: 9.99, quantity: 6 })
  })


  it('should render Remove from Cart message', () => {
    const { button } = setup(productProps)
    expect(button.text()).toMatch(/^Remove from cart/)
  })

  it('should call action on button click', () => {
    const { button, actions } = setup(productProps)
    button.simulate('click')
    expect(actions.onRemoveFromCartClicked).toBeCalled()
  })
})
