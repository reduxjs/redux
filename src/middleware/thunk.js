/**
 * Given an action that returns a function, delegates its call
 * to the function itself by passing the control of the dispatching,
 * otherwise simply dispatch the action.
 * In other words, it allows to have async actions.
 *
 * @param  {Function} getState - allow to access the current state
 * @return {Function} a new middleware
 */
export default function thunkMiddleware(getState) {
  return (next) => {
    const recurse = (action) =>
      typeof action === 'function' ?
        action(recurse, getState) :
        next(action);

    return recurse;
  };
}
