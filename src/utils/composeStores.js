import mapValues from '../utils/mapValues';
import pick from '../utils/pick';

/**
 * Given a list of stores, maps the state keys to reducer functions.
 * The composed store, when invoked, will internally map all the
 * results of the computed stores (being effectively the state).
 * When the store function is invoked again, it will pass the
 * existing state value as initial state.
 *
 * @param  {Object} stores - an object with the store reducer functions
 * @return {Function} the composed store function
 */
export default function composeStores(stores) {
  const finalStores = pick(stores, (val) => typeof val === 'function');
  return function Composition(atom = {}, action) {
    return mapValues(finalStores, (store, key) =>
      store(atom[key], action)
    );
  };
}
