import mapValues from './mapValues';
import pick from './pick';

// UNDEF = undefined;
const UNDEF = void 0;

export default function composeStores(stores) {
  const finalStores = pick(stores, (val) => typeof val === 'function');
  return function Composition(atom = {}, action) {
    return mapValues(finalStores, (store, key) => {
      const state = store(atom[key], action);
      if (state === UNDEF) {
        throw new Error(`Store ${key} returns undefined. By default store should return original state.`);
      }
      return state;
    });
  };
}
