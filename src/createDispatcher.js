import composeMiddleware from './utils/composeMiddleware';

const INIT = Symbol('INIT');

export default function createDispatcher(store, middlewares = []) {
  return function dispatcher(initialState, setState) {
    let state = setState(store(initialState, { type: INIT }));

    function dispatch(action) {
      state = setState(store(state, action));
      return action;
    }

    function getState() {
      return state;
    }

    const finalMiddlewares = typeof middlewares === 'function' ?
      middlewares(getState) :
      middlewares;

    return composeMiddleware(...finalMiddlewares, dispatch);
  };
}
