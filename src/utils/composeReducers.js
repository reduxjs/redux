import mapValues from '../utils/mapValues';
import pick from '../utils/pick';

export default function composeReducers(reducers) {
  const finalReducers = pick(reducers, (val) => typeof val === 'function');

  return function composition(state = {}, action) {
    return mapValues(finalReducers, (store, key) =>
      store(state[key], action)
    );
  };
}
