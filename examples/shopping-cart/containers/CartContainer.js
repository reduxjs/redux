import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { checkout } from '../actions'
import { getTotal, getCartProducts } from '../reducers'
import Cart from '../components/Cart'

let CartContainer = ({ products, total, checkout }) => (
	<Cart
		products={products}
		total={total}
		onCheckoutClicked={checkout} />
)

CartContainer.propTypes = {
  products: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired
  })).isRequired,
  total: PropTypes.string,
  checkout: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    products: getCartProducts(state),
    total: getTotal(state)
  }
}

CartContainer = connect(
  mapStateToProps,
  { checkout }
)(CartContainer)

export default CartContainer
