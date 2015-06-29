import mapValues from '../utils/mapValues';
import pick from '../utils/pick';

export default function composeStores(stores) {
  const finalStores = pick(stores, (val) => typeof val === 'function');
  return function Composition(atom = {}, action) {
    return mapValues(finalStores, (store, key) =>
      store(atom[key], action)
    );
  };
}
