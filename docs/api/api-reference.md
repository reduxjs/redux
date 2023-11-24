---
id: api-reference
title: API Reference
---

# API Reference

The Redux API surface is tiny. Redux defines a set of contracts for you to implement (such as [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)) and provides a few helper functions to tie these contracts together.

This section documents the complete Redux API. Keep in mind that Redux is only concerned with managing the state. In a real app, you'll also want to use UI bindings like [react-redux](https://github.com/gaearon/react-redux).

:::danger

**The original Redux core `createStore` method is deprecated!**

`createStore` will continue to work indefinitely, but we discourage direct use of `createStore` or the original `redux` package.

Instead, you should use [the `configureStore` method](https://redux-toolkit.js.org/api/configureStore) from our official [Redux Toolkit](https://redux-toolkit.js.org) package, which wraps `createStore` to provide a better default setup and configuration approach. You should also use Redux Toolkit's [`createSlice` method](https://redux-toolkit.js.org/api/createSlice) for writing reducer logic.

Redux Toolkit also re-exports all of the other APIs included in the `redux` package as well.

See the [**Migrating to Modern Redux** page](../usage/migrating-to-modern-redux.mdx) for details on how to update your existing legacy Redux codebase to use Redux Toolkit.

:::

## Top-Level Exports

- [createStore(reducer, [preloadedState], [enhancer])](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getState)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)
