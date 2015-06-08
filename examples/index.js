import React from 'react';
import Router, { HistoryLocation } from 'react-router';
import { composeStores, createDispatcher, Provider } from 'redux';
import routes from './routes';
import * as stores from './stores';

const dispatcher = createDispatcher(composeStores(stores));

Router.run(routes, HistoryLocation, (Handler, state) =>
  React.render(
    <Provider dispatcher={dispatcher}>
      {() => <Handler {...state} />}
    </Provider>
  , document.getElementById('root')));
