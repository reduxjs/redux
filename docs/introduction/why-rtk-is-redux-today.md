---
id: why-rtk-is-redux-today
title: Why Redux Toolkit is How To Use Redux Today
description: 'Introduction > Why RTK is Redux Today: details on how RTK replaces the Redux core'
---

## What is Redux Toolkit?

[**Redux Toolkit**](https://redux-toolkit.js.org) (also known as **"RTK"** for short) is our official recommended approach for writing Redux logic. The `@reduxjs/toolkit` package wraps around the core `redux` package, and contains API methods and common dependencies that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

**If you are writing _any_ Redux logic today, you _should_ be using Redux Toolkit to write that code!**

RTK includes utilities that help simplify many common use cases, including [store setup](https://redux-toolkit.js.org/api/configureStore),
[creating reducers and writing immutable update logic](https://redux-toolkit.js.org/api/createreducer),
and even [creating entire "slices" of state at once](https://redux-toolkit.js.org/api/createslice).

Whether you're a brand new Redux user setting up your first project, or an experienced user who wants to
simplify an existing application, **[Redux Toolkit](https://redux-toolkit.js.org/)** can help you
make your Redux code better.

## How Redux Toolkit Is Different Than the Redux Core

### What Is "Redux"?

The first thing to ask is, "what is Redux?"

Redux is really:

- A single store containing "global" state
- Dispatching plain object actions to the store when something happens in the app
- Pure reducer functions looking at those actions and returning immutably updated state

While it's not required, [your Redux code also normally includes](../tutorials/fundamentals/part-7-standard-patterns.md):

- Action creators that generate those action objects
- Middleware to enable side effects
- Thunk functions that contain sync or async logic with side effects
- Normalized state to enable looking up items by ID
- Memoized selector functions with the Reselect library for optimizing derived data
- The Redux DevTools Extension to view your action history and state changes
- TypeScript types for actions, state, and other functions

Additionally, Redux is normally used with the React-Redux library to let your React components talk to a Redux store.

### What Does the Redux Core Do?

The Redux core is a very small and deliberately unopinionated library. It provides a few small API primitives:

- `createStore` to actually create a Redux store
- `combineReducers` to combine multiple slice reducers into a single larger reducer
- `applyMiddleware` to combine multiple middleware into a store enhancer
- `compose` to combine multiple store enhancers into a single store enhancer

Other than that, all the other Redux-related logic in your app has to be written entirely by you.

The good news is that this means Redux _can_ be used in many different ways. The bad news is that there are no helpers to make any of your code easier to write.

For example, a reducer function is _just_ a function. Prior to Redux Toolkit, you'd typically write it that reducer with a `switch` statement and manual updates. You'd also probably have hand-written action creators and action type constants along with it:

```js title="Legacy hand-written Redux usage"
const ADD_TODO = 'ADD_TODO'
const TODO_TOGGLED = 'TODO_TOGGLED'

export const addTodo = text => ({
  type: ADD_TODO,
  payload: { text, id: nanoid() }
})

export const todoToggled = id => ({
  type: ADD_TODO,
  payload: id
})

export const todosReducer = (state = [], action) => {
  switch (action.type) {
    case ADD_TODO:
      return state.concat({
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      })
    case TODO_TOGGLED:
      return state.map(todo => {
        if (todo.id !== action.payload) return

        return {
          ...todo,
          completed: !todo.completed
        }
      })
    default:
      return state
  }
}
```

None of this code specifically depends on any API from the `redux` core library. But, this is a lot of code to write. Immutable updates required a lot of hand-written object spreads and array operations, and it was very easy to make mistakes and accidentally mutate state in the process (always the #1 cause of Redux bugs!). It was also common, though not strictly required, to spread the code for one feature across multiple files like `actions/todos.js`, `constants/todos.js`, and `reducers/todos.js`.

Additionally, store setup usually required a series of steps to add commonly used middleware like thunks and enable Redux DevTools Extension support, even though these are standard tools used in almost every Redux app.

### What Does Redux Toolkit Do?

While these _were_ the patterns originally shown in the Redux docs, they unfortunately require a lot of very verbose and repetitive code. Most of this boilerplate isn't _necessary_ to use Redux. On top of that, the boilerplate-y code lead to more opportunities to make mistakes.

**We specifically created Redux Toolkit to eliminate the "boilerplate" from hand-written Redux logic, prevent common mistakes, and provide APIs that simplify standard Redux tasks**.

Redux Toolkit starts with two key APIs that simplify the most common things you do in every Redux app:

- `configureStore` sets up a well-configured Redux store with a single function call, including combining reducers, adding the thunk middleware, and setting up the Redux DevTools integration. It also is easier to configure than `createStore`, because it takes named options parameters.
- `createSlice` lets you write reducers that use [the Immer library](https://immerjs.github.io/immer/) to enable writing immutable updates using "mutating" JS syntax like `state.value = 123`, with no spreads needed. It also automatically generates action creator functions for each reducer, and generates action type strings internally based on your reducer's names. Finally, it works great with TypeScript.

That means that the code _you_ write can be drastically simpler. For example, that same todos reducer could just be:

```js title="features/todos/todosSlice.js"
import { createSlice } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push({
        id: action.payload.id,
        text: action.payload.text,
        completed: false
      })
    },
    todoToggled(state, action) {
      const todo = state.find(todo => todo.id === action.payload)
      todo.completed = !todo.completed
    }
  }
})

export const { todoAdded, todoToggled } = todosSlice.actions
export default todosSlice.reducer
```

All of the action creators and action types are generated automatically, and the reducer code is shorter and easier to understand. It's also much more clear what's actually being updated in each case.

With `configureStore`, the store setup can be simplified down to:

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  }
})
```

Note that **this one `configureStore` call automatically does all the usual setup work you'd have done manually**:

- The slice reducers were automatically passed to `combineReducers()`
- The `redux-thunk` middleware was automatically added
- Dev-mode middleware was added to catch accidental mutations
- The Redux DevTools Extension was automatically set up
- The middleware and DevTools enhancers were composed together and added to the store

At the same time, **`configureStore` provides the options to let users modify any of those default behaviors** (like turning off thunks and adding sagas, or disabling the DevTools in production),

From there, Redux Toolkit includes other APIs for common Redux tasks:

- `createAsyncThunk`: abstracts the standard "dispatch actions before/after an async request" pattern
- `createEntityAdapter`: prebuilt reducers and selectors for CRUD operations on normalized state
- `createSelector`: a re-export of the standard Reselect API for memoized selectors
- `createListenerMiddleware`: a side effects middleware for running logic in response to dispatched actions

Finally, the RTK package also includes "RTK Query", a full data fetching and caching solution for Redux apps, as a separate optional `@reduxjs/toolkit/query` entry point. It lets you define endpoints (REST, GraphQL, or any async function), and generates a reducer and middleware that fully manage fetching data, updating loading state, and caching results. It also automatically generates React hooks that can be used in components to fetch data, like `const { data, isFetching} = useGetPokemonQuery('pikachu')`

Each of these APIs is completely optional and designed for specific use cases, and **you can pick and choose which APIs you actually use in your app**. But, all of them are highly recommended to help with those tasks.

Note that **Redux Toolkit is still "Redux"!** There's still a single store, with dispatched action objects for updates, and reducers that immutably update state, plus the ability to write thunks for async logic, manage normalized state, type your code with TypeScript, and use the DevTools. **There's just way less code _you_ have to write for the same results!**

## Why We Want You To Use Redux Toolkit

As Redux maintainers, our opinion is:

:::tip

**We want _all_ Redux users to write their Redux code with Redux Toolkit, because it simplifies your code _and_ eliminates many common Redux mistakes and bugs!**

:::

The "boilerplate" and complexity of the early Redux patterns was never a _necessary_ part of Redux. Those patterns only existed because:

- The original "Flux Architecture" used some of those same approaches
- The early Redux docs showed things like action type constants to enable separating code into different files by type
- JavaScript is a mutable language by default, and writing immutable updates required manual object spreads and array updates
- Redux was originally built in just a few weeks and intentionally designed to be just a few API primitives

Additionally, the Redux community has adopted some specific approaches that add additional boilerplate:

- Emphasizing use of the `redux-saga` middleware as a common approach for writing side effects
- Insisting on hand-writing TS types for Redux action objects and creating union types to limit what actions can be dispatched at the type level

Over the years, we've seen how people actually used Redux in practice. We've seen how the community wrote hundreds of add-on libraries for tasks like generating action types and creators, async logic and side effects, and data fetching. We've also seen the problems that have consistently caused pain for our users, like accidentally mutating state, writing dozens of lines of code just to make one simple state update, and having trouble tracing how a codebase fits together. We've helped thousands of users who were trying to learn and use Redux and struggling to understand how all the pieces fit together, and were confused by the number of concepts and amount of extra code they had to write. We _know_ what problems our users are facing.

**We specifically designed Redux Toolkit to solve those problems!**

- Redux Toolkit simplifies store setup down to a single clear function call, while retaining the ability to fully configure the store's options if you need to
- Redux Toolkit eliminates accidental mutations, which have always been the #1 cause of Redux bugs
- Redux Toolkit eliminates the need to write any action creators or action types by hand
- Redux Toolkit eliminates the need to write manual and error-prone immutable update logic
- Redux Toolkit makes it easy to write a Redux feature's code in one file, instead of spreading it across multiple separate files
- Redux Toolkit offers excellent TS support, with APIs that are designed to give you excellent type safety and minimize the number of types you have to define in your code
- RTK Query can eliminate the need to write _any_ thunks, reducers, action creators, or effect hooks to manage fetching data and tracking loading state

Because of this:

:::tip

**We specifically recommend that our users _should_ use Redux Toolkit (the `@reduxjs/toolkit` package), and should _not_ use the legacy `redux` core package for any new Redux code today!**

:::

Even for existing applications, we recommend at least switching out `createStore` for `configureStore` as the dev-mode middleware will also help you catch accidental mutation and serializability errors in existing code bases. We also want to encourage you to switch the reducers you are using most (and any ones you write in the future) over to `createSlice` - the code will be shorter and easier to understand, and the safety improvements will save you time and effort going forward.

**The `redux` core package still works, but today we consider it to be obsolete**. All of its APIs are also re-exported from `@reduxjs/toolkit`, and `configureStore` does everything `createStore` does but with better default behavior and configurability.

It _is_ useful to understand the lower-level concepts, so that you have a better understanding of what Redux Toolkit is doing for you. That's why [the "Redux Fundamentals" tutorial shows how Redux works, with no abstractions](../tutorials/fundamentals/part-1-overview.md). _But_, it shows those examples solely as a learning tool, and finishes by showing you how Redux Toolkit simplifies the older hand-written Redux code.

If you are using the `redux` core package by itself, your code will continue to work. **But, we strongly encourage you to switch over to `@reduxjs/toolkit`, and update your code to use the Redux Toolkit APIs instead!**

## Further Information

See these docs pages and blog posts for more details

- [Redux Essentials: Redux App Structure](../tutorials/essentials/part-2-app-structure.md)
- [Redux Fundamentals: Modern Redux with Redux Toolkit](../tutorials/fundamentals/part-8-modern-redux.md)
- [Redux Style Guide: Best Practices and Recommendations](../style-guide/style-guide.md)
- [Mark Erikson: Redux Toolkit 1.0 Announcement and development history](https://blog.isquaredsoftware.com/2019/10/redux-toolkit-1.0/)
