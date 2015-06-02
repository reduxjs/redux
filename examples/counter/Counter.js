import React from 'react';
import connect from 'redux/connect';

@connect({
  CounterStore: ({ counter }) => ({
    value: counter
  })
})
export default class Counter {
  render() {
    const { increment, decrement } = this.props.actions;
    return (
      <p>
        Clicked: {this.props.value} times
        {' '}
        <button onClick={() => increment()}>+</button>
        {' '}
        <button onClick={() => decrement()}>-</button>
      </p>
    );
  }
}
