import React, { PropTypes } from 'react';

export default class Counter {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.number.isRequired
  };

  render() {
    const { increment, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        &nbsp;
        <button onClick={increment}>+</button>
        &nbsp;
        <button onClick={decrement}>-</button>
      </p>
    );
  }
}
