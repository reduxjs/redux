import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import Counter from './components/Counter'
import counter from './reducers'

const store = createStore(counter)
const rootEl = document.getElementById('root')

const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)

render()

//observable使用方法
const state$ = store[Symbol.observable]();
const subscription = state$.subscribe({
  next: function(x) {
    console.log(x);
  }
});
subscription.unsubscribe();

store.subscribe(render)
