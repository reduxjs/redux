import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import { Router } from 'react-router'
import routes from '../routes'

export default class Root extends Component {
  render() {
    const { history, store } = this.props
    return (
      <Provider store={store}>
        <div>
          <Router history={history}>
            {routes}
          </Router>
        </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  history: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired
}
