import React, { Component } from 'react';
import { Injector } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

export default class CounterApp {
  render() {
    return (
      <Injector actions={CounterActions}>
        {({ atom: { counter }, actions }) =>
          <Counter counter={counter} {...actions} />
        }
      </Injector>
    );
  }
}
