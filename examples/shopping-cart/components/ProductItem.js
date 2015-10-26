import React, { Component, PropTypes } from 'react';

export default class ProductItem extends Component {
  render() {
    const { product } = this.props;

    return (
      <div>
        <h4>{product.title} - &euro;{product.price}</h4>
        <button onClick={this.props.onAddToCartClicked}
          disabled={product.inventory > 0 ? '' : 'disabled'}>
          {product.inventory > 0 ? 'Add to cart' : 'Sold Out'}
        </button>
      </div>
    );
  }
}

ProductItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    inventory: PropTypes.number.isRequired
  }).isRequired,
  onAddToCartClicked: PropTypes.func.isRequired
};
