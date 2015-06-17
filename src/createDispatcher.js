import composeMiddleware from './utils/composeMiddleware';

export default function createDispatcher(store, middlewares = []) {
  return function dispatcher({ getState, setState }) {
    function dispatch(action) {
      setState(store(getState(), action));
      return action;
    }

    const finalMiddlewares = typeof middlewares === 'function' ?
      middlewares(getState, setState, dispatch) :
      middlewares;

    return composeMiddleware(...finalMiddlewares, dispatch);
  };
}
