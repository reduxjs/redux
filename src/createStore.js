import Store from './Store';

export default function createStore(reducer, initialState) {
  const store = new Store(reducer, initialState);

  return {
    dispatch: ::store.dispatch,
    subscribe: ::store.subscribe,
    getState: ::store.getState,
    getReducer: ::store.getReducer,
    replaceReducer: ::store.replaceReducer
  };
}
