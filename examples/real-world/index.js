import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { syncReduxAndRouter } from 'redux-simple-router'
import Root from './containers/Root'
import configureStore from './store/configureStore'

const history = createBrowserHistory()
const store = configureStore()

syncReduxAndRouter(history, store)

render(
  <Root history={history} store={store} />,
  document.getElementById('root')
)
