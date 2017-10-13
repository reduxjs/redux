import React from 'react'
import PropTypes from 'prop-types'
import { Provider } from 'react-redux'
import { BrowserRouter as Router } from 'react-router-dom'
import { Route } from 'react-router-dom'
import App from './App'
import UserPage from './UserPage'
import RepoPage from './RepoPage'

const PrimaryLayout = () => (
  <div>
    <Route path="/" component={App} />
    <Route path="/:login/:name" component={RepoPage} />
    <Route path="/:login" component={UserPage} />
  </div>
)

const Root = ({ store }) => (
  <Provider store={store}>
    <Router>
      <PrimaryLayout />
    </Router>
  </Provider>
)

Root.propTypes = {
  store: PropTypes.object.isRequired,
}
export default Root
