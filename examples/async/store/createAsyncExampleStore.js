import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from '../reducers';

// TODO: remove
import { devTools, persistState } from 'redux-devtools';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import { Provider } from 'react-redux';

// TODO: remove devtools
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk),
  devTools(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/)),
  createStore
);
const reducer = combineReducers(reducers);

export default function createAsyncExampleStore(initialState) {
  return createStoreWithMiddleware(reducer, initialState);
}
