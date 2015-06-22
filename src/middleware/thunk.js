export default function thunkMiddleware({ getState, dispatch }) {
  return (next) => (action) =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}
