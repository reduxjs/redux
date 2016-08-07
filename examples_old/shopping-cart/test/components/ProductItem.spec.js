import expect from 'expect'
import React from 'react'
import { shallow } from 'enzyme'
import Product from '../../components/Product'
import ProductItem from '../../components/ProductItem'

function setup(product) {
  const actions = {
    onAddToCartClicked: expect.createSpy()
  }

  const component = shallow(
    <ProductItem product={product} {...actions} />
  )

  return {
    component: component,
    actions: actions,
    button: component.find('button'),
    product: component.find(Product)
  }
}

let productProps

describe('ProductItem component', () => {
  beforeEach(() => {
    productProps = {
      title: 'Product 1',
      price: 9.99,
      inventory: 6
    }
  })

  it('should render product', () => {
    const { product } = setup(productProps)
    expect(product.props()).toEqual({ title: 'Product 1', price: 9.99 })
  })

  it('should render Add To Cart message', () => {
    const { button } = setup(productProps)
    expect(button.text()).toMatch(/^Add to cart/)
  })

  it('should not disable button', () => {
    const { button } = setup(productProps)
    expect(button.prop('disabled')).toEqual('')
  })

  it('should call action on button click', () => {
    const { button, actions } = setup(productProps)
    button.simulate('click')
    expect(actions.onAddToCartClicked).toHaveBeenCalled()
  })

  describe('when product inventory is 0', () => {
    beforeEach(() => {
      productProps.inventory = 0
    })

    it('should render Sold Out message', () => {
      const { button } = setup(productProps)
      expect(button.text()).toMatch(/^Sold Out/)
    })

    it('should disable button', () => {
      const { button } = setup(productProps)
      expect(button.prop('disabled')).toEqual('disabled')
    })
  })
})
