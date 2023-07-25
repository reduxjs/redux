import 'babel-polyfill'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import configureStore from '../common/store/configureStore'
import App from '../common/containers/App'

const store = configureStore(window.__PRELOADED_STATE__)
delete window.__PRELOADED_STATE__
const container = document.getElementById('app')
const root = createRoot(container)

root.render(
  <Provider store={store}>
    <App/>
  </Provider>
)