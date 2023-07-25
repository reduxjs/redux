import React from 'react'
import { createRoot } from 'react-dom/client'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import reducer from './reducers'
import generateTree from './generateTree'
import Node from './containers/Node'

const tree = generateTree()
const store = createStore(reducer, tree)

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <Node id={0} />
  </Provider>
)