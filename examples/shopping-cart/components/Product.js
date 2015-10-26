import React, { Component, PropTypes } from 'react';

export default class Product extends Component {
  render() {
    const { price, quantity, title } = this.props;
    return <div> {title} - &euro;{price} x {quantity} </div>;
  }
}

Product.propTypes = {
  price: PropTypes.number,
  quantity: PropTypes.number,
  title: PropTypes.string
};
