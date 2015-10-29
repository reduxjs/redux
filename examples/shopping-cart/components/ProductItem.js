import React, { Component, PropTypes } from 'react'
import Product from './Product'

export default class ProductItem extends Component {
  render() {
    const { product } = this.props

    return (
      <div
        style={{ marginBottom: 20 }}>
        <Product
          title={product.title}
          price={product.price} />
        <button
          onClick={this.props.onAddToCartClicked}
          disabled={product.inventory > 0 ? '' : 'disabled'}>
          {product.inventory > 0 ? 'Add to cart' : 'Sold Out'}
        </button>
      </div>
    )
  }
}

ProductItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  }).isRequired,
  onAddToCartClicked: PropTypes.func.isRequired
}
