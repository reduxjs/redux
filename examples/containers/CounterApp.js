import React from 'react';
import { connect, bindActionCreators, compose } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';
import callbackMiddleware from 'redux/middleware/callback';

// Naive implementation of promise middleware
// Leave full implementation to userland
function promiseMiddleware(next) {
  return action =>
    action && typeof action.then === 'function'
      ? action.then(next)
      : next(action);
}

const middleware = compose(callbackMiddleware, promiseMiddleware);

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatcher } = this.props;
    const dispatch = middleware(dispatcher.dispatch);
    const actionCreators = bindActionCreators(CounterActions, dispatch);
    return (
      <Counter counter={counter}
               {...actionCreators}
               incrementIfOdd={() => actionCreators.incrementIfOdd(counter)} />
    );
  }
}
