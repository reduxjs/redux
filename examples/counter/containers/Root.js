import React, { Component } from 'react';
import { Provider } from 'react-redux';
import CounterApp from './CounterApp';
import configureStore from '../store/configureStore';

const store = configureStore();

export default class Root extends Component {
  render() {
    return (
      <Provider store={store}>
        {() => <CounterApp />}
      </Provider>
    );
  }
}
