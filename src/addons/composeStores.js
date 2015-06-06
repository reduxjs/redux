import mapValues from 'lodash/object/mapValues';

export default function composeStores(stores) {
  return function Composition(atom = {}, action) {
    return mapValues(stores, (store, key) =>
      store(atom[key], action)
    );
  };
}
