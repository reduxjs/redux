import React from 'react';
import { connect, bindActionCreators } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';
import callbackMiddleware from 'redux/middleware/callback';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatcher } = this.props;
    const dispatch = callbackMiddleware(dispatcher.dispatch);
    const actionCreators = bindActionCreators(CounterActions, dispatch);
    return (
      <Counter counter={counter}
               {...actionCreators}
               incrementIfOdd={() => actionCreators.incrementIfOdd(counter)} />
    );
  }
}
