---
id: api-reference
title: API Reference
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

# API Reference

This section documents the original Redux core API. The Redux core is small - it defines a set of contracts for you to implement (such as [reducers](../understanding/thinking-in-redux/Glossary.md#reducer)) and provides a few helper functions to tie these contracts together.

**In practice, you won't use the Redux core directly**. [**Redux Toolkit**](https://redux-toolkit.js.org) is our official recommended approach for writing Redux logic. It wraps around the Redux core, and contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications. Additionally, [**React-Redux**](https://react-redux.js.org) lets your React components talk to the Redux store.

See their API docs here:

- https://redux-toolkit.js.org/
- https://react-redux.js.org/

<CoreApiNote />

Redux Toolkit also re-exports all of the APIs included in the `redux` package. The original [`createStore`](createStore.md) method is deprecated in favor of `configureStore`, but will continue to work indefinitely.

## Top-Level Exports

- [createStore(reducer, preloadedState?, enhancer?)](createStore.md)
- [combineReducers(reducers)](combineReducers.md)
- [applyMiddleware(...middlewares)](applyMiddleware.md)
- [bindActionCreators(actionCreators, dispatch)](bindActionCreators.md)
- [compose(...functions)](compose.md)

## Store API

- [Store](Store.md)
  - [getState()](Store.md#getstate)
  - [dispatch(action)](Store.md#dispatchaction)
  - [subscribe(listener)](Store.md#subscribelistener)
  - [replaceReducer(nextReducer)](Store.md#replacereducernextreducer)
