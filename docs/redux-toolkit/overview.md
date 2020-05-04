---
id: overview
title: 'Redux Toolkit: Overview'
description: 'Redux Toolkit is the recommended way to write Redux logic'
hide_title: true
---

## What is Redux Toolkit?

**[Redux Toolkit](https://redux-toolkit.js.org)** is our official, opinionated, batteries-included toolset for efficient Redux development. It is intended to be the standard way to write Redux logic, and we strongly recommend that you use it.

It includes several utility functions that simplify the most common Redux use cases, including store setup, defining reducers, immutable update logic, and even creating entire "slices" of state at once without writing any action creators or action types by hand. It also includes the most widely used Redux addons, like Redux Thunk for async logic and Reselect for writing selector functions, so that you can use them right away.

### Installation

Redux Toolkit is available as a package on NPM for use with a module bundler or in a Node application:

```bash
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

## Purpose

The Redux core library is deliberately unopinionated. It lets you decide how you want to handle everything, like store setup, what your state contains, and how you want to build your reducers.

This is good in some cases, because it gives you flexibility, but that flexibility isn't always needed. Sometimes we just want the simplest possible way to get started, with some good default behavior out of the box. Or, maybe you're writing a larger application and finding yourself writing some similar code, and you'd like to cut down on how much of that code you have to write by hand.

**Redux Toolkit** was originally created to help address three common concerns about Redux:

- "Configuring a Redux store is too complicated"
- "I have to add a lot of packages to get Redux to do anything useful"
- "Redux requires too much boilerplate code"

We can't solve every use case, but in the spirit of [`create-react-app`](https://github.com/facebook/create-react-app) and [`apollo-boost`](https://dev-blog.apollodata.com/zero-config-graphql-state-management-27b1f1b3c2c3), we can provide an official recommended set of tools that handle the most common use cases and reduce the need to make extra decisions.

## Why You Should Use Redux Toolkit

**Redux Toolkit** makes it easier to write good Redux applications and speeds up development, by baking in our recommended best practices, providing good default behaviors, catching mistakes, and allowing you to write simpler code. Redux Toolkit is **beneficial to all Redux users** regardless of skill level or experience. It can be added at the start of a new project, or used as part of an incremental migration in an existing project.

Note that **you are not _required_ to use Redux Toolkit to use Redux**. There are many existing applications that use other Redux wrapper libraries, or write all Redux logic "by hand". **If you prefer to use a different approach, go ahead!**

Overall, whether you're a brand new Redux user setting up your first project, or an experienced user who wants to simplify an existing application, **using Redux Toolkit will make your code better and more maintainable**.

## What's Included

Redux Toolkit includes:

- A [`configureStore()` function](https://redux-toolkit.js.org/api/configureStore) with simplified configuration options. It can automatically combine your slice reducers, adds whatever Redux middleware you supply, includes `redux-thunk` by default, and enables use of the Redux DevTools Extension.
- A [`createReducer()` utility](https://redux-toolkit.js.org/api/createReducer) that lets you supply a lookup table of action types to case reducer functions, rather than writing switch statements. In addition, it automatically uses the [`immer` library](https://github.com/mweststrate/immer) to let you write simpler immutable updates with normal mutative code, like `state.todos[3].completed = true`.
- A [`createAction()` utility](https://redux-toolkit.js.org/api/createAction) that returns an action creator function for the given action type string. The function itself has `toString()` defined, so that it can be used in place of the type constant.
- A [`createSlice()` function](https://redux-toolkit.js.org/api/createSlice) that accepts a set of reducer functions, a slice name, and an initial state value, and automatically generates a slice reducer with corresponding action creators and action types.
- The [`createSelector` utility](https://redux-toolkit.js.org/api/createSelector) from the [Reselect](https://github.com/reduxjs/reselect) library, re-exported for ease of use.

## Documentation

The complete Redux Toolkit documentation is available at **[https://redux-toolkit.js.org](https://redux-toolkit.js.org)**.

### Documentation Links

- **Introduction**
  - [Quick Start](https://redux-toolkit.js.org/introduction/quick-start)
- **Tutorials**
  - [Basic Tutorial](https://redux-toolkit.js.org/tutorials/basic-tutorial)
  - [Intermediate Tutorial](https://redux-toolkit.js.org/tutorials/intermediate-tutorial)
  - [Advanced Tutorial](https://redux-toolkit.js.org/tutorials/advanced-tutorial)
- **Using Redux Toolkit**
  - [Usage Guide](https://redux-toolkit.js.org/usage/usage-guide)
- **API Reference**
  - [`configureStore`](https://redux-toolkit.js.org/api/configureStore)
  - [`getDefaultMiddleware`](https://redux-toolkit.js.org/api/getDefaultMiddleware)
  - [`createReducer`](https://redux-toolkit.js.org/api/createReducer)
  - [`createAction`](https://redux-toolkit.js.org/api/createAction)
  - [`createSlice`](https://redux-toolkit.js.org/api/createSlice)
  - [`createSelector`](https://redux-toolkit.js.org/api/createSelector)
  - [Other Exports](https://redux-toolkit.js.org/api/other-exports)
