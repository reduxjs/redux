export default function thunkMiddleware(getState) {
  return (next) => {
    const recurse = (action) =>
      typeof action === 'function' ?
        action(recurse, getState) :
        next(action);

    return recurse;
  };
}
