import 'babel-core/polyfill';
import React from 'react';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import configureStore from './store/configureStore';
import App from './containers/App';
import UserPage from './containers/UserPage';
import RepoPage from './containers/RepoPage';

const history = new BrowserHistory();
const store = configureStore();

React.render(
  <Provider store={store}>
    {() =>
      <Router history={history}>
        <Route path="/" component={App}>
          <Route path="/:login/:name"
                 component={RepoPage} />
          <Route path="/:login"
                 component={UserPage} />
        </Route>
      </Router>
    }
  </Provider>,
  document.getElementById('root')
);
