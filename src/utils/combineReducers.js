import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';
import { ActionTypes } from '../createStore';

function getErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && `"${actionType.toString()}"` || 'an action';

  return (
    `Reducer "${key}" returned undefined handling ${actionName}. ` +
    `To ignore an action, you must explicitly return the previous state.`
  );
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
  var finalReducers = pick(reducers, (val) => typeof val === 'function');

  Object.keys(finalReducers).forEach(key => {
    var reducer = finalReducers[key];
    invariant(
      typeof reducer(undefined, { type: ActionTypes.INIT }) !== 'undefined',
      `Reducer "${key}" returned undefined during initialization. ` +
      `If the state passed to the reducer is undefined, you must ` +
      `explicitly return the initial state. The initial state may ` +
      `not be undefined.`
    );

    var type = Math.random().toString(36).substring(7).split('').join('.');
    invariant(
      typeof reducer(undefined, { type }) !== 'undefined',
      `Reducer "${key}" returned undefined when probed with a random type. ` +
      `Don't try to handle ${ActionTypes.INIT} or other actions in "redux/*" ` +
      `namespace. They are considered private. Instead, you must return the ` +
      `current state for any unknown actions, unless it is undefined, ` +
      `in which case you must return the initial state, regardless of the ` +
      `action type. The initial state may not be undefined.`
    );
  });

  return function combination(state = {}, action) {
    return mapValues(finalReducers, (reducer, key) => {
      var newState = reducer(state[key], action);
      invariant(
        typeof newState !== 'undefined',
        getErrorMessage(key, action)
      );
      return newState;
    });
  };
}
