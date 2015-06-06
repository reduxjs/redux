import React from 'react';
import { dispatch, composeStores } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';

@dispatch(composeStores(stores))
export default class App {
  render() {
    return (
      <div>
        <CounterApp />
        <TodoApp />
      </div>
    );
  }
}
