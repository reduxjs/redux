import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter from './reducers'

const rootEl = document.createElement('div')
document.body.appendChild(rootEl)

const store = createStore(counter)

function render() {
  ReactDOM.render(
    <Counter
      value={store.getState()}
      onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
      onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
    />,
    rootEl
  )
}

render()
store.subscribe(render)

if (module.hot) {
  module.hot.accept('./components/Counter', () => {
    render(<Counter store={store} />, rootEl)
  })
}
