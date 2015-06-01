import React from 'react';
import CounterApp from './counter/App';
import TodoApp from './todo/App';

React.render(
  <div>
    <CounterApp />
    <TodoApp />
  </div>,
  document.getElementById('root')
);
