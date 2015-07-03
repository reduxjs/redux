import composeMiddleware from './utils/composeMiddleware';

const INIT_ACTION = {
  type: '@@INIT'
};

export default function createDispatcher(store, middlewares = []) {
  return function dispatcher(initialState, setState, getState) {
    setState(store(initialState, INIT_ACTION));
    
    function dispatch(action) {
      setState(store(getState(), action));
      return action;
    }

    const finalMiddlewares = typeof middlewares === 'function' ?
      middlewares(getState) :
      middlewares;

    return composeMiddleware(...finalMiddlewares, dispatch);
  };
}
