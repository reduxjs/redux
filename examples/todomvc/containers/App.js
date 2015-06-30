import React from 'react';
import TodoApp from './TodoApp';
import { createStore, composeReducers } from 'redux/index';
import { Provider } from 'redux/react';
import * as reducers from '../reducers';

const reducer = composeReducers(reducers);
const store = createStore(reducer);

export default class App {
  render() {
    return (
      <Provider store={store}>
        {() => <TodoApp /> }
      </Provider>
    );
  }
}
