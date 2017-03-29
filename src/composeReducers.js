/**
 * Creates new reducer composing passed in reducers from right to left, handling intialState.
 *
 * @param {any} initialState The initial state to be used as default state.
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A composed reducer obtained by composing the argument functions
 * from right to left. Each reducer receives the state returned by the previous one.
 */

export default function composeReducers(initialState = {}, ...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return function composedReducer(state = initialState, action) {
    return funcs.reduce((outcomeState, reducer) => reducer(outcomeState, action), state)
  }
}
