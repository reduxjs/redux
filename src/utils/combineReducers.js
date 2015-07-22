/* @flow */
/*eslint-disable */
import type { Action, State, Reducer } from '../types';
/*eslint-enable */

import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';
import { ActionTypes } from '../createStore';

function getErrorMessage(key: String, action: Action): string {
  var actionType = action && action.type;
  var actionName = actionType && `"${actionType.toString()}"` || 'an action';

  return (
    `Reducer "${key}" returned undefined handling ${actionName}. ` +
    `To ignore an action, you must explicitly return the previous state.`
  );
}

export default function combineReducers(reducers: Object): Reducer {
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

  return function composition(state: State = {}, action: Action): State {
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
