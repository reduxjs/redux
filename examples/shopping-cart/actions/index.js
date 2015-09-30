import shop from '../api/shop';

export const RECEIVE_PRODUCTS = 'RECEIVE_PRODUCTS';
function receiveProducts(products) {
    return {
        type: RECEIVE_PRODUCTS,
        products: products
    };
}
export function getAllProducts() {
    return dispatch => {
        shop.getProducts(products => {
            dispatch(receiveProducts(products));
        });
    };
}

export const ADD_TO_CART = 'ADD_TO_CART';
function addToCartUnsafe(productId) {
    return {
        type: ADD_TO_CART,
        productId
    };
}
export function addToCart(productId) {
    return (dispatch, getState) => {
        if (getState().products.byId[productId].inventory > 0) {
            dispatch(addToCartUnsafe(productId));
        }
    };
}

export const CHECKOUT_REQUEST = 'CHECKOUT_REQUEST';
export const CHECKOUT_SUCCESS = 'CHECKOUT_SUCCESS';
export const CHECKOUT_FAILURE = 'CHECKOUT_FAILURE';
export function checkout(products) {
    return (dispatch, getState) => {
        const cart = getState().cart;

        dispatch({ type: CHECKOUT_REQUEST });
        shop.buyProducts(products, () => {
            dispatch({ type: CHECKOUT_SUCCESS, cart });
            // Replace the line above with line below to rollback on failure:
            // dispatch({ type: CHECKOUT_FAILURE, cart });
        });
    };
}
