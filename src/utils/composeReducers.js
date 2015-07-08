import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';

function getErrorMessage(key, action) {
  const actionType = action && action.type;
  const actionName = actionType && `"${actionType}"` || 'an action';
  const reducerName = `Reducer "${key}"`;

  if (actionType === '@@INIT') {
    return (
      `${reducerName} returned undefined during initialization. ` +
      `If the state passed to the reducer is undefined, ` +
      `you must explicitly return the initial state.`
    );
  }

  return (
    `Reducer "${key}" returned undefined handling ${actionName}. ` +
    `To ignore an action, you must explicitly return the previous state.`
  );
}

export default function composeReducers(reducers) {
  const finalReducers = pick(reducers, (val) => typeof val === 'function');

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
