import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore} from 'react-router-redux'

import configureStore from '../common/store/configureStore'
import routes from '../common/routes'

import reducers from '../common/reducers'

const initialState = window.__INITIAL_STATE__
const store = configureStore(initialState)
const rootElement = document.getElementById('app')

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

render(
  <Provider store={store}>
    <Router history={browserHistory}>
      {routes}
    </Router>
  </Provider>,
  rootElement
)
