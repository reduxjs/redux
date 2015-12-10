import ActionTypes from './actionTypes'

var quoted = name => name ? `"${name.toString()}"` : ''

export function assertStateNotUndefined(state, action, name) {
  var actionType = action && action.type
  var actionName = quoted(actionType) || 'an action'

  if (typeof state === 'undefined') {
    throw new Error(
      `Reducer ${quoted(name)} returned undefined handling ${actionName}. ` +
      `To ignore an action, you must explicitly return the previous state.`
    )
  }
}

export function assertReducerSanity(reducer, name) {
  var initialState = reducer(undefined, { type: ActionTypes.INIT })
  name = quoted(name)

  if (typeof initialState === 'undefined') {
    throw new Error(
      `Reducer ${name} returned undefined during initialization. ` +
      `If the state passed to the reducer is undefined, you must ` +
      `explicitly return the initial state. The initial state may ` +
      `not be undefined.`
    )
  }

  var type = ActionTypes.PROBE + Math.random().toString(36).substring(7).split('').join('.')
  if (typeof reducer(undefined, { type }) === 'undefined') {
    throw new Error(
      `Reducer ${name} returned undefined when probed with a random type. ` +
      `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
      `namespace. They are considered private. Instead, you must return the ` +
      `current state for any unknown actions, unless it is undefined, ` +
      `in which case you must return the initial state, regardless of the ` +
      `action type. The initial state may not be undefined.`
    )
  }
}
