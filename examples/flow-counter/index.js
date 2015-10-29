/* @flow */

import React from 'react';
import { Provider } from 'react-redux';
import App from './containers/App';
import configureStore from './store/configureStore';

const store = configureStore();

React.render(
  // Flow limitation: Does not detect children type if we don't explicitly
  // set the `children` prop
  <Provider store={store} children={() => <App />} />,
  document.getElementById('root')
);
