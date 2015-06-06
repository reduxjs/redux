import React from 'react';
import { inject } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@inject({
  actions: CounterActions,
  select: state => ({
    counter: state.counter
  })
})
export default class CounterApp {
  render() {
    return (
      <Counter {...this.props} />
    );
  }
}
