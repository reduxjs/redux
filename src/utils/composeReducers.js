import mapValues from '../utils/mapValues';
import pick from '../utils/pick';

export default function composeReducers(reducers) {
  const finalReducers = pick(reducers, (val) => typeof val === 'function');

  return function Composition(atom = {}, action) {
    return mapValues(finalReducers, (reducer, key) => {
      const state = reducer(atom[key], action);
      if (typeof state === 'undefined') {
        throw new Error(`Reducer ${key} returns undefined. By default reducer should return original state.`);
      }
      return state;
    });
  };
}
