import compose from './compose'

/**
 * Composes middleware functions from right to left.
 *
 * @param {...Function} middlewares The middlewares to compose.
 * @returns {Function} A middleware obtained by composing the all the input 
 * middleware in the given order from right to left. 
 * For example, composeMiddleware(a, b, c) means that every action will 
 * go through middleware a then b then c in the respective order
 */

export default function composeMiddleware(...middlewares) {
    return methods => {
        const chain = middlewares.map(middleware => middleware(methods))
        return compose(...chain)
    }
}
  