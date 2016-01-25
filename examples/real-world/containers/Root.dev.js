import React, { Component, PropTypes } from 'react'
import { Provider } from 'react-redux'
import Routes from '../routes'
import DevTools from './DevTools'

export default class Root extends Component {
  render() {
    const { store } = this.props
    return (
      <Provider store={store}>
        <div>
          <Routes />
          <DevTools />
        </div>
      </Provider>
    )
  }
}

Root.propTypes = {
  store: PropTypes.object.isRequired
}
