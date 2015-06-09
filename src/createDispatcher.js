export default function createDispatcher(store, middleware) {
  return function dispatcher(initialState, setState) {
    let state = store(initialState, {});
    setState(state);

    function dispatch(action) {
      state = store(state, action);
      setState(state);
      return action;
    }

    // Default middleware. It's special because it reads in the current state.
    // This is kept here to maintain existing API behavior.
    function perform(next) {
      return function recurse(action) {
        return typeof action === 'function' ?
          action(recurse, state) :
          next(action);
      };
    }

    if (typeof middleware === 'undefined') {
      middleware = perform;
    }

    return middleware(dispatch);
  };
}
