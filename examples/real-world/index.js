import 'babel-core/polyfill';
import React from 'react';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import configureStore from './store/configureStore';
import App from './containers/App';
import UserPage from './containers/UserPage';
import RepoPage from './containers/RepoPage';

const history = createBrowserHistory();
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
