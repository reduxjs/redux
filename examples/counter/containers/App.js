import React from 'react';
import CounterApp from './CounterApp';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import * as reducers from '../reducers';

// TODO: move into a separate project
function thunk({ dispatch, getState }) {
  return next => action =>
    typeof action === 'function' ?
      action(dispatch, getState) :
      next(action);
}

const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(reducers);

export default class App {
  render() {
    return (
      <Provider store={store}>
        {() => <CounterApp />}
      </Provider>
    );
  }
}
