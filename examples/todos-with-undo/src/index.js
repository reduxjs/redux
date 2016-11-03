import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './components/App'
import seducer from './seducers'

const store = createStore(seducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
