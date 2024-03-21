---
id: combinereducers
title: combineReducers
hide_title: true
description: 'API > combineReducers: merging slice reducers to create combined state'
---

&nbsp;

# `combineReducers(reducers)`

## Overview

The `combineReducers` helper function turns an object whose values are different "slice reducer" functions into a single combined reducer function you can pass to Redux Toolkit's [`configureStore`](https://redux-toolkit.js.org/api/configureStore) (or the legacy [`createStore`](createStore.md) method)

The resulting combined reducer calls every slice reducer any time an action is dispatched, and gathers their results into a single state object. This enables splitting up reducer logic into separate functions, each managing their own slice of the state independently.

:::tip

This should be rarely needed - Redux Toolkit's [`configureStore` method](https://redux-toolkit.js.org/api/configureStore) will automatically call `combineReducers` for you if you pass in an object of slice reducers:

```ts
const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer
  }
})
```

You can still call `combineReducers()` yourself if you need to construct the root reducer manually first.

:::

### State Slices

**The state produced by `combineReducers()` namespaces the states of each reducer under their keys as passed to `combineReducers()`**

Example:

```js
rootReducer = combineReducers({potato: potatoReducer, tomato: tomatoReducer})
// This would produce the following state object
{
  potato: {
    // ... potatoes, and other state managed by the potatoReducer ...
  },
  tomato: {
    // ... tomatoes, and other state managed by the tomatoReducer, maybe some nice sauce? ...
  }
}
```

You can control state key names by using different keys for the reducers in the passed object. For example, you may call `combineReducers({ todos: myTodosReducer, counter: myCounterReducer })` for the state shape to be `{ todos, counter }`.

## Arguments

1. `reducers` (_Object_): An object whose values correspond to different reducer functions that need to be combined into one.

```ts
combineReducers({
  posts: postsReducer,
  comments: commentsReducer
})
```

See the notes below for some rules every passed reducer must follow.

### Returns

(_Function_): A reducer that invokes every reducer inside the `reducers` object, and constructs a state object with the same shape.

## Notes

This function is mildly opinionated and is skewed towards helping beginners avoid common pitfalls. This is why it attempts to enforce some rules that you don't have to follow if you write the root reducer manually.

Any reducer passed to `combineReducers` must satisfy these rules:

- For any action that is not recognized, it must return the `state` given to it as the first argument.

- It must never return `undefined`. It is too easy to do this by mistake via an early `return` statement, so `combineReducers` throws if you do that instead of letting the error manifest itself somewhere else.

- If the `state` given to it is `undefined`, it must return the initial state for this specific reducer. According to the previous rule, the initial state must not be `undefined` either. It is handy to specify it with optional arguments syntax, but you can also explicitly check the first argument for being `undefined`.

While `combineReducers` attempts to check that your reducers conform to some of these rules, you should remember them, and do your best to follow them. `combineReducers` will check your reducers by passing `undefined` to them; this is done even if you specify initial state to `Redux.createStore(combineReducers(...), initialState)`. Therefore, you **must** ensure your reducers work properly when receiving `undefined` as state, even if you never intend for them to actually receive `undefined` in your own code.

## Example

#### `reducers/todos.js`

```js
export default function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
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
import { combineReducers } from '@reduxjs/toolkit'
import todos from './todos'
import counter from './counter'

export default combineReducers({
  todos,
  counter
})
```

#### `App.js`

```js
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducers/index'

const store = configureStore({
  reducer
})
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

## Tips

- This helper is just a convenience! You can write your own `combineReducers` that [works differently](https://github.com/redux-utilities/reduce-reducers), or even assemble the state object from the child reducers manually and write a root reducer function explicitly, like you would write any other function.

- You may call `combineReducers` at any level of the reducer hierarchy. It doesn't have to happen at the top. In fact you may use it again to split the child reducers that get too complicated into independent grandchildren, and so on.
