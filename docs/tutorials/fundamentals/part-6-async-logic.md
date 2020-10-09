---
id: part-6-async-logic
title: 'Redux Fundamentals, Part 6: Async Logic and Data Fetching'
sidebar_label: 'Async Logic and Data Fetching'
hide_title: true
description: 'The official Redux Fundamentals tutorial: learn how to use async logic with Redux'
---

# Redux Fundamentals, Part 6: Async Logic and Data Fetching

:::tip What You'll Learn

- How the Redux data flow works with async data
- How to use Redux middleware for async logic
- Patterns for handling async request state

:::

:::info Prerequisites

- Familiarity with using AJAX requests to fetch and update data from a server

:::

## Introduction

In [Part 5: UI and React](./part-5-ui-and-react.md), we saw how to use the React-Redux library to let our React components interact with a Redux store, including calling `useSelector` to read Redux state, calling `useDispatch` to give us access to the `dispatch` function, and wrapping our app in a `<Provider>` component to give those hooks access to the store.

So far, all the data we've worked with has been directly inside of our React+Redux client application. However, most real applications need to work with data from a server, by making HTTP API calls to fetch and save items.

In this section, we'll update our todo app to fetch the todos from an API, and add new todos by saving them to the API.

### Example REST API and Client

To keep the example project isolated but realistic, the initial project setup already included a fake in-memory REST API for our data (configured using [the Mirage.js mock API tool](https://miragejs.com/)). The API uses `/fakeApi` as the base URL for the endpoints, and supports the typical `GET/POST/PUT/DELETE` HTTP methods for `/fakeApi/todos`. It's defined in `src/api/server.js`.

The project also includes a small HTTP API client object that exposes `client.get()` and `client.post()` methods, similar to popular HTTP libraries like `axios`. It's defined in `src/api/client.js`.

We'll use the `client` object to make HTTP calls to our in-memory fake REST API for this section.

## Redux Middleware and Side Effects

By itself, a Redux store doesn't know anything about async logic. It only knows how to synchronously dispatch actions, update the state by calling the root reducer function, and notify the UI that something has changed. Any asynchronicity has to happen outside the store.

Earlier, we said that Redux reducers must never contain "side effects". **A "side effect" is any change to state or behavior that can be seen outside of returning a value from a function**. Some common kinds of side effects are things like:

- Logging a value to the console
- Saving a file
- Setting an async timer
- Making an AJAX HTTP request
- Modifying some state that exists outside of a function, or mutating arguments to a function
- Generating random numbers or unique random IDs (such as `Math.random()` or `Date.now()`)

However, any real app will need to do these kinds of things _somewhere_. So, if we can't put side effects in reducers, where _can_ we put them?

**Redux middleware were designed to enable writing logic that has side effects**.

As we said [in Part 4](./part-4-store.md#middleware-use-cases), a Redux middleware can do _anything_ when it sees a dispatched action: log something, modify the action, delay the action, make an async call, and more. Also, since middleware form a pipeline around the real `store.dispatch` function, this also means that we could actually pass something that _isn't_ a plain action object to `dispatch`, as long as a middleware intercepts that value and doesn't let it reach the reducers.

Middleware also have access to `dispatch` and `getState`. That means you could write some async logic in a middleware, and still have the ability to interact with the Redux store by dispatching actions.

### Using Middleware to Enable Async Logic

Let's look at a couple examples of how middleware can enable us to write some kind of async logic that interacts with the Redux store.

One possibility is writing a middleware that looks for specific action types, and runs async logic when it sees those actions, like these examples:

```js
import { client } from '../api/client'

const delayedActionMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoAdded') {
    setTimeout(() => {
      // Delay this action by one second
      next(action)
    }, 1000)
  }

  return next(action)
}

const fetchTodosMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/fetchTodos') {
    // Make an API call to fetch todos from the server
    client.get('todos').then(todos => {
      // Dispatch an action with the todos we received
      dispatch({ type: 'todos/todosLoaded', payload: todos })
    })
  }

  return next(action)
}
```

:::info

For more details on why and how Redux uses middleware for async logic, see these StackOverflow answers by Redux creator Dan Abramov:

- ["How to dispatch a Redux action with a timeout?"](https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559)
- ["Why do we need middleware for async flow?"](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594)

:::

### Writing an Async Function Middleware

Both of the middleware in that last section were very specific and only do one thing. It would be nice if we had a way to write _any_ async logic ahead of time, separate from the middleware itself, and still have access to `dispatch` and `getState` so that we can interact with the store.

What if we wrote a middleware that let us pass a _function_ to `dispatch`, instead of an action object? We could have our middleware check to see if the "action" is actually a function instead, and if it's a function, call the function right away. That would let us write async logic in separate functions.

Here's what that middleware might look like:

```js title="asyncFunctionMiddleware.js"
const asyncFunctionMiddleware = storeAPI => next => action => {
  // If the "action" is actually a function instead...
  if (typeof action === 'function') {
    // then call the function and pass `dispatch` and `getState` as arguments
    return action(storeAPI.dispatch, storeAPI.getState)
  }

  // Otherwise, it's a normal action - send it onwards
  return next(action)
}
```

And then we could use that middleware like this:

```js
const middlewareEnhancer = applyMiddleware(asyncFunctionMiddleware)
const store = createStore(rootReducer, middlewareEnhancer)

// Write a function that has `dispatch` and `getState` as arguments
const fetchSomeData = (dispatch, getState) => {
  // Make an async HTTP request
  client.get('todos').then(todos => {
    // Dispatch an action with the todos we received
    dispatch({ type: 'todos/todosLoaded', payload: todos })
    // Check the updated store state after dispatching
    const allTodos = getState().todos
    console.log('Number of todos after loading: ', allTodos.length)
  })
}

// Pass the _function_ we wrote to `dispatch`
store.dispatch(fetchSomeData)
// logs: 'Number of todos after loading: ###'
```

Notice that **this "async function middleware" let us pass a _function_ to `dispatch`!** Inside that function, we were able to write some async logic (an HTTP request), then dispatch a normal action object when the request completed.

## Redux Async Data Flow

So how do middleware and async logic affect the overall data flow of a Redux app?

Just like with a normal action, we first need to handle a user event in the application, such as a click on a button. Then, we call `dispatch()`, and pass in _something_, whether it be a plain action object, a function, or some other value that a middleware can look for.

Once that dispatched value reaches a middleware, it can make an async call, and then dispatch a real action object when the async call completes.

Earlier, we saw [a diagram that represents the normal synchronous Redux data flow](./part-2-concepts-data-flow.md#redux-application-data-flow). When we add async logic to a Redux app, the data flow sequence now looks like this:

**FIXME Add async Redux data flow diagram here**

## Using the Redux Thunk Middleware

As it turns out, Redux already has an official version of that "async function middleware", called the [**Redux "Thunk" middleware**](https://github.com/reduxjs/redux-thunk). The thunk middleware allows us to write functions that get `dispatch` and `getState` as arguments, and have any async logic we want inside those functions that can dispatch actions and read the store state.

**Writing async logic as thunk functions allows us to reuse that logic without knowing what Redux store we're using**.

:::info

The word "thunk" is a programming term that means ["a piece of code that does some delayed work"](https://en.wikipedia.org/wiki/Thunk). For more details, see these posts:

- [What the heck is a thunk?](https://daveceddia.com/what-is-a-thunk/)
- [Thunks in Redux: the basics](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)

:::

### Configuring the Store

The Redux thunk middleware is available on NPM as a package called `redux-thunk`. We need to install that package to use it in our app:

```bash
npm install redux-thunk
```

Once it's installed, we can update the Redux store in our todo app to use that middleware:

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

const store = createStore(rootReducer, composedEnhancer)
export default store
```

### Fetching Todos from a Server

Right now our todo entries can only exist in the client's browser. We need a way to load a list of todos from the server when the app starts up.
