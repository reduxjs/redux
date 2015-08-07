import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Counter from '../components/Counter';
import createCounterStore from '../store/createCounterStore';

const store = createCounterStore();

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        {() => <Counter />}
      </Provider>
    );
  }
}
