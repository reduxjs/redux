import 'babel/polyfill';

import React from 'react';
import App from './containers/App';
import 'todomvc-app-css/index.css';

React.render(
  <App />,
  document.getElementById('root')
);
