import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './components/Root'
import configureStore from './store/configureStore'

const rootEl = document.createElement('div')
document.body.appendChild(rootEl)

const store = configureStore()
render(<Root store={store} />, rootEl)

if (module.hot) {
  module.hot.accept('./components/Root', () => {
    render(<Root store={store} />, rootEl)
  })
}
