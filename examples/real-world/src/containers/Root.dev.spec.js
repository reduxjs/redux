import React from 'react'
import ReactDOM from 'react-dom'
import Root from './Root.dev'
import configureStore from '../store/configureStore'

const store = configureStore()

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Root store={store} />, div)
})
