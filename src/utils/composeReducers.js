import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';

export default function composeReducers(reducers) {
  const finalReducers = pick(reducers, (val) => typeof val === 'function');

  return function composition(state = {}, action) {
    return mapValues(finalReducers, (reducer, key) => {
      const newState = reducer(state[key], action);
      invariant(
          typeof newState !== 'undefined',
          `Reducer ${key} returns undefined. By default reducer should return original state.`
      );
      return newState;
    });
  };
}
