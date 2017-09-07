import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import Immutable from 'immutable'
import App from './containers/App'
import reducer from './reducers'
import 'todomvc-app-css/index.css'

const initialState = Immutable.Map()
const store = createStore(reducer, initialState)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
