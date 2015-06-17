import mapValues from 'lodash/object/mapValues';
import pick from 'lodash/object/pick';

export default function composeStores(stores) {
  stores = pick(stores, (val) => typeof val === 'function');
  return function Composition(atom = {}, action) {
    return mapValues(stores, (store, key) =>
      store(atom[key], action)
    );
  };
}
