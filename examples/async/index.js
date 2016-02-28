import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store/configureStore'
import App from './containers/App'

const store = configureStore()
const rootEl = document.getElementById('root')

function render(rootReactEl) {
  ReactDOM.render(
    <Provider store={store}>
      {rootReactEl}
    </Provider>,
    rootEl
  )
}

render(<App />)

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    const RedBox = require('redbox-react')
    const UpdatedApp = require('./containers/App').default
    setTimeout(() => {
      try {
        render(<UpdatedApp />)
      } catch (error) {
        render(<RedBox error={error} />)
      }
    })
  })
}