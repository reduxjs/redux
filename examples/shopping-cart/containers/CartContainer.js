import React, { Component } from 'react';
import { connect } from 'react-redux';
import { checkout } from '../actions';
import { getTotal, getCartProducts } from '../reducers';
import Cart from '../components/Cart';

class CartContainer extends Component {
  render() {
    const { products, total, dispatch } = this.props;
    return (
      <Cart
        products={products}
        total={total}
        onCheckoutClicked={() => this.props.checkout()}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    products: getCartProducts(state),
    total: getTotal(state)
  };
}

export default connect(
  mapStateToProps,
  { checkout }
)(CartContainer);
