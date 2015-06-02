import React from 'react';
import connect from 'redux/connect';

@connect({
  CounterStore: ({ counter }) => ({
    value: counter
  })
})
export default class Counter {
  render() {
    return (
      <p>
        Clicked: {this.props.value} times
        {' '}
        <button onClick={() => this.props.actions.increment()}>+</button>
        {' '}
        <button onClick={() => this.props.actions.decrement()}>-</button>
      </p>
    );
  }
}
