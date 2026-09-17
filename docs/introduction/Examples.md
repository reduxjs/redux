---
id: examples
title: Examples
description: 'Introduction > Examples: Redux interactive example apps'
---

# Examples

Redux is distributed with a few examples in its [source code](https://github.com/reduxjs/redux/tree/master/examples). Most of these examples are also on [CodeSandbox](https://codesandbox.io), an online editor that lets you play with the examples online.

The examples fall into two groups. The [Redux Toolkit examples](#redux-toolkit-examples) show how we recommend writing Redux apps today. The [legacy examples](#legacy-examples) were written for older versions of Redux and React Redux. They still run, and they are still useful for seeing how the core Redux API fits together, but they use patterns we no longer recommend for new code.

## Redux Toolkit Examples

### Counter

Run the [Counter](https://github.com/reduxjs/redux/tree/master/examples/counter) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This is the most basic example of using Redux Toolkit together with React. It defines a counter slice with `createSlice`, sets up the store with `configureStore`, reads state with `useSelector`, dispatches with `useDispatch`, and includes an async thunk that simulates fetching a value from a server.

This example includes tests.

### Counter (TypeScript)

Run the [Counter TS](https://github.com/reduxjs/redux/tree/master/examples/counter-ts) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter-ts
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter-ts):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-ts/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This is the same Counter example written in TypeScript. It shows how to infer the `RootState` and `AppDispatch` types from the store and how to define pre-typed `useAppSelector` and `useAppDispatch` hooks, as described in [Usage with TypeScript](../usage/UsageWithTypescript.md).

This example includes tests.

### Project Templates

The [`reduxjs/redux-templates`](https://github.com/reduxjs/redux-templates) repo contains Vite project templates for React + Redux Toolkit, in both JavaScript and TypeScript. These are the recommended starting point for a new Redux app.

### Redux Essentials Example App

The [Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md) builds a small social media app with Redux Toolkit and RTK Query. The finished project is in the [`reduxjs/redux-essentials-example-app`](https://github.com/reduxjs/redux-essentials-example-app) repo, with a branch for each tutorial section.

## Legacy Examples

:::caution

These examples were written for React 17, Redux 4, and React Redux 7. They use `createStore`, hand-written action types and action creators, switch-statement reducers, and `connect()` container components. Those patterns still work, but for new apps we recommend the Redux Toolkit examples above and the [Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md).

:::

### Counter Vanilla

Run the [Counter Vanilla](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter-vanilla
```

Then open `index.html` in your browser.

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter-vanilla):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-vanilla/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

It does not require a build system or a view framework and exists to show the raw Redux API used with ES5.

### Todos

Run the [Todos](https://github.com/reduxjs/redux/tree/master/examples/todos) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todos
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todos/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This example shows how reducers can delegate handling actions to other reducers, and how [React Redux](https://github.com/reduxjs/react-redux)'s `connect()` generates container components from presentational components.

This example includes tests.

### Todos with Undo

Run the [Todos with Undo](https://github.com/reduxjs/redux/tree/master/examples/todos-with-undo) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todos-with-undo
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos-with-undo):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todos-with-undo/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This is a variation on the previous example. It is almost identical, but additionally shows how wrapping your reducer with [Redux Undo](https://github.com/omnidan/redux-undo) lets you add a Undo/Redo functionality to your app with a few lines of code.

### TodoMVC

Run the [TodoMVC](https://github.com/reduxjs/redux/tree/master/examples/todomvc) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todomvc
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todomvc):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todomvc/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This is the classical [TodoMVC](http://todomvc.com/) example. It's here for the sake of comparison, but it covers the same points as the Todos example.

This example includes tests.

### Shopping Cart

Run the [Shopping Cart](https://github.com/reduxjs/redux/tree/master/examples/shopping-cart) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/shopping-cart
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/shopping-cart):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/shopping-cart/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This example shows important idiomatic Redux patterns that become important as your app grows. In particular, it shows how to store entities in a normalized way by their IDs, how to compose reducers on several levels, and how to define selectors alongside the reducers so the knowledge about the state shape is encapsulated. It also demonstrates logging with [Redux Logger](https://github.com/LogRocket/redux-logger) and conditional dispatching of actions with [Redux Thunk](https://github.com/reduxjs/redux-thunk) middleware.

### Tree View

Run the [Tree View](https://github.com/reduxjs/redux/tree/master/examples/tree-view) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/tree-view
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/tree-view):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/tree-view/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This example demonstrates rendering a deeply nested tree view and representing its state in a normalized form so it is easy to update from reducers. Good rendering performance is achieved by the container components granularly subscribing only to the tree nodes that they render.

This example includes tests.

### Async

Run the [Async](https://github.com/reduxjs/redux/tree/master/examples/async) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/async
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/async):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/async/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This example includes reading from an asynchronous API, fetching data in response to user input, showing loading indicators, caching the response, and invalidating the cache. It uses [Redux Thunk](https://github.com/reduxjs/redux-thunk) middleware to encapsulate asynchronous side effects. Today, [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) handles this kind of data fetching and caching for you.

### Universal

Run the [Universal](https://github.com/reduxjs/redux/tree/master/examples/universal) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/universal
npm install
npm start
```

This is a basic demonstration of [server rendering](../usage/ServerRendering.md) with Redux and React. It shows how to prepare the initial store state on the server, and pass it down to the client so the client store can boot up from an existing state.

### Real World

Run the [Real World](https://github.com/reduxjs/redux/tree/master/examples/real-world) example:

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/real-world
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/real-world):

<iframe class="codesandbox" src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/real-world/?codemirror=1&runonclick=1" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

This is the most advanced example. It is dense by design. It covers keeping fetched entities in a normalized cache, implementing a custom middleware for API calls, rendering partially loaded data, pagination, caching responses, displaying error messages, and routing. Additionally, it includes Redux DevTools.
