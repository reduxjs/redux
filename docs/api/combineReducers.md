# `combineReducers(reducers)`

As your app grows more complex, you’ll want to split your [reducing function](../Glossary.md#reducer) into separate functions, each managing independent parts of the [state](../Glossary.md#state).

The `combineReducers` helper function turns an object whose values are different reducing functions into a single reducing function you can pass to [`createStore`](createStore.md).

The resulting reducer calls every child reducer, and gathers their results into a single state object. **The shape of the state object will match the shape of the reducer tree `reducers`**.  

In other words, if you create a reducer as such...

```
const myReducer = combineReducers({
  foo: <function>,
  bar: <function>,
  baz: {
    baz1: <function>,
    baz2: <function>
  }
})
```

...then the shape of the resulting state when running `myReducer` would look like the following.

```
{
  foo: <result of foo reducer>,
  bar: <result of bar reducer>,
  baz: {
    baz1: <result of baz1 reducer>,
    baz2: <result of baz2 reducer>
  }
```

You can control state key names by using different keys for the reducers in the passed object. For example, you may call `combineReducers({ todos: myTodosReducer, counter: myCounterReducer })` for the state shape to be `{ todos, counter }`.

A popular convention is to name reducers after the state slices they manage, so you can use ES6 property shorthand notation: `combineReducers({ counter, todos })`. This is equivalent to writing `combineReducers({ counter: counter, todos: todos })`.



> ##### A Note for Flux Users

> This function helps you organize your reducers to manage their own slices of state, similar to how you would have different Flux Stores to manage different state. With Redux, there is just one store, but `combineReducers` helps you keep the same logical division between reducers.

#### 

Using `combineReducers` can be a good way to enforce separation of concerns in your reducer graph.  Each sub-reducer receives the previous state for its specific reducer path and is only responsible for returning the next state for that same path.  However, as your application becomes more sophisticated sometimes you'll need to cheat and allow a sub-reducer to access some part of the global state.  This in particular can happen when you manage some global cached resource in your state that you don't want to duplicate for each sub-reducer that needs it (eg. when you use [Normalizr](https://github.com/paularmstrong/normalizr)).   `combineReducers` handles this use case by allowing each sub-reducer to optionally access the global state if it happens to need it.

For example, if you had a state shape like...

```
{
  myCache: { ... },
  foo: { ... },
  bar: { ... }
}
```

... you could access the state at `myCache` in other sub-reducers like so:

```
const reducer = combineReducers({
  myCache: <reducer function>,
  foo: <reducer function>,
  bar: (state, action, prevGlobalState) => {
    let someObject = prevGlobalState.myCache['some_key']
    ...
  }
})
```

Note that because the order of object keys in javascript is undefined, the order in which your sub-reducers are executed is also undefined.  As such, the `prevGlobalState` is exactly what it sounds like and does not reflect any changes in state caused during the processing of the current action.  In addition, be sure not to mutate `prevGlobalState`.


#### Arguments

1. `reducers` (*Object*): An object tree that defines a potentially multi-level mapping of how the sub-reducer functions are composed into a final reducer function that creates the next state.  Each value in this object must either be a sub-reducer function or another object that defines that next level of state.  See the notes below for some rules every passed reducer must follow.

> Earlier documentation suggested the use of the ES6 `import * as reducers` syntax to obtain the reducers object. This was the source of a lot of confusion, which is why we now recommend exporting a single reducer obtained using `combineReducers()` from `reducers/index.js` instead. An example is included below.

#### Returns

(*Function*): A reducer that recursively invokes every reducer inside the `reducers` object, and constructs a state object with the same shape.  

In addition to the required `state` and `action` arguments, this reducer can also be passed a third argument `stateWindow`.  When present, `stateWindow` is passed as the third argument to each of the sub-reducers when they are executed instead of `prevGlobalState`.  This can be used as a way of restricting access to the global state from the sub-reducers or as a way to chain multiple calls to `combineReducers` while still giving the subsidiary reducing functions access to a specific slice of the state.

#### Notes

This function is mildly opinionated and is skewed towards helping beginners avoid common pitfalls. This is why it attempts to enforce some rules that you don’t have to follow if you write the root reducer manually.

Any reducer passed to `combineReducers` must satisfy these rules:

* For any action that is not recognized, it must return the `state` given to it as the first argument.

* It must never return `undefined`. It is too easy to do this by mistake via an early `return` statement, so `combineReducers` throws if you do that instead of letting the error manifest itself somewhere else.

* If the `state` given to it is `undefined`, it must return the initial state for this specific reducer. According to the previous rule, the initial state must not be `undefined` either. It is handy to specify it with ES6 optional arguments syntax, but you can also explicitly check the first argument for being `undefined`.

While `combineReducers` attempts to check that your reducers conform to some of these rules, you should remember them, and do your best to follow them.

#### Example

#### `reducers/todos.js`

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

#### `reducers/counter.js`

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

#### `reducers/index.js`

```js
import { combineReducers } from 'redux'
import todos from './todos'
import counter from './counter'

export default combineReducers({
  todos,
  counter
})
```

#### `App.js`

```js
import { createStore } from 'redux'
import reducer from './reducers/index'

let store = createStore(reducer)
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

* This helper is just a convenience! You can write your own `combineReducers` that [works differently](https://github.com/acdlite/reduce-reducers), or even assemble the state object from the child reducers manually and write a root reducing function explicitly, like you would write any other function.

* You may call `combineReducers` at any level of the reducer hierarchy. Though it can compose a multi-level reducer tree, you don't always have to use it to define just the root reducer.  You could, for instance, use it to create a root reducer with a custom sub-reducer that in turn, after executing some custom logic, invokes a reducer that was created by a separate call to `combineReducers`.  
