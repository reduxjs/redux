import 'babel-core/polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './containers/App'
import configureStore from './store/configureStore'
import 'todomvc-app-css/index.css'
import { start, StateInfoConfig } from 'navigation'

StateInfoConfig.build([
    { key: 'todomvc', initial: 'app', states: [
        { key: 'app', route: '{filter?}', defaults: { filter: 'all' }, trackCrumbTrail: false }
    ] }   
])

const store = configureStore()

var todomvc = StateInfoConfig.dialogs.todomvc
todomvc.states.app.navigated =  (data) => {
  render(
    <Provider store={store}>
      <App filter={data.filter} />
    </Provider>,
    document.getElementById('root')
  )
}

start()


