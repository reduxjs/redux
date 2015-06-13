import React from 'react';
import Router, { HistoryLocation } from 'react-router';
import { Provider } from 'redux/react';
import { createDispatcher, createRedux, composeStores } from 'redux';
import { loggerMiddleware, thunkMiddleware } from './middleware';
import routes from './routes';
import * as stores from './stores';

const dispatcher = createDispatcher(
  composeStores(stores),
  getState => [thunkMiddleware(getState), loggerMiddleware]
);
const redux = createRedux(dispatcher);

Router.run(routes, HistoryLocation, (Handler, state) =>
  React.render(
    <Provider redux={redux}>
      {() => <Handler router={state} />}
    </Provider>
  , document.getElementById('root')));
