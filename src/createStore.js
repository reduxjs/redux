import Store from './Store';
import composeReducers from './utils/composeReducers';

export default function createStore(
  reducer,
  initialState
) {
  const finalReducer = typeof reducer === 'function' ?
    reducer :
    composeReducers(reducer);

  const store = new Store(finalReducer, initialState);

  return {
    dispatch: ::store.dispatch,
    subscribe: ::store.subscribe,
    getState: ::store.getState,
    getReducer: ::store.getReducer,
    replaceReducer: ::store.replaceReducer
  };
}
