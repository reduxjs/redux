import React, { Component } from 'react';
import CounterApp from './CounterApp';
import { createStore, applyMiddleware, compose, combineReducers, bindActionCreators } from 'redux';
import { Provider, Connector } from 'redux/react';
import * as reducers from '../reducers';

import devTools from '../redux-devtools/index';
import DebugPanel from '../redux-devtools/DebugPanel';
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
  devTools(),
  createStore
);

const reducer = combineReducers(reducers);
const store = finalCreateStore(combineReducers(reducers));

export default class App extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() => <CounterApp />}
        </Provider>

        <DebugPanel top right bottom>
          <ReduxMonitor store={store} />
        </DebugPanel>
      </div>
    );
  }
}
