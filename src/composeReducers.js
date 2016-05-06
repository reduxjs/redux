/**
 * Composes reducer functions passing a new state object to the function on the
 * right and each receiving the same action object. The composed function will
 * have a function signature of (state, action) making itself a reducer.
 *
 * @param {...Function} funcs The reducer functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from left to right. For example, compose(f, g, h) is identical to doing
 * (state) => h(g(f(state, action), action), action).
 */

export default function composeReducers(...funcs) {
  return (state, action) => {
    let currentState = state

    for (var i = 0; i < funcs.length; i++) {
      currentState = funcs[i](currentState, action)
    }

    return currentState
  }
}
