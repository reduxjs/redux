// Core
import createStore from './createStore';

// Utilities
import compose from './utils/compose';
import composeReducers from './utils/composeReducers';
import bindActionCreators from './utils/bindActionCreators';
import applyMiddleware from './utils/applyMiddleware';

export {
  createStore,
  compose,
  composeReducers,
  bindActionCreators,
  applyMiddleware
};
