import { ActionTypes } from './createStore'
import isPlainObject from 'lodash/isPlainObject'
import warning from './utils/warning'

var NODE_ENV = typeof process !== 'undefined' ? process.env.NODE_ENV : 'development'

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type
  var actionName = actionType && `"${actionType.toString()}"` || 'an action'

  return (
    `Given action ${actionName}, seducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state.`
  )
}

function getUnexpectedStateShapeWarningMessage(inputState, seducers, action, unexpectedKeyCache) {
  var seducerKeys = Object.keys(seducers)
  var argumentName = action && action.type === ActionTypes.INIT ?
    'preloadedState argument passed to createStore' :
    'previous state received by the seducer'

  if (seducerKeys.length === 0) {
    return (
      'Store does not have a valid seducer. Make sure the argument passed ' +
      'to combineseducers is an object whose values are seducers.'
    )
  }

  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      ({}).toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${seducerKeys.join('", "')}"`
    )
  }

  var unexpectedKeys = Object.keys(inputState).filter(key =>
    !seducers.hasOwnProperty(key) &&
    !unexpectedKeyCache[key]
  )

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true
  })

  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known seducer keys instead: ` +
      `"${seducerKeys.join('", "')}". Unexpected keys will be ignored.`
    )
  }
}

function assertSeducerSanity(seducers) {
  Object.keys(seducers).forEach(key => {
    var seducer = seducers[key]
    var initialState = seducer(undefined, { type: ActionTypes.INIT })

    if (typeof initialState === 'undefined') {
      throw new Error(
        `seducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the seducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined.`
      )
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.')
    if (typeof seducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `seducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined.`
      )
    }
  })
}

/**
 * Turns an object whose values are different seducer functions, into a single
 * seducer function. It will call every child seducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * seducer functions.
 *
 * @param {Object} seducers An object whose values correspond to different
 * seducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as seducers` syntax. The seducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A seducer function that invokes every seducer inside the
 * passed object, and builds a state object with the same shape.
 */
export default function combineSeducers(seducers) {
  var seducerKeys = Object.keys(seducers)
  var finalSeducers = {}
  for (var i = 0; i < seducerKeys.length; i++) {
    var key = seducerKeys[i]

    if (NODE_ENV !== 'production') {
      if (typeof seducers[key] === 'undefined') {
        warning(`No seducer provided for key "${key}"`)
      }
    }

    if (typeof seducers[key] === 'function') {
      finalSeducers[key] = seducers[key]
    }
  }
  var finalSeducerKeys = Object.keys(finalSeducers)

  if (NODE_ENV !== 'production') {
    var unexpectedKeyCache = {}
  }

  var sanityError
  try {
    assertSeducerSanity(finalSeducers)
  } catch (e) {
    sanityError = e
  }

  return function combination(state = {}, action) {
    if (sanityError) {
      throw sanityError
    }

    if (NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalSeducers, action, unexpectedKeyCache)
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    var hasChanged = false
    var nextState = {}
    for (var i = 0; i < finalSeducerKeys.length; i++) {
      var key = finalSeducerKeys[i]
      var seducer = finalSeducers[key]
      var previousStateForKey = state[key]
      var nextStateForKey = seducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    return hasChanged ? nextState : state
  }
}
