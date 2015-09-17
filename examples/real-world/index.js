import 'babel-core/polyfill';
import React from 'react';
import Root from './containers/Root';
import createBrowserHistory from 'history/lib/createBrowserHistory';

React.render(
  <Root history={new createBrowserHistory()} />,
  document.getElementById('root')
);
