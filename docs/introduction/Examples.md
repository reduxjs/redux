# Examples

Redux is distributed with a few examples in its [source code](https://github.com/reactjs/redux/tree/master/examples). Most of these examples are also on [CodeSandbox](https://codesandbox.io), an online editor that lets you play with the examples online.

## Counter Vanilla

Run the [Counter Vanilla](https://github.com/reactjs/redux/tree/master/examples/counter-vanilla) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/counter-vanilla
open index.html
```

It does not require a build system or a view framework and exists to show the raw Redux API used with ES5.

## Counter

Run the [Counter](https://github.com/reactjs/redux/tree/master/examples/counter) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/counter
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/counter):

{% embed data="{\"url\":\"https://codesandbox.io/embed/github/reactjs/redux/tree/master/examples/counter\",\"type\":\"link\",\"title\":\"CodeSandbox\",\"description\":\"CodeSandbox is an online editor       tailored for web applications.\",\"icon\":{\"type\":\"icon\",\"url\":\"https://codesandbox.io/favicon.ico\",\"aspectRatio\":0},\"thumbnail\":{\"type\":\"thumbnail\",\"url\":\"https://codesandbox.io/static/img/banner.png\",\"width\":1200,\"height\":630,\"aspectRatio\":0.525}}" %}

This is the most basic example of using Redux together with React. For simplicity, it re-renders the React component manually when the store changes. In real projects, you will likely want to use the highly performant [React Redux](https://github.com/reactjs/react-redux) bindings instead.

This example includes tests.

## Todos

Run the [Todos](https://github.com/reactjs/redux/tree/master/examples/todos) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/todos
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/todos).

This is the best example to get a deeper understanding of how the state updates work together with components in Redux. It shows how reducers can delegate handling actions to other reducers, and how you can use [React Redux](https://github.com/reactjs/react-redux) to generate container components from your presentational components.

This example includes tests.

## Todos with Undo

Run the [Todos with Undo](https://github.com/reactjs/redux/tree/master/examples/todos-with-undo) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/todos-with-undo
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/todos-with-undo).

This is a variation on the previous example. It is almost identical, but additionally shows how wrapping your reducer with [Redux Undo](https://github.com/omnidan/redux-undo) lets you add a Undo/Redo functionality to your app with a few lines of code.

## TodoMVC

Run the [TodoMVC](https://github.com/reactjs/redux/tree/master/examples/todomvc) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/todomvc
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/todomvc).

This is the classical [TodoMVC](http://todomvc.com/) example. It's here for the sake of comparison, but it covers the same points as the Todos example.

This example includes tests.

## Shopping Cart

Run the [Shopping Cart](https://github.com/reactjs/redux/tree/master/examples/shopping-cart) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/shopping-cart
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/shopping-cart).

This example shows important idiomatic Redux patterns that become important as your app grows. In particular, it shows how to store entities in a normalized way by their IDs, how to compose reducers on several levels, and how to define selectors alongside the reducers so the knowledge about the state shape is encapsulated. It also demonstrates logging with [Redux Logger](https://github.com/fcomb/redux-logger) and conditional dispatching of actions with [Redux Thunk](https://github.com/gaearon/redux-thunk) middleware.

## Tree View

Run the [Tree View](https://github.com/reactjs/redux/tree/master/examples/tree-view) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/tree-view
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/tree-view).

This example demonstrates rendering a deeply nested tree view and representing its state in a normalized form so it is easy to update from reducers. Good rendering performance is achieved by the container components granularly subscribing only to the tree nodes that they render.

This example includes tests.

## Async

Run the [Async](https://github.com/reactjs/redux/tree/master/examples/async) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/async
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/async).

This example includes reading from an asynchronous API, fetching data in response to user input, showing loading indicators, caching the response, and invalidating the cache. It uses [Redux Thunk](https://github.com/gaearon/redux-thunk) middleware to encapsulate asynchronous side effects.

## Universal

Run the [Universal](https://github.com/reactjs/redux/tree/master/examples/universal) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/universal
npm install
npm start
```

This is a basic demonstration of [server rendering](../recipes/ServerRendering.md) with Redux and React. It shows how to prepare the initial store state on the server, and pass it down to the client so the client store can boot up from an existing state.

## Real World

Run the [Real World](https://github.com/reactjs/redux/tree/master/examples/real-world) example:

```
git clone https://github.com/reactjs/redux.git

cd redux/examples/real-world
npm install
npm start
```

Or check out the [sandbox](https://codesandbox.io/s/github/reactjs/redux/tree/master/examples/real-world).

This is the most advanced example. It is dense by design. It covers keeping fetched entities in a normalized cache, implementing a custom middleware for API calls, rendering partially loaded data, pagination, caching responses, displaying error messages, and routing. Additionally, it includes Redux DevTools.

## More Examples

You can find more examples in [Awesome Redux](https://github.com/xgrommx/awesome-redux).
