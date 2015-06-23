import mapValues from '../utils/mapValues';
import pick from '../utils/pick';
import invariant from 'invariant';

export default function composeStores(stores) {
  const finalStores = pick(stores, (val) => typeof val === 'function');

  Object.keys(finalStores).forEach(key => {
    invariant(
        typeof finalStores[key]({}, {}) !== 'undefined',
        'The return value of `%s` reducer function must not be undefined.',
        key
    );
  });
  return function Composition(atom = {}, action) {
    return mapValues(finalStores, (store, key) =>
      store(atom[key], action)
    );
  };
}
