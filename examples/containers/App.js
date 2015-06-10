import React from 'react';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import { createRedux, Provider } from 'redux';
import * as stores from '../stores';

const redux = createRedux(stores);

export default class App {
  render() {
    return (
      <Provider redux={redux}>
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
