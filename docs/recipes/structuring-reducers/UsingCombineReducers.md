---
id: using-combinereducers
title: Using combineReducers
sidebar_label: Using combineReducers
hide_title: true
---

# Using `combineReducers`

## Core Concepts

The most common state shape for a Redux app is a plain Javascript object containing "slices" of domain-specific data at each top-level key. Similarly, the most common approach to writing reducer logic for that state shape is to have "slice reducer" functions, each with the same `(state, action)` signature, and each responsible for managing all updates to that specific slice of state. Multiple slice reducers can respond to the same action, independently update their own slice as needed, and the updated slices are combined into the new state object.

Because this pattern is so common, Redux provides the `combineReducers` utility to implement that behavior. It is an example of a _higher-order reducer_, which takes an object full of slice reducer functions, and returns a new reducer function.

There are several important ideas to be aware of when using `combineReducers`:

- First and foremost, `combineReducers` is simply **a utility function to simplify the most common use case when writing Redux reducers**. You are _not_ required to use it in your own application, and it does _not_ handle every possible scenario. It is entirely possible to write reducer logic without using it, and it is quite common to need to write custom reducer logic for cases that `combineReducer` does not handle. (See [Beyond `combineReducers`](./BeyondCombineReducers.md) for examples and suggestions.)
- While Redux itself is not opinionated about how your state is organized, `combineReducers` enforces several rules to help users avoid common errors. (See [`combineReducers`](../../api/combineReducers.md) for details.)
- One frequently asked question is whether Redux "calls all reducers" when dispatching an action. Since there really is only one root reducer function, the default answer is "no, it does not". However, `combineReducers` has specific behavior that _does_ work that way. In order to assemble the new state tree, `combineReducers` will call each slice reducer with its current slice of state and the current action, giving the slice reducer a chance to respond and update its slice of state if needed. So, in that sense, using `combineReducers` _does_ "call all reducers", or at least all of the slice reducers it is wrapping.
- You can use it at all levels of your reducer structure, not just to create the root reducer. It's very common to have multiple combined reducers in various places, which are composed together to create the root reducer.

## Defining State Shape

There are two ways to define the initial shape and contents of your store's state. First, the `createStore` function can take `preloadedState` as its second argument. This is primarily intended for initializing the store with state that was previously persisted elsewhere, such as the browser's localStorage. The other way is for the root reducer to return the initial state value when the state argument is `undefined`. These two approaches are described in more detail in [Initializing State](./InitializingState.md), but there are some additional concerns to be aware of when using `combineReducers`.

`combineReducers` takes an object full of slice reducer functions, and creates a function that outputs a corresponding state object with the same keys. This means that if no preloaded state is provided to `createStore`, the naming of the keys in the input slice reducer object will define the naming of the keys in the output state object. The correlation between these names is not always apparent, especially when using ES6 features such as default module exports and object literal shorthands.

Here's an example of how use of ES6 object literal shorthand with `combineReducers` can define the state shape:

```js
// reducers.js
export default theDefaultReducer = (state = 0, action) => state

export const firstNamedReducer = (state = 1, action) => state

export const secondNamedReducer = (state = 2, action) => state

// rootReducer.js
import { combineReducers, createStore } from 'redux'

import theDefaultReducer, {
  firstNamedReducer,
  secondNamedReducer
} from './reducers'

// Use ES6 object literal shorthand syntax to define the object shape
const rootReducer = combineReducers({
  theDefaultReducer,
  firstNamedReducer,
  secondNamedReducer
})

const store = createStore(rootReducer)
console.log(store.getState())
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}
```

Notice that because we used the ES6 shorthand for defining an object literal, the key names in the resulting state are the same as the variable names from the imports. This may not always be the desired behavior, and is often a cause of confusion for those who aren't as familiar with ES6 syntax.

Also, the resulting names are a bit odd. It's generally not a good practice to actually include words like "reducer" in your state key names - the keys should simply reflect the domain or type of data they hold. This means we should either explicitly specify the names of the keys in the slice reducer object to define the keys in the output state object, or carefully rename the variables for the imported slice reducers to set up the keys when using the shorthand object literal syntax.

A better usage might look like:

```js
import { combineReducers, createStore } from 'redux'

// Rename the default import to whatever name we want. We can also rename a named import.
import defaultState, {
  firstNamedReducer,
  secondNamedReducer as secondState
} from './reducers'

const rootReducer = combineReducers({
  defaultState, // key name same as the carefully renamed default export
  firstState: firstNamedReducer, // specific key name instead of the variable name
  secondState // key name same as the carefully renamed named export
})

const reducerInitializedStore = createStore(rootReducer)
console.log(reducerInitializedStore.getState())
// {defaultState : 0, firstState : 1, secondState : 2}
```

This state shape better reflects the data involved, because we took care to set up the keys we passed to `combineReducers`.
