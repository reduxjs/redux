// @flow

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './components/App';
import reducers from './reducers';

import type { Store } from './types';

const store: Store = createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
const element = document.getElementById('root');
if (!element) {
  throw new Error("couldn't find element with id root")
}
render(
  <Provider store={store}>
    <App />
  </Provider>,
  element
);
