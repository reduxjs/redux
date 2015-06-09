import React from 'react';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import { createRedux, composeStores, Provider } from 'redux';
import createDispatcher from '../dispatcher/createDispatcher';
import * as stores from '../stores/index';

const store = composeStores(stores);
// You can modify these options while the code is running:
const dispatcher = createDispatcher(store, { log: true, replay: false });
const redux = createRedux(dispatcher);

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
