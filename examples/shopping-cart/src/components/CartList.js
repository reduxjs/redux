import React from 'react'
import PropTypes from 'prop-types'

const CartList = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
)

CartList.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
}

export default CartList
