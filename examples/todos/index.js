import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './actions'
import App from './components/App'

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
