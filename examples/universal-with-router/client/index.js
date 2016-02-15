import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistory } from 'react-router-redux'

import configureStore from '../common/store/configureStore'
import reducers from '../common/reducers'
import routes from '../common/routes'

const initialState = window.__INITIAL_STATE__
const reduxRouterMiddleware = syncHistory(browserHistory)
const store = configureStore(initialState, [reduxRouterMiddleware])
const rootElement = document.getElementById('app')

reduxRouterMiddleware.listenForReplays(store)

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      {routes}
    </Router>
  </Provider>,
  rootElement
)
