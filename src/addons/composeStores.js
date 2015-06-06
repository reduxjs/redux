export default function composeStores(stores) {
  return function Composition(atom = {}, action) {
    return Object.keys(stores).reduce((result, key) => {
      result[key] = stores[key](atom[key], action);
      return result;
    }, {});
  };
}
