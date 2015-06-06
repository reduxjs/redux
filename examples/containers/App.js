import React from 'react';
import { createDispatcher, Provider, composeStores } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';

const dispatcher = createDispatcher(composeStores(stores));

export default class App {
  render() {
    return (
      <Provider dispatcher={dispatcher}>
        {() =>
          <div>
            <CounterApp />
            <TodoApp />
          </div>
        }
      </Provider>
    );
  }
}
