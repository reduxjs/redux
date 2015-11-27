import React from 'react'
import { Route, Redirect } from 'react-router'
import App from './containers/App'
import UserPage from './containers/UserPage'
import RepoPage from './containers/RepoPage'

export default (
  <Route path="/" component={App}>
    <Route path="/:login/:name"
           component={RepoPage} />
    <Route path="/:login"
           component={UserPage} />

    {/* needed to get github pages to work */}
    <Redirect from="*" to="/" />

  </Route>
)
