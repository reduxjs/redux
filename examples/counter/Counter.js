import React from 'react';
import connect from 'redux/connect';

@connect(
  ({ CounterStore }) => ({ counterState: CounterStore }),
  ({ increment, decrement }) => ({ increment, decrement })
)
export default class Counter {
  render() {
    return (
      <p>
        Clicked: {this.props.counterState.counter} times
        {' '}
        <button onClick={this.props.increment}>+</button>
        {' '}
        <button onClick={this.props.decrement}>-</button>
      </p>
    );
  }
}
