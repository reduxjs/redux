import React from 'react';
import { Dispatcher, composeStores } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';

export default class App {
  render() {
    return (
      <Dispatcher store={composeStores(stores)}>
        {() =>
          <div>
            <CounterApp />
            <TodoApp />
          </div>
        }
      </Dispatcher>
    );
  }
}
