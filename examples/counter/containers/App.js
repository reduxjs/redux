import React, { Component } from 'react';
import CounterApp from './CounterApp';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { Provider } from 'redux/react';
import * as reducers from '../reducers';

import DebugPanel from '../redux-devtools/DebugPanel';
import devtools from '../redux-devtools/devtools';
import ReduxMonitor from '../redux-devtools/ReduxMonitor';

// TODO: move into a separate project
function thunk({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

const finalCreateStore = compose(
  applyMiddleware(),
  devtools(),
  createStore
);

const reducer = combineReducers(reducers);
const store = finalCreateStore(combineReducers(reducers));
const devToolsStore = store.getDevToolsStore();

export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() => <CounterApp />}
        </Provider>

        <DebugPanel top right bottom>
          <Provider store={devToolsStore}>
            {() => <ReduxMonitor />}
          </Provider>
        </DebugPanel>
      </div>
    );
  }
}
