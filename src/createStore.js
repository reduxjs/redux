import Store from './Store';
import combineReducers from './utils/combineReducers';

export default function createStore(
  reducer,
  initialState
) {
  const finalReducer = typeof reducer === 'function' ?
    reducer :
    combineReducers(reducer);

  const store = new Store(finalReducer, initialState);

  return {
    dispatch: ::store.dispatch,
    subscribe: ::store.subscribe,
    getState: ::store.getState,
    getReducer: ::store.getReducer,
    replaceReducer: ::store.replaceReducer
  };
}
