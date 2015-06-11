import React from 'react';
import Router, { HistoryLocation } from 'react-router';
import { createRedux } from 'redux';
import { Provider } from 'redux/react';
import routes from './routes';
import * as stores from './stores';

const redux = createRedux(stores);

Router.run(routes, HistoryLocation, (Handler, state) =>
  React.render(
    <Provider redux={redux}>
      {() => <Handler {...state} />}
    </Provider>
  , document.getElementById('root')));
