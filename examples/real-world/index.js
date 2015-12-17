import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import configureStore from './store/configureStore'
import { createHistory } from 'history'
import { syncReduxAndRouter } from 'redux-simple-router'

const store = configureStore()
const history = createHistory()

syncReduxAndRouter(history, store)

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
)
