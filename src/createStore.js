/* @flow */

import StoreClass from './Store';
import combineReducers from './utils/combineReducers';

import type { State, Reducer, Store } from './types';

export default function createStore(
  reducer: Reducer,
  initialState: State
): Store {
  var finalReducer = typeof reducer === 'function' ?
    reducer :
    combineReducers(reducer);

  var store = new StoreClass(finalReducer, initialState);

  return {
    dispatch: store.dispatch.bind(store),
    subscribe: store.subscribe.bind(store),
    getState: store.getState.bind(store),
    getReducer: store.getReducer.bind(store),
    replaceReducer: store.replaceReducer.bind(store)
  };
}
