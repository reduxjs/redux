import React from 'react';
import CounterApp from './CounterApp';
import { createRedux } from 'redux';
import { Provider } from 'redux/react';
import * as stores from '../stores';

const redux = createRedux(stores);

export default class App {
  render() {
    return (
      <Provider redux={redux}>
        {() => <CounterApp />}
      </Provider>
    );
  }
}
