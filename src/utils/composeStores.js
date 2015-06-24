import mapValues from '../utils/mapValues';
import pick from '../utils/pick';

export default function composeStores(stores) {
  const finalStores = pick(stores, (val) => typeof val === 'function');

  const dummyAction = {};
  const dummyStore = {};

  Object.keys(finalStores).forEach(key => {
    if (finalStores[key](dummyStore, dummyAction) !== dummyStore) {
      const message = `Your ${key} Store must return the state given to it for any unknown actions.`;
      if (process.env.NODE_ENV === 'production') {
        console.warn(message);
      } else {
        throw new Error(message);
      }
    }
  });

  return function Composition(atom = {}, action) {
    return mapValues(finalStores, (store, key) =>
      store(atom[key], action)
    );
  };
}
