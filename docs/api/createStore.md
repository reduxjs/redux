---
id: createstore
title: createStore
hide_title: true
description: 'API > createStore: creating a core Redux store'
---

&nbsp;

# `createStore(reducer, preloadedState?, enhancer?)`

Creates a Redux [store](Store.md) that holds the complete state tree of your app.
There should only be a single store in your app.

:::danger

**The original Redux core `createStore` method is deprecated!**

`createStore` will continue to work indefinitely, but we discourage direct use of `createStore` or the original `redux` package.

Instead, you should use [the `configureStore` method](https://redux-toolkit.js.org/api/configureStore) from our official [Redux Toolkit](https://redux-toolkit.js.org) package, which wraps `createStore` to provide a better default setup and configuration approach. You should also use Redux Toolkit's [`createSlice` method](https://redux-toolkit.js.org/api/createSlice) for writing reducer logic.

Redux Toolkit also re-exports all of the other APIs included in the `redux` package as well.

See the [**Migrating to Modern Redux** page](../usage/migrating-to-modern-redux.mdx) for details on how to update your existing legacy Redux codebase to use Redux Toolkit.

:::

## Arguments

1. `reducer` _(Function)_: A root [reducer function](../understanding/thinking-in-redux/Glossary.md#reducer) that returns the next [state tree](../understanding/thinking-in-redux/Glossary.md#state), given the current state tree and an [action](../understanding/thinking-in-redux/Glossary.md#action) to handle.

2. [`preloadedState`] _(any)_: The initial state. You may optionally specify it to hydrate the state from the server in universal apps, or to restore a previously serialized user session. If you produced `reducer` with [`combineReducers`](combineReducers.md), this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your `reducer` can understand.

3. [`enhancer`] _(Function)_: The store enhancer. You may optionally specify it to enhance the store with third-party capabilities such as middleware, time travel, persistence, etc. The only store enhancer that ships with Redux is [`applyMiddleware()`](./applyMiddleware.md).

#### Returns

([_`Store`_](Store.md)): An object that holds the complete state of your app. The only way to change its state is by [dispatching actions](Store.md#dispatchaction). You may also [subscribe](Store.md#subscribelistener) to the changes to its state to update the UI.

#### Example

```js
import { createStore } from 'redux'

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}

const store = createStore(todos, ['Use Redux'])

store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
})

console.log(store.getState())
// [ 'Use Redux', 'Read the docs' ]
```

## Deprecation and Alternate `legacy_createStore` Export

In [Redux 4.2.0, we marked the original `createStore` method as `@deprecated`](https://github.com/reduxjs/redux/releases/tag/v4.2.0). Strictly speaking, **this is _not_ a breaking change**, nor is it new in 5.0, but we're documenting it here for completeness.

**This deprecation is solely a _visual_ indicator that is meant to encourage users to [migrate their apps from legacy Redux patterns to use the modern Redux Toolkit APIs](https://redux.js.org/usage/migrating-to-modern-redux)**. The deprecation results in a visual strikethrough when imported and used, like ~~`createStore`~~, but with _no_ runtime errors or warnings.

**`createStore` will continue to work indefinitely, and will _not_ ever be removed**. But, today we want _all_ Redux users to be using Redux Toolkit for all of their Redux logic.

To fix this, there are three options:

- **[Follow our strong suggestion to switch over to Redux Toolkit and `configureStore`](../usage/migrating-to-modern-redux.mdx)**
- Do nothing. It's just a visual strikethrough, and it doesn't affect how your code behaves. Ignore it.
- Switch to using the `legacy_createStore` API that is now exported, which is the exact same function but with no `@deprecated` tag. The simplest option is to do an aliased import rename, like `import { legacy_createStore as createStore } from 'redux'`

## Tips

- Don't create more than one store in an application! Instead, use [`combineReducers`](combineReducers.md) to create a single root reducer out of many.

- Redux state is normally plain JS objects and arrays.

- If your state is a plain object, make sure you never mutate it! Immutable updates require making copies of each level of data, typically using the object spread operator ( `return { ...state, ...newData }` ).

- For universal apps that run on the server, create a store instance with every request so that they are isolated. Dispatch a few data fetching actions to a store instance and wait for them to complete before rendering the app on the server.

- When a store is created, Redux dispatches a dummy action to your reducer to populate the store with the initial state. You are not meant to handle the dummy action directly. Just remember that your reducer should return some kind of initial state if the state given to it as the first argument is `undefined`, and you're all set.

- To apply multiple store enhancers, you may use [`compose()`](./compose.md).
