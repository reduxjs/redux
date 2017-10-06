import React from 'react'
import PropTypes from 'prop-types'

const CartProduct = ({ price, quantity, title }) => (
  <div>
    <b>{quantity}</b> {title} - &#36;{price}{quantity ? ` x ${quantity}` : null}
  </div>
)

CartProduct.propTypes = {
  price: PropTypes.number,
  quantity: PropTypes.number,
  title: PropTypes.string
}

export default CartProduct
