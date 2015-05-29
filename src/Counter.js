import React from 'react';
import connect from './redux/connect';

@connect(
  stores => ({
    counterState: stores.CounterStore
  }),
  actions => ({
    increment: actions.increment
  })
)
export default class Counter {
  render() {
    return (
      <button onClick={this.props.increment}>
        {this.props.counterState.counter}
      </button>
    );
  }
}