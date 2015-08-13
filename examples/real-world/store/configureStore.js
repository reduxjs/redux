import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import apiMiddleware from '../middleware/api';
import loggerMiddleware from 'redux-logger';
import * as reducers from '../reducers';

const reducer = combineReducers(reducers);
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  apiMiddleware,
  loggerMiddleware
)(createStore);

/**
 * Creates a preconfigured store for this example.
 */
export default function configureStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
