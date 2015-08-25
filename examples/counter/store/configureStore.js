import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import switchReducer from './switchReducer';

function onHotReload(useReducer) {
  module.hot.accept('../reducers', () => {
    const nextReducer = require('../reducers');
    useReducer(nextReducer);
  });
}

const finalCreateStore = compose(
  switchReducer(onHotReload),
  applyMiddleware(thunk),
  createStore
);

export default function configureStore(initialState) {
  return finalCreateStore(reducer, initialState);
}
