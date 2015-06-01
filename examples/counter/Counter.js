import React from 'react';
import connect from 'redux/connect';

@connect(
  ({ CounterStore }) => ({ CounterStore }),
  ({ increment, decrement }) => ({ increment, decrement })
)
export default class Counter {
  render() {
    return (
      <p>
        Clicked: {this.props.CounterStore.counter} times
        {' '}
        <button onClick={this.props.increment}>+</button>
        {' '}
        <button onClick={this.props.decrement}>-</button>
      </p>
    );
  }
}
