import React, { Component, PropTypes } from 'react';

export default class Cart extends Component {
  render() {
    const { products, total, onCheckoutClicked } = this.props;

    const hasProducts = products.length > 0;
    const nodes = !hasProducts ?
      <div>Please add some products to cart.</div> :
      products.map(product =>
        <Product key={product.id}>
          {product.title} - &euro;{product.price} x {product.quantity}
        </Product>;
    );

    return (
      <div className="cart uk-panel uk-panel-box uk-panel-box-primary">
        <div className="uk-badge uk-margin-bottom">Your Cart</div>
        <div className="uk-margin-small-bottom">{nodes}</div>
        <div className="uk-margin-small-bottom">Total: &euro;{total}</div>
        <button className="uk-button uk-button-large uk-button-success uk-align-right"
          onClick={onCheckoutClicked}
          disabled={hasProducts ? '' : 'disabled'}>
          Checkout
        </button>
      </div>
    );
  }
}

Cart.PropTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired,
  })).isRequired,
  total: PropTypes.string.isRequired,
  onCheckoutClicked: PropTypes.func.isRequired
}

var Product = React.createClass({
  render() {
    return <div > {this.props.children} </div>;
  }
});