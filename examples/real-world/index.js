import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { browserHistory } from 'react-router'
import Root from './containers/Root'
import configureStore from './store/configureStore'
import { syncHistoryWithStore } from './syncHistoryWithStore'

const store = configureStore()
const history = syncHistoryWithStore(browserHistory, store, {
  adjustUrlOnReplay: true
})

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
)
