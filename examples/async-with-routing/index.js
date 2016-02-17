import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Router from 'react-router/lib/Router'
import browserHistory from 'react-router/lib/browserHistory'
import { Provider } from 'react-redux'
import routes from './routes'
import configureStore from './store/configureStore'

const store = configureStore()

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      {routes}
    </Router>
  </Provider>,
  document.getElementById('root')
)
