export default function storeReducer(store, state) {
  return  next => action =>
    next(store(state, action));
}
