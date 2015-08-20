import createStore from './createStore';
import combineReducers from './utils/combineReducers';
import bindActionCreators from './utils/bindActionCreators';
import applyMiddleware from './utils/applyMiddleware';
import compose from './utils/compose';
import { withSideEffect } from './utils/sideEffects';

export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
  withSideEffect
};
