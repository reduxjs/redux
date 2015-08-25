import React from 'react';
import { Provider } from 'react-redux';
import CounterApp from './containers/CounterApp';
import configureStore from './store/configureStore';

const store = configureStore();

React.render(
  <Provider store={store}>
    {() => <CounterApp />}
  </Provider>,
  document.getElementById('root')
)
