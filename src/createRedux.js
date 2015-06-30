import Redux from './Redux';
import composeReducers from './utils/composeReducers';

export default function createRedux(reducer, initialState) {
  const finalReducer = typeof reducer === 'function' ?
    reducer :
    composeReducers(reducer);

  const redux = new Redux(finalReducer, initialState);

  return {
    subscribe: ::redux.subscribe,
    dispatch: ::redux.dispatch,
    getState: ::redux.getState,
    getReducer: ::redux.getReducer,
    replaceReducer: ::redux.replaceReducer
  };
}
