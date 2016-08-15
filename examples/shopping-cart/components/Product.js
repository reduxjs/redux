import React, { Component, PropTypes } from 'react'

const Product = ({ price, quantity, title }) => (
	<div> {title} - &#36;{price} {quantity ? `x ${quantity}` : null} </div>
)

Product.propTypes = {
  price: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired
}

export default Product
