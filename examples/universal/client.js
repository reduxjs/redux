import 'babel-core/polyfill';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './containers/App';
import counterApp from './reducers';

console.log("hi!");

const initialState = window.__INITIAL_STATE__;

let store = createStore(counterApp, initialState);

let rootElement = document.getElementById('app');

React.render(
  <Provider store={store}>
    {() => <App/>}
  </Provider>,
  rootElement
);
