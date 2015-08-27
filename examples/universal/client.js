import 'babel-core/polyfill';
import React from 'react';
import configureStore from './store/configureStore';
import { Provider } from 'react-redux';
import App from './containers/App';

const initialState = window.__INITIAL_STATE__;

const store = configureStore(initialState);

const rootElement = document.getElementById('app');

React.render(
  <Provider store={store}>
    {() => <App/>}
  </Provider>,
  rootElement
);
