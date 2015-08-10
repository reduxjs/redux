import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router';
import createAsyncExampleStore from '../store/createAsyncExampleStore';
import { DebugPanel, DevTools, LogMonitor } from 'redux-devtools/lib/react';
import App from './App';
import UserPage from './UserPage';
import RepositoryPage from './RepositoryPage';

const store = createAsyncExampleStore();

export default class Root extends Component {
  render() {
    return (
      <div>
        <Provider store={store}>
          {() =>
            <Router history={this.props.history}>
              <Route path='/' component={App}>
                <Route path='/:userLogin/:repositoryName'
                       component={RepositoryPage} />
                <Route path='/:userLogin'
                       component={UserPage} />
              </Route>
            </Router>
          }
        </Provider>
        {this.renderDevTools()}
      </div>
    );
  }

  renderDevTools() {
    return (
      <DebugPanel top right bottom>
        <DevTools store={store}
                  monitor={LogMonitor} />
      </DebugPanel>    
    );
  }
}
