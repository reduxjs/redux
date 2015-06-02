import React from 'react';
import { performs, observes } from 'redux';

@performs('increment', 'decrement')
@observes('counterStore')
export default class Counter {
  render() {
    const { increment, decrement } = this.props;
    return (
      <p>
        Clicked: {this.props.counter} times
        {' '}
        <button onClick={() => increment()}>+</button>
        {' '}
        <button onClick={() => decrement()}>-</button>
      </p>
    );
  }
}
