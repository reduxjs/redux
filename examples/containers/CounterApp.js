import React from 'react';
import { Injector } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

export default class CounterApp {
  render() {
    return (
      <Injector actions={CounterActions}>
        {({ state: { counter }, actions }) =>
          <Counter counter={counter} {...actions} />
        }
      </Injector>
    );
  }
}
