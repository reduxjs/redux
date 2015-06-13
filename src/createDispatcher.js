import composeMiddleware from './utils/composeMiddleware';

export default function createDispatcher(store, middlewares = []) {
  return function dispatcher(initialState, setState) {
    let state = setState(store(initialState, {}));

    function dispatch(action) {
      state = setState(store(state, action));
      return action;
    }

    function getState() {
      return state;
    }

    if (typeof middlewares === 'function') {
      middlewares = middlewares(getState);
    }

    return composeMiddleware(...middlewares, dispatch);
  };
}
