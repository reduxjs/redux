---
id: api-reference
title: API Reference
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

# API Reference

This section documents the original Redux core API. The Redux core is small - it defines a set of contracts for you to implement (such as [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)) and provides a few helper functions to tie these contracts together.

<CoreApiNote />

Redux Toolkit re-exports all of the APIs included in the `redux` package, so you don't need to install `redux` separately. The original [`createStore`](createStore.md) method is deprecated in favor of `configureStore`, but will continue to work indefinitely.

For the APIs you'll use day to day, see the [Redux Toolkit API docs](/toolkit) and the [React-Redux API docs](/react-redux).

## Top-Level Exports

- [createStore(reducer, preloadedState?, enhancer?)](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)
- [Utility functions](utils.md): `isAction`, `isPlainObject`

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getstate)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)
