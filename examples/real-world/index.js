import 'babel-core/polyfill';
import React from 'react';
import Root from './containers/Root';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import configureStore from '../store/configureStore';

const store = configureStore();

React.render(
  <Root history={new BrowserHistory()} store={store} />,
  document.getElementById('root')
);
