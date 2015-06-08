import React from 'react';
import { connect, bindActionCreators } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatcher } = this.props;
    const actionCreators = bindActionCreators(CounterActions, dispatcher.dispatch);
    return (
      <Counter counter={counter}
               {...actionCreators}
               incrementIfOdd={() => actionCreators.incrementIfOdd(counter)} />
    );
  }
}
