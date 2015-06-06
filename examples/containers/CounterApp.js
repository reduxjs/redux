import React from 'react';
import { Injector } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

function select(state) {
  return state.counter;
}

export default class CounterApp {
  render() {
    return (
      <Injector actions={CounterActions}
                select={select}>
        {({ state, actions }) =>
          <Counter counter={state} {...actions} />
        }
      </Injector>
    );
  }
}
