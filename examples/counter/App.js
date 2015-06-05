import React, { Component } from 'react';
import { dispatch, Injector } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import * as stores from './stores/index';
import Counter from './Counter';

@dispatch(stores)
export default class CounterApp extends Component {
  render() {
    return (
      <Injector stores={{ counter: stores.counterStore }}
                actions={{ increment, decrement }}>
        {({ state, actions }) => <Counter {...state} {...actions} />}
      </Injector>
    );
  }
}
