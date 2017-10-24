import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import { default as Microstates, Number } from 'microstates';
import { map } from 'funcadelic';

const render = value => {
  let ms = Microstates.from(Number, value);

  let { increment, decrement } = map(
    transition => (...args) => render(transition(...args)),
    ms.transitions
  );

  ReactDOM.render(
    <Counter value={ms.states} onIncrement={() => increment()} onDecrement={() => decrement()} />,
    document.getElementById('root')
  );
};

render();
