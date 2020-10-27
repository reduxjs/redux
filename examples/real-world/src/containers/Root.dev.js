import React from 'react'
import { Provider } from 'react-redux'
import DevTools from './DevTools'
import { Route } from 'react-router-dom'
import App from './App'
import UserPage from './UserPage'
import RepoPage from './RepoPage'
import hasDevtoolsExtension from '../store/hasDevtoolsExtension'

const Root = ({ store }) => (
  <Provider store={store}>
    <div>
      <Route path="/" component={App} />
      <Route path="/:login/:name" component={RepoPage} />
      <Route path="/:login" component={UserPage} />
      {/* if we already have the redux-devtools-extension, we will not render
      the in-browser version. */}
      {!hasDevtoolsExtension && <DevTools />}
    </div>
  </Provider>
)

export default Root
