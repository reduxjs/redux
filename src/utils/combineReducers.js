import ActionTypes from './actionTypes'
import { assertStateNotUndefined, assertReducerSanity } from './assertions'
import isPlainObject from './isPlainObject'
import mapValues from './mapValues'
import pick from './pick'

/* eslint-disable no-console */

function getUnexpectedStateKeyWarningMessage(inputState, outputState, action) {
  var reducerKeys = Object.keys(outputState)
  var argumentName = action && action.type === ActionTypes.INIT ?
    'initialState argument passed to createStore' :
    'previous state received by the reducer'

  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    )
  }

  var unexpectedKeys = Object.keys(inputState).filter(
    key => reducerKeys.indexOf(key) < 0
  )

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */

export default function combineReducers(reducers) {
  var finalReducers = pick(reducers, (val) => typeof val === 'function')
  var sanityError

  try {
    Object.keys(finalReducers).forEach(key => {
      assertReducerSanity(finalReducers[key], key)
    })
  } catch (e) {
    sanityError = e
  }

  var defaultState = mapValues(finalReducers, () => undefined)

  return function combination(state = defaultState, action) {
    if (sanityError) {
      throw sanityError
    }

    var hasChanged = false
    var finalState = mapValues(finalReducers, (reducer, key) => {
      var previousStateForKey = state[key]
      var nextStateForKey = reducer(previousStateForKey, action)
      assertStateNotUndefined(nextStateForKey, action, key)
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
      return nextStateForKey
    })

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateKeyWarningMessage(state, finalState, action)
      if (warningMessage) {
        console.error(warningMessage)
      }
    }

    return hasChanged ? finalState : state
  }
}
