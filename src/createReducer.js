export default function createReducer(store) {
  return state => next => action =>
    next(store(state, action));
}
