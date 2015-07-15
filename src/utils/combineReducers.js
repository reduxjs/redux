import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';
import { ActionTypes } from '../Store';

function getErrorMessage(key, action) {
  const actionType = action && action.type;
  const actionName = actionType && `"${actionType}"` || 'an action';

  return (
    `Reducer "${key}" returned undefined handling ${actionName}. ` +
    `To ignore an action, you must explicitly return the previous state.`
  );
}

export default function combineReducers(reducers) {
  const finalReducers = pick(reducers, (val) => typeof val === 'function');

  Object.keys(finalReducers).forEach(key => {
    const reducer = finalReducers[key];
    invariant(
      typeof reducer(undefined, { type: ActionTypes.INIT }) !== 'undefined',
      `Reducer "${key}" returned undefined during initialization. ` +
      `If the state passed to the reducer is undefined, you must ` +
      `explicitly return the initial state. The initial state may ` +
      `not be undefined.`
    );

    const type = Math.random().toString(36).substring(7).split('').join('.');
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

  return function composition(state = {}, action) {
    return mapValues(finalReducers, (reducer, key) => {
      const newState = reducer(state[key], action);
      invariant(
        typeof newState !== 'undefined',
        getErrorMessage(key, action)
      );
      return newState;
    });
  };
}
