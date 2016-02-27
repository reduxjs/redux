import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import Node from './containers/Node'
import configureStore from './store/configureStore'
import generateTree from './generateTree'

const tree = generateTree()
const store = configureStore(tree)

render(
  <Provider store={store}>
    <Node id={0} />
  </Provider>,
  document.getElementById('root')
)
