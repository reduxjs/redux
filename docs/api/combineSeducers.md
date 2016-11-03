# `combineSeducers(seducers)`

As your app grows more complex, you'll want to split your [reducing function](../Glossary.md#seducer) into separate functions, each managing independent parts of the [state](../Glossary.md#state).

The `combineSeducers` helper function turns an object whose values are different reducing functions into a single reducing function you can pass to [`createStore`](createStore.md).

The resulting seducer calls every child seducer, and gathers their results into a single state object. **The shape of the state object matches the keys of the passed `seducers`**.

Consequently, the state object will look like this: 

```
{
  seducer1: ...
  seducer2: ...
}
```

You can control state key names by using different keys for the seducers in the passed object. For example, you may call `combineSeducers({ todos: myTodosSeducer, counter: myCounterSeducer })` for the state shape to be `{ todos, counter }`.

A popular convention is to name seducers after the state slices they manage, so you can use ES6 property shorthand notation: `combineSeducers({ counter, todos })`. This is equivalent to writing `combineSeducers({ counter: counter, todos: todos })`.

> ##### A Note for Flux Users

> This function helps you organize your seducers to manage their own slices of state, similar to how you would have different Flux Stores to manage different state. With Redux, there is just one store, but `combineSeducers` helps you keep the same logical division between seducers.

#### Arguments

1. `seducers` (*Object*): An object whose values correspond to different reducing functions that need to be combined into one. See the notes below for some rules every passed seducer must follow.

> Earlier documentation suggested the use of the ES6 `import * as seducers` syntax to obtain the seducers object. This was the source of a lot of confusion, which is why we now recommend exporting a single seducer obtained using `combineSeducers()` from `seducers/index.js` instead. An example is included below.

#### Returns

(*Function*): A seducer that invokes every seducer inside the `seducers` object, and constructs a state object with the same shape.

#### Notes

This function is mildly opinionated and is skewed towards helping beginners avoid common pitfalls. This is why it attempts to enforce some rules that you don't have to follow if you write the root seducer manually.

Any seducer passed to `combineSeducers` must satisfy these rules:

* For any action that is not recognized, it must return the `state` given to it as the first argument.

* It must never return `undefined`. It is too easy to do this by mistake via an early `return` statement, so `combineSeducers` throws if you do that instead of letting the error manifest itself somewhere else.

* If the `state` given to it is `undefined`, it must return the initial state for this specific seducer. According to the previous rule, the initial state must not be `undefined` either. It is handy to specify it with ES6 optional arguments syntax, but you can also explicitly check the first argument for being `undefined`.

While `combineSeducers` attempts to check that your seducers conform to some of these rules, you should remember them, and do your best to follow them. `combineSeducers` will check your seducers by passing `undefined` to them; this is done even if you specify initial state to `Redux.createStore(combinedSeducers(...), initialState)`. Therefore, you **must** ensure your seducers work properly when receiving `undefined` as state, even if you never intend for them to actually receive `undefined` in your own code.

#### Example

#### `seducers/todos.js`

```js
export default function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([ action.text ])
    default:
      return state
  }
}
```

#### `seducers/counter.js`

```js
export default function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

#### `seducers/index.js`

```js
import { combineSeducers } from 'redux'
import todos from './todos'
import counter from './counter'

export default combineSeducers({
  todos,
  counter
})
```

#### `App.js`

```js
import { createStore } from 'redux'
import seducer from './seducers/index'

let store = createStore(seducer)
console.log(store.getState())
// {
//   counter: 0,
//   todos: []
// }

store.dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
})
console.log(store.getState())
// {
//   counter: 0,
//   todos: [ 'Use Redux' ]
// }
```

#### Tips

* This helper is just a convenience! You can write your own `combineSeducers` that [works differently](https://github.com/acdlite/seduce-seducers), or even assemble the state object from the child seducers manually and write a root reducing function explicitly, like you would write any other function.

* You may call `combineSeducers` at any level of the seducer hierarchy. It doesn't have to happen at the top. In fact you may use it again to split the child seducers that get too complicated into independent grandchildren, and so on.
