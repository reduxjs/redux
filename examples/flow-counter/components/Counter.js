/* @flow */

import React, { Component } from 'react';

export type CounterProps = {
  counter: number,
  increment: () => any,
  decrement: () => any,
  incrementIfOdd: () => any,
  incrementAsync: () => any,
};

class Counter extends Component<any, CounterProps, any> {
  render() : ReactElement<any, any, any> {
    let { increment, incrementIfOdd, incrementAsync, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
        <button onClick={incrementIfOdd}>Increment if odd</button>
        {' '}
        <button onClick={() => incrementAsync()}>Increment async</button>
      </p>
    );
  }
}

export default Counter;
