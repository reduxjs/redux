/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
const ActionTypes = {
  INIT: '@@redux/INIT',
  REPLACE: '@@redux/REPLACE'
}

export default ActionTypes
