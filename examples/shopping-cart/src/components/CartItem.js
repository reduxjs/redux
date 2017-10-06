import React from 'react'
import PropTypes from 'prop-types'
import CartProduct from './CartProduct'

const CartItem = ({ product, onRemoveFromCartClicked }) => (
  <div style={{ marginBottom: 20 }}>
    <CartProduct
      title={product.title}
      price={product.price}
      quantity={product.quantity} />
    <button
      onClick={onRemoveFromCartClicked}>
      Remove from cart
    </button>
  </div>
)

CartItem.propTypes = {
  product: PropTypes.shape({
    title: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number.isRequired
  }).isRequired,
  onRemoveFromCartClicked: PropTypes.func.isRequired
}

export default CartItem
