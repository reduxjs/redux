import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
import configureRouter from './router/configureRouter'
import 'todomvc-app-css/index.css'

const store = configureStore()
const stateNavigator = configureRouter()

stateNavigator.states.todomvc.navigated = function (data) {
  render(
    <Provider store={store}>
      <App filter={data.filter} stateNavigator={stateNavigator} />
    </Provider>,
    document.getElementById('root')
  )
}

stateNavigator.start()
