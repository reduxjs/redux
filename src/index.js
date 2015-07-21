/* @flow */

export type State = any;
export type Action = Object;
export type IntermediateAction = any;
export type Dispatch = (a: Action | IntermediateAction) => any;
export type Reducer<S, A> = (state: S, action: A) => S;
export type ActionCreator = (...args: any) => Action | IntermediateAction;

export type MiddlewareArgs = {
  dispatch: Dispatch;
  getState: () => State;
};

export type Middleware = (args: MiddlewareArgs) =>
  (next: Dispatch) =>
  Dispatch;

export type Store = {
  dispatch: Dispatch;
  getState: () => State;
  getReducer: Reducer;
  replaceReducer: (nextReducer: Reducer) => void;
  subscribe: (listener: () => void) => () => void;
};

export type CreateStore = (
  reducer: Reducer,
  initialState: State
) => Store;

export type HigherOrderStore = (
  next: CreateStore
) => CreateStore;

import createStore from './createStore';
import compose from './utils/compose';
import combineReducers from './utils/combineReducers';
import bindActionCreators from './utils/bindActionCreators';
import applyMiddleware from './utils/applyMiddleware';
import composeMiddleware from './utils/composeMiddleware';

export {
  createStore,
  compose,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  composeMiddleware
};
