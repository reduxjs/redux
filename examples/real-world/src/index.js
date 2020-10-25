import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Root from './containers/Root'
import makeStore from './store/makeStore'

const store = makeStore()

render(
  <Router>
    <Root store={store} />
  </Router>,
  document.getElementById('root')
)
