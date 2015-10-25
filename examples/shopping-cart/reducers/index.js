import { combineReducers } from 'redux';
import { default as cartReducer, getQuantity, getAddedIds } from './cart';
import { default as productsReducer, getProduct } from './products';

export function getTotal(state) {
  const { cart, products } = state;
  return getAddedIds(cart).reduce((total, id) =>
    total + getProduct(products, id).price * getQuantity(cart, id),
    0
  ).toFixed(2);
}

export function getCartProducts(state) {
  const { cart, products } = state;

  return getAddedIds(cart).map(id => ({
    ...getProduct(products, id),
    quantity: getQuantity(cart, id)
  }));
}

export default combineReducers({
  cartReducer,
  productsReducer
});
