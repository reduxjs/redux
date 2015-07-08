// Core
import createStore from './createStore';

// Utilities
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
