import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import Root from './containers/Root'
import configureStore from './store/configureStore'

const store = configureStore()
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <Router>
    <Root store={store} />
  </Router>
)