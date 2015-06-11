import compose from './utils/composeMiddleware';

export default function createDispatcher(store, middlewares = []) {
  return function dispatcher(initialState, setState) {
    let state = store(initialState, {});
    setState(state);

    function dispatch(action) {
      state = store(state, action);
      setState(state);
      return action;
    }

    function getState() {
      return state;
    }

    if (typeof middlewares === 'function') {
      middlewares = middlewares(getState);
    }

    return compose(...middlewares, dispatch);
  };
}
