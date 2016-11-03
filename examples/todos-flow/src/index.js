// @flow
import React from 'react'
import { render } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './components/App'
import seducer from './seducers'
import type { Store } from './types'

const store: Store = createStore(seducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
