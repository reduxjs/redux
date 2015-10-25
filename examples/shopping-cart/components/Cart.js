import React, { Component, PropTypes } from 'react';
import Product from './Product';

export default class Cart extends Component {
  render() {
    const { products, total, onCheckoutClicked } = this.props;

    const hasProducts = products.length > 0;
    const nodes = !hasProducts ?
      <div>Please add some products to cart.</div> :
      products.map(product =>
        <Product key={product.id}>
          {product.title} - &euro;{product.price} x {product.quantity}
        </Product>
    );

    return (
      <div>
        <h3>Your Cart</h3>
        <div>{nodes}</div>
        <p>Total: &euro;{total}</p>
        <button onClick={onCheckoutClicked}
          disabled={hasProducts ? '' : 'disabled'}>
          Checkout
        </button>
      </div>
    );
  }
}

Cart.propTypes = {
  products: PropTypes.array,
  total: PropTypes.string,
  onCheckoutClicked: PropTypes.func
};
