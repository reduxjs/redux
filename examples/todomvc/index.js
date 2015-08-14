import 'babel/polyfill';

import React from 'react';
import Root from './containers/Root';
import 'todomvc-app-css/index.css';

React.render(
  <Root />,
  document.getElementById('root')
);
