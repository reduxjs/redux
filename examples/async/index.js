import React from 'react';
import Root from './containers/Root';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import 'babel-core/polyfill';

React.render(
  <Root history={new BrowserHistory()} />,
  document.getElementById('root')
);
