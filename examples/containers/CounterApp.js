import React from 'react';
import { connect } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect({
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
