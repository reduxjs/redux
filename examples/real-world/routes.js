import React from 'react'
import { Route, browserHistory, Router } from 'react-router'
import App from './containers/App'
import UserPage from './containers/UserPage'
import RepoPage from './containers/RepoPage'

export default function Routes() {
  return (<Router history={browserHistory}>
            <Route path="/" component={App}>
              <Route path="/:login/:name"
                     component={RepoPage} />
              <Route path="/:login"
                     component={UserPage} />
            </Route>
          </Router>)
}
