import React from 'react';
import { connect } from 'redux/react';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}), CounterActions)
export default class CounterApp {
  render() {
    const { counter, actions } = this.props;
    return (
      <Counter counter={counter} {...actions} />
    );
  }
}
