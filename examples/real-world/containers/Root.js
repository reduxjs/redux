import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import App from './App';
import UserPage from './UserPage';
import RepoPage from './RepoPage';

export default class Root extends Component {
  render() {
    return (
      <div>
        <Provider store={this.props.store}>
          {() =>
            <Router history={this.props.history}>
              <Route path='/' component={App}>
                <Route path='/:login/:name'
                       component={RepoPage} />
                <Route path='/:login'
                       component={UserPage} />
              </Route>
            </Router>
          }
        </Provider>
      </div>
    );
  }
}
