import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import store from './store'
import 'todomvc-app-css/index.css'

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
