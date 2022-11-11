---
id: part-6-async-logic
title: 'Redux Fundamentals, Part 6: Async Logic and Data Fetching'
sidebar_label: 'Async Logic and Data Fetching'
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
- Understanding asynchronous logic in JS, including Promises

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
    return
  }

  return next(action)
}

const fetchTodosMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/fetchTodos') {
    // Make an API call to fetch todos from the server
    client.get('todos').then(todos => {
      // Dispatch an action with the todos we received
      storeAPI.dispatch({ type: 'todos/todosLoaded', payload: todos })
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

**What if we wrote a middleware that let us pass a _function_ to `dispatch`, instead of an action object**? We could have our middleware check to see if the "action" is actually a function instead, and if it's a function, call the function right away. That would let us write async logic in separate functions, outside of the middleware definition.

Here's what that middleware might look like:

```js title="Example async function middleware"
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

Again, notice that **this "async function middleware" let us pass a _function_ to `dispatch`!** Inside that function, we were able to write some async logic (an HTTP request), then dispatch a normal action object when the request completed.

## Redux Async Data Flow

So how do middleware and async logic affect the overall data flow of a Redux app?

Just like with a normal action, we first need to handle a user event in the application, such as a click on a button. Then, we call `dispatch()`, and pass in _something_, whether it be a plain action object, a function, or some other value that a middleware can look for.

Once that dispatched value reaches a middleware, it can make an async call, and then dispatch a real action object when the async call completes.

Earlier, we saw [a diagram that represents the normal synchronous Redux data flow](./part-2-concepts-data-flow.md#redux-application-data-flow). When we add async logic to a Redux app, we add an extra step where middleware can run logic like AJAX requests, then dispatch actions. That makes the async data flow look like this:

![Redux async data flow diagram](/img/tutorials/essentials/ReduxAsyncDataFlowDiagram.gif)

## Using the Redux Thunk Middleware

As it turns out, Redux already has an official version of that "async function middleware", called the [**Redux "Thunk" middleware**](https://github.com/reduxjs/redux-thunk). The thunk middleware allows us to write functions that get `dispatch` and `getState` as arguments. The thunk functions can have any async logic we want inside, and that logic can dispatch actions and read the store state as needed.

**Writing async logic as thunk functions allows us to reuse that logic without knowing what Redux store we're using ahead of time**.

:::info

The word "thunk" is a programming term that means ["a piece of code that does some delayed work"](https://en.wikipedia.org/wiki/Thunk). For more details on how to use thunks, see the thunk usage guide page:

- [Using Redux: Writing Logic with Thunks](../../usage/writing-logic-thunks.mdx)

as well as these posts:

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
// highlight-next-line
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

// highlight-next-line
const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

// The store now has the ability to accept thunk functions in `dispatch`
const store = createStore(rootReducer, composedEnhancer)
export default store
```

### Fetching Todos from a Server

Right now our todo entries can only exist in the client's browser. We need a way to load a list of todos from the server when the app starts up.

We'll start by writing a thunk function that makes an AJAX call to our `/fakeApi/todos` endpoint to request an array of todo objects, and then dispatch an action containing that array as the payload. Since this is related to the todos feature in general, we'll write the thunk function in the `todosSlice.js` file:

```js title="src/features/todos/todosSlice.js"
import { client } from '../../api/client'

const initialState = []

export default function todosReducer(state = initialState, action) {
  // omit reducer logic
}

// Thunk function
// highlight-start
export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  dispatch({ type: 'todos/todosLoaded', payload: response.todos })
}
// highlight-end
```

We only want to make this API call once, when the application loads for the first time. There's a few places we _could_ put this:

- In the `<App>` component, in a `useEffect` hook
- In the `<TodoList>` component, in a `useEffect` hook
- In the `index.js` file directly, right after we import the store

For now, let's try putting this directly in `index.js`:

```js title="src/index.js"
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'

import './api/server'

// highlight-start
import store from './store'
import { fetchTodos } from './features/todos/todosSlice'

store.dispatch(fetchTodos)
// highlight-end

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
```

If we reload the page, there's no visible change in the UI. However, if we open up the Redux DevTools extension, we should now see that a `'todos/todosLoaded'` action was dispatched, and it should contain some todo objects that were generated by our fake server API:

![Devtools - todosLoaded action contents](/img/tutorials/fundamentals/devtools-todosLoaded-action.png)

Notice that even though we've dispatched an action, nothing's happening to change the state. **We need to handle this action in our todos reducer to have the state updated.**

Let's add a case to the reducer to load this data into the store. Since we're fetching the data from the server, we want to completely replace any existing todos, so we can return the `action.payload` array to make it be the new todos `state` value:

```js title="src/features/todos/todosSlice.js"
import { client } from '../../api/client'

const initialState = []

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // omit other reducer cases
    // highlight-start
    case 'todos/todosLoaded': {
      // Replace the existing state entirely by returning the new value
      return action.payload
    }
    // highlight-end
    default:
      return state
  }
}

export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  dispatch({ type: 'todos/todosLoaded', payload: response.todos })
}
```

Since dispatching an action immediately updates the store, we can also call `getState` in the thunk to read the updated state value after we dispatch. For example, we could log the number of total todos to the console before and after dispatching the `'todos/todosLoaded'` action:

```js
export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')

  // highlight-next-line
  const stateBefore = getState()
  console.log('Todos before dispatch: ', stateBefore.todos.length)

  dispatch({ type: 'todos/todosLoaded', payload: response.todos })

  // highlight-next-line
  const stateAfter = getState()
  console.log('Todos after dispatch: ', stateAfter.todos.length)
}
```

### Saving Todo Items

We also need to update the server whenever we try to create a new todo item. Instead of dispatching the `'todos/todoAdded'` action right away, we should make an API call to the server with the initial data, wait for the server to send back a copy of the newly saved todo item, and _then_ dispatch an action with that todo item.

However, if we start trying to write this logic as a thunk function, we're going to run into a problem: since we're writing the thunk as a separate function in the `todosSlice.js` file, the code that makes the API call doesn't know what the new todo text is supposed to be:

```js title="src/features/todos/todosSlice.js"
async function saveNewTodo(dispatch, getState) {
  // ❌ We need to have the text of the new todo, but where is it coming from?
  // highlight-next-line
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  dispatch({ type: 'todos/todoAdded', payload: response.todo })
}
```

We need a way to write one function that accepts `text` as its parameter, but then creates the actual thunk function so that it can use the `text` value to make the API call. Our outer function should then return the thunk function so that we can pass to `dispatch` in our component.

```js title="src/features/todos/todosSlice.js"
// Write a synchronous outer function that receives the `text` parameter:
export function saveNewTodo(text) {
  // And then creates and returns the async thunk function:
  return async function saveNewTodoThunk(dispatch, getState) {
    // ✅ Now we can use the text value and send it to the server
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    dispatch({ type: 'todos/todoAdded', payload: response.todo })
  }
}
```

Now we can use this in our `<Header>` component:

```js title="src/features/header/Header.js"
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

// highlight-next-line
import { saveNewTodo } from '../todos/todosSlice'

const Header = () => {
  const [text, setText] = useState('')
  const dispatch = useDispatch()

  const handleChange = e => setText(e.target.value)

  const handleKeyDown = e => {
    // If the user pressed the Enter key:
    const trimmedText = text.trim()
    if (e.which === 13 && trimmedText) {
      // highlight-start
      // Create the thunk function with the text the user wrote
      const saveNewTodoThunk = saveNewTodo(trimmedText)
      // Then dispatch the thunk function itself
      dispatch(saveNewTodoThunk)
      // highlight-end
      setText('')
    }
  }

  // omit rendering output
}
```

Since we know we're going to immediately pass the thunk function to `dispatch` in the
component, we can skip creating the temporary variable. Instead, we can call `saveNewTodo(text)`, and pass the resulting thunk function straight to `dispatch`:

```js title="src/features/header/Header.js"
const handleKeyDown = e => {
  // If the user pressed the Enter key:
  const trimmedText = text.trim()
  if (e.which === 13 && trimmedText) {
    // highlight-start
    // Create the thunk function and immediately dispatch it
    dispatch(saveNewTodo(trimmedText))
    // highlight-end
    setText('')
  }
}
```

Now the component doesn't actually know that it's even dispatching a thunk function - the `saveNewTodo` function is encapsulating what's actually happening. The `<Header>` component only knows that it needs to dispatch _some value_ when the user presses enter.

This pattern of writing a function to prepare something that will get passed to `dispatch` is called **the "action creator" pattern**, and we'll talk about that more in [the next section](./part-7-standard-patterns.md).

We can now see the updated `'todos/todoAdded'` action being dispatched:

![Devtools - async todoAdded action contents](/img/tutorials/fundamentals/devtools-async-todoAdded-action.png)

The last thing we need to change here is updating our todos reducer. When we make a POST request to `/fakeApi/todos`, the server will return a completely new todo object (including a new ID value). That means our reducer doesn't have to calculate a new ID, or fill out the other fields - it only needs to create a new `state` array that includes the new todo item:

```js title="src/features/todos/todosSlice.js"
const initialState = []

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // highlight-start
    case 'todos/todoAdded': {
      // Return a new todos state array with the new todo item at the end
      return [...state, action.payload]
    }
    // highlight-end
    // omit other cases
    default:
      return state
  }
}
```

And now adding a new todo will work correctly:

![Devtools - async todoAdded state diff](/img/tutorials/fundamentals/devtools-async-todoAdded-diff.png)

:::tip

Thunk functions can be used for both asynchronous _and_ synchronous logic. Thunks provide a way to write any reusable logic that needs access to `dispatch` and `getState`.

:::

## What You've Learned

We've now successfully updated our todo app so that we can fetch a list of todo items and save new todo items, using "thunk" functions to make the AJAX calls to our fake server API.

In the process, we saw how Redux middleware are used to let us make async calls and interact with the store by dispatching actions with after the async calls have completed.

Here's what the current app looks like:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-6-asyncThunks/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip Summary

- **Redux middleware were designed to enable writing logic that has side effects**
  - "Side effects" are code that changes state/behavior outside a function, like AJAX calls, modifying function arguments, or generating random values
- **Middleware add an extra step to the standard Redux data flow**
  - Middleware can intercept other values passed to `dispatch`
  - Middleware have access to `dispatch` and `getState`, so they can dispatch more actions as part of async logic
- **The Redux "Thunk" middleware lets us pass functions to `dispatch`**
  - "Thunk" functions let us write async logic ahead of time, without knowing what Redux store is being used
  - A Redux thunk function receives `dispatch` and `getState` as arguments, and can dispatch actions like "this data was received from an API response"

:::

## What's Next?

We've now covered all the core pieces of how to use Redux! You've seen how to:

- Write reducers that update state based on dispatched actions,
- Create and configure a Redux store with a reducer, enhancers, and middleware
- Use middleware to write async logic that dispatches actions

In [Part 7: Standard Redux Patterns](./part-7-standard-patterns.md), we'll look at several code patterns that are typically used by real-world Redux apps to make our code more consistent and scale better as the application grows.
