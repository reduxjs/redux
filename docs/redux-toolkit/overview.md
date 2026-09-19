---
id: overview
title: 'Redux Toolkit: Overview'
description: 'Redux Toolkit is the recommended way to write Redux logic'
hide_title: true
---

## What is Redux Toolkit?

**[Redux Toolkit](/toolkit)** is our official, opinionated, batteries-included toolset for efficient Redux development. It is intended to be the standard way to write Redux logic, and [we strongly recommend that you use it](../style-guide/style-guide.md#use-redux-toolkit-for-writing-redux-logic).

The Redux core library is deliberately unopinionated: it lets you decide how to set up the store, what your state contains, and how to build your reducers. Redux Toolkit was created to address the three most common complaints that flexibility produced ("configuring a store is too complicated", "I have to add a lot of packages to get Redux to do anything useful", and "Redux requires too much boilerplate code") by providing an official set of tools that handle the common cases with good defaults. It bakes in our recommended best practices, catches common mistakes, and lets you write much less code, while still following the same Redux data flow. It can be added at the start of a new project or used as part of an incremental migration in an existing one.

You are not _required_ to use Redux Toolkit to use Redux, but see [Why Redux Toolkit is How to Use Redux Today](../introduction/why-rtk-is-redux-today.md) for why we recommend it for all Redux apps.

### Installation

```bash
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

## What's Included

- [`configureStore()`](/toolkit/api/configureStore): sets up a store with good defaults. It automatically combines your slice reducers, includes the thunk middleware plus development-mode checks for accidental mutations and non-serializable values, and enables the Redux DevTools Extension.
- [`createSlice()`](/toolkit/api/createSlice): accepts a slice name, an initial state, and an object of reducer functions, and generates the slice reducer plus matching action creators and action types. Reducers can be written with "mutating" syntax thanks to the [Immer library](https://immerjs.github.io/immer/).
- [`createAsyncThunk()`](/toolkit/api/createAsyncThunk): accepts an action type string and a function that returns a promise, and generates a thunk that dispatches `pending/fulfilled/rejected` actions based on that promise.
- [`createEntityAdapter()`](/toolkit/api/createEntityAdapter): generates reusable reducers and selectors for managing normalized data in the store.
- [`createListenerMiddleware()`](/toolkit/api/createListenerMiddleware): runs additional logic in response to dispatched actions or state changes, as a lighter-weight alternative to sagas or observables.
- [`combineSlices()`](/toolkit/api/combineSlices): combines slice reducers and supports lazily injecting slices for code splitting.
- [`createSelector`](/toolkit/api/createSelector) from [Reselect](https://reselect.js.org), re-exported for writing memoized selectors, along with lower-level utilities like [`createReducer()`](/toolkit/api/createReducer) and [`createAction()`](/toolkit/api/createAction).
- [**RTK Query**](/toolkit/rtk-query/overview): a data fetching and caching layer built for Redux. You define API endpoints and it generates the reducers, thunks, and React hooks for fetching, caching, and invalidating that data, so you don't hand-write loading state or data fetching logic.

## Documentation

The complete Redux Toolkit documentation is available in the **[Redux Toolkit section](/toolkit)** of this site. Start with the [Redux Toolkit Quick Start](/toolkit/tutorials/quick-start) or the [Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md) here.
