import React from 'react';
import { createDispatcher, Provider, composeStores, reduceStore, compose } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';
import createTransactor from '../middleware/createTransactor';
import callbackMiddleware from 'redux/middleware/callback';

// Naive implementation of promise middleware
// Leave full implementation to userland
function promiseMiddleware(next) {
  return action =>
    action && typeof action.then === 'function'
      ? action.then(next)
      : next(action);
}

const store = composeStores(stores);
const transactor = createTransactor();
const dispatcher = createDispatcher(getAtom => compose(
  promiseMiddleware,
  callbackMiddleware,
  transactor(getAtom, store)
));

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
