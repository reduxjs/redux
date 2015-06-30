import Store from './Store';
import composeReducers from './utils/composeReducers';
import composeMiddleware from './utils/composeMiddleware';
import thunkMiddleware from './middleware/thunk';

const defaultMiddlewares = ({ dispatch, getState }) => [
  thunkMiddleware({ dispatch, getState })
];

export default function createStore(
  reducer,
  initialState,
  middlewares = defaultMiddlewares
) {
  const finalReducer = typeof reducer === 'function' ?
    reducer :
    composeReducers(reducer);

  const store = new Store(finalReducer, initialState);
  const getState = ::store.getState;

  const rawDispatch = ::store.dispatch;
  let cookedDispatch = null;

  function dispatch(action) {
    return cookedDispatch(action);
  }

  const finalMiddlewares = typeof middlewares === 'function' ?
    middlewares({ dispatch, getState }) :
    middlewares;

  cookedDispatch = composeMiddleware(
    ...finalMiddlewares,
    rawDispatch
  );

  return {
    dispatch: cookedDispatch,
    subscribe: ::store.subscribe,
    getState: ::store.getState,
    getReducer: ::store.getReducer,
    replaceReducer: ::store.replaceReducer
  };
}
