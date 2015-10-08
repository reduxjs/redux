import 'babel-core/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ReduxRouter } from 'redux-router';
import configureStore from './store/configureStore';

const store = configureStore();

render(
  <Provider store={store}>
    <ReduxRouter />
  </Provider>,
  document.getElementById('root')
);

if (process.env.NODE_ENV !== 'production') {
  // Use require because imports can't be conditional.
  // In production, you should ensure process.env.NODE_ENV
  // is envified so that Uglify can eliminate this
  // module and its dependencies as dead code.
  try {
    require('./createDevToolsWindow')(store);
  } catch (e) {
    const errorMsg = (
      'Couldn\'t open the dev Tools, probably the popup window ' +
      'was blocked or see the thrown error on the javascript console.\n'
    );
    console.log(errorMsg, e);
    alert(errorMsg);
  }
}
