import React from 'react'
import { shallow } from 'enzyme'
import Cart from './Cart'
import CartProduct from './CartProduct'

const setup = (total, products = []) => {
  const actions = {
    onCheckoutClicked: jest.fn()
  }

  const component = shallow(
    <Cart products={products} total={total} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    button: component.find('button'),
    products: component.find(CartProduct),
    em: component.find('em'),
    p: component.find('p')
  }
}

describe('Cart component', () => {

const product = [
   {
      id: 1,
      title: 'Product 1',
      price: 9.99,
      quantity: 1
    }
  ]

  it('should display total', () => {
    const { p } = setup('9.99',product)
    expect(p.text()).toMatch(/^Total: \$9.99/)
  })

  it('should display add some products message', () => {
    const { em } = setup()
    expect(em.text()).toMatch(/^Please add some products to cart/)
  })

  describe('when given product', () => {
    const product = [
      {
        id: 1,
        title: 'Product 1',
        price: 9.99,
        quantity: 1
      }
    ]

    it('should render products', () => {
      const { p } = setup('9.99', product)
      expect(p.text()).toMatch(/^Total: \$9.99/)
    })

    it('should not disable button', () => {
      const { button } = setup('9.99', product)
      expect(button.prop('disabled')).toEqual('')
    })

    it('should call action on button click', () => {
      const { button, actions } = setup('9.99', product)
      button.simulate('click')
      expect(actions.onCheckoutClicked).toBeCalled()
    })
  })
})
