import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import Root from './components/Root';
import quizzReducer from './reducers/reducer';

/* eslint-disable no-underscore-dangle */
const store = createStore(quizzReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>, document.getElementById('root'),
);
