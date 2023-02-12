// functions
import { createStore, legacy_createStore } from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

// types
// store
export {
  CombinedState,
  PreloadedState,
  Dispatch,
  Unsubscribe,
  Observable,
  Observer,
  Store,
  StoreCreator,
  StoreEnhancer,
  StoreEnhancerStoreCreator
} from './types/store'
// reducers
export {
  Reducer,
  ReducerFromReducersMapObject,
  ReducersMapObject,
  StateFromReducersMapObject,
  ActionFromReducer,
  ActionFromReducersMapObject
} from './types/reducers'
// action creators
export { ActionCreator, ActionCreatorsMapObject } from './types/actions'
// middleware
export { MiddlewareAPI, Middleware } from './types/middleware'
// actions
export { Action, AnyAction } from './types/actions'

export {
  createStore,
  legacy_createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  __DO_NOT_USE__ActionTypes
}
