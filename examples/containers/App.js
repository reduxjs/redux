import React from 'react';
import { createDispatcher, Provider, composeStores, reduceStore } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';

const store = composeStores(stores);
const dispatcher = createDispatcher(getAtom => reduceStore(getAtom, store));

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
