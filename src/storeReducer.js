export default function storeReducer(store) {
  return state => next => action =>
    next(store(state, action));
}
