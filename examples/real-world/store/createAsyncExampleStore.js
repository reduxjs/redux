import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import apiMiddleware from '../middleware/api';
import * as reducers from '../reducers';

const reducer = combineReducers(reducers);
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  apiMiddleware
)(createStore);

/**
 * Creates a preconfigured store for this example.
 */
export default function createAsyncExampleStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
