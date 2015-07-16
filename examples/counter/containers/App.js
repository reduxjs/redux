import React, { Component } from 'react';
import { Provider } from 'react-redux';
import CounterApp from './CounterApp';
import createCounterStore from '../store/createCounterStore';

export default class App extends Component {
  render() {
    const store = createCounterStore(this.props.initialState);
    return (
      <Provider store={store}>
        {() => <CounterApp />}
      </Provider>
    );
  }
}
