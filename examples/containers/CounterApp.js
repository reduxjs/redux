import React from 'react';
import { connect, bindActions } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatcher } = this.props;
    return (
      <Counter counter={counter}
               {...bindActions(CounterActions, dispatcher)} />
    );
  }
}
