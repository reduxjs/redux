import { combineReducers } from 'redux'
import cart, * as fromCart from './cart'
import products, * as fromProducts from './products'

export function getTotal(state) {
  return fromCart.getAddedIds(state.cart).reduce((total, id) =>
    total + (
      fromProducts.getProduct(state.products, id).price *
      fromCart.getQuantity(state.cart, id)
    ),
    0
  ).toFixed(2)
}

export function getCartProducts(state) {
  return fromCart.getAddedIds(state.cart).map(id => Object.assign(
    {},
    fromProducts.getProduct(state.products, id),
    {
      quantity: fromCart.getQuantity(state.cart, id)
    }
  ))
}

export default combineReducers({
  cart,
  products
})
