import React from 'react';
import { createDispatcher, Provider, composeStores, reduceStore } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';
import createTransactor from '../middleware/createTransactor';

const store = composeStores(stores);
const transactor = createTransactor();
const dispatcher = createDispatcher(getAtom => transactor(getAtom, store));

global.transactor = transactor;

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
