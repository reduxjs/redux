import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';
import { getAllProducts } from './actions';
import App from './containers/App';

const middleware = process.env.NODE_ENV === 'production' ?
  [thunk] :
  [thunk, logger()];

const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);
const store = createStoreWithMiddleware(reducer);

store.dispatch(getAllProducts());

React.render(
  <Provider store={store}>
    {() => <App />}
  </Provider>,
  document.getElementById('root')
);
