import React from 'react';
import CounterApp from './CounterApp';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'redux-react';
import * as reducers from '../reducers';

const createStoreWithMiddleware = applyMiddleware()(createStore);
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
