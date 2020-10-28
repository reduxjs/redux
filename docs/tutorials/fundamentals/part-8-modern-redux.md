---
id: part-8-modern-redux
title: 'Redux Fundamentals, Part 8: Modern Redux with Redux Toolkit'
sidebar_label: 'Modern Redux with Redux Toolkit'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the modern way to write Redux logic'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Redux Fundamentals, Part 8: Modern Redux with Redux Toolkit

:::tip What You'll Learn

- How to simplify your Redux logic using Redux Toolkit
- Next steps for learning and using Redux

:::

Congratulations, you've made it to the last section of this tutorial! We've got one more topic to cover before we're done.

If you'd like a reminder of what we've covered so far, take a look at this summary:

:::info

<DetailedExplanation title="Recap: What You've Learned">

- [Part 1: Overview](./part-1-overview.md):
  - what Redux is, when/why to use it, and the basic pieces of a Redux app
- [Part 2: Concepts and Data Flow](./part-2-concepts-data-flow.md):
  - How Redux uses a "one-way data flow" pattern
- [Part 3: State, Actions, and Reducers](./part-3-state-actions-reducers.md):
  - Redux state is made of plain JS data
  - Actions are objects that describe "what happened" events in an app
  - Reducers take current state and an action, and calculate a new state
  - Reducers must follow rules like "immutable updates" and "no side effects"
- [Part 4: Store](./part-4-store.md):
  - The `createStore` API creates a Redux store with a root reducer function
  - Stores can be customized using "enhancers" and "middleware"
  - The Redux DevTools extension lets you see how your state changes over time
- [Part 5: UI and React](./part-5-ui-and-react.md):
  - Redux is separate from any UI, but frequently used with React
  - React-Redux provides APIs to let React components talk to Redux stores
  - `useSelector` reads values from Redux state and subscribes to updates
  - `useDispatch` lets components dispatch actions
  - `<Provider>` wraps your app and lets components access the store
- [Part 6: Async Logic and Data Fetching](./part-6-async-logic.md):
  - Redux middleware allow writing logic that has side effects
  - Middleware add an extra step to the Redux data flow, enabling async logic
  - Redux "thunk" functions are the standard way to write basic async logic
- [Part 7: Standard Redux Patterns](./part-7-standard-patterns.md):
  - Action creators encapsulate preparing action objects and thunks
  - Memoized selectors optimize calculating transformed data
  - Request status should be tracked with loading state enum values
  - Normalized state makes it easier to look up items by IDs

</DetailedExplanation>

:::

As you've seen, many aspects of Redux involve writing some code that can be verbose, such as immutable updates, action types and action creators, and normalizing state. There's good reasons why these patterns exist, but writing that code "by hand" can be difficult. In addition, the process for setting up a Redux store takes several steps, and we've had to come up with our own logic for things like dispatching "loading" actions in thunks or processing normalized data. Finally, many times users aren't sure what "the right way" is to write Redux logic.

That's why the Redux team created **Redux Toolkit**: our official, opinionated, "batteries included" toolset for efficient Redux development.

Redux Toolkit contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

Because of this, **Redux Toolkit is the standard way to write Redux application logic**. The "hand-written" Redux logic you've written so far in this tutorial is real working code, but **you shouldn't write Redux logic by hand** - we've covered those approaches in this tutorial so that you understand _how_ Redux works. However, **for real applications, you should use Redux Toolkit to write your Redux logic.**

When you use Redux Toolkit, all the concepts that we've covered so far (actions, reducers, store setup, action creators, thunks, etc) still exist, but **Redux Toolkit provides easier ways to write that code**. In addition, Redux Toolkit _only_ covers the Redux logic - we still use React-Redux to let our React components talk to the Redux store, including `useSelector` and `useDispatch`.

So, let's see how we can use Redux Toolkit to simplify the code we've already written in our example todo application. We'll primarily be rewriting our "slice" files, but we should be able to keep all the UI code the same.

Before we continue, **add the Redux Toolkit package to your app**:

```bash
npm install @reduxjs/toolkit
```

## Store Setup

We've gone through a few iterations of setup logic for our Redux store. Currently, it looks like this:

```js title="src/rootReducer.js"
import { combineReducers } from 'redux'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  todos: todosReducer,
  filters: filtersReducer
})

export default rootReducer
```

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

const store = createStore(rootReducer, composedEnhancer)
export default store
```

Notice that the setup process takes several steps. We have to:

- Combine the slice reducers together to form the root reducer
- Import the root reducer into the store file
- Import the thunk middleware, `applyMiddleware`, and `composeWithDevTools` APIs
- Create a store enhancer with the middleware and devtools
- Create the store with the root reducer

It would be nice if we could cut down the number of steps here.

### Using `configureStore`

**Redux Toolkit has a `configureStore` API that simplifies the store setup process**. `configureStore` wraps around the Redux core `createStore` API, and handles most of the store setup for us automatically. In fact, we can cut it down to effectively one step:

```js title="src/store.js"
// highlight-next-line
import { configureStore } from '@reduxjs/toolki'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

// highlight-start
const store = configureStore({
  reducer: {
    // Define a top-level state field named `todos`, handled by `todosReducer`
    todos: todosReducer,
    filters: filtersReducer
  }
})
// highlight-end

export default store
```

That one call to `configureStore` did all the work for us:

- It combined `todosReducer` and `filtersReducer` into the root reducer function, which will handle a root state that looks like `{todos, filters}`
- It created a Redux store using that root reducer
- It automatically added the `thunk` middleware
- It automatically added more middleware to check for common mistakes like accidentally mutating the state
- It automatically set up the Redux DevTools Extension connection

We can confirm this works by opening up our example todo application and using it. All of our existing feature code works fine! Since we're dispatching actions, dispatching thunks, reading state in the UI, and looking at the action history in the DevTools, all those pieces must be working correctly. All we've done is switched out the store setup code.

Let's see what happens now if we accidentally mutate some of the state. What if we change the "todos loading" reducer so that it directly changes the state field, instead of immutably making a copy?

```js title="src/features/todos/todosSlice"
export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // omit other cases
    case 'todos/todosLoading': {
      // ❌ WARNING: example only - don't do this in a normal reducer!
      state.status = 'loading'
      return state
    }
    default:
      return state
  }
}
```

Uh-oh. Our whole app just crashed! What happened?

![Immutability check middleware](/img/tutorials/fundamentals/immutable-error.png)

**This error message is a _good_ thing - we caught a bug in our app!** `configureStore` specifically added an extra middleware that automatically throws an error whenever it sees an accidental mutation of our state (in development mode only). That helps catch mistakes we might make while writing our code.

## Writing Slices

As we've added new features to our app, the slice files have gotten bigger and more complicated. In particular, the `todosReducer` has gotten harder to read because of all the nested object spreads for immutable updates, and we've written multiple action creator functions.

**Redux Toolkit has a `createSlice` API that will help us simplify our Redux logic**. `createSlice` does several important things for us:

- We can write the case reducers as functions inside of an object, instead of having to write a `switch/case` statement
- The reducers will be able to write shorter immutable update logic
- All the action creators will be generated automatically based on the reducer functions we've provided

### Using `createSlice`

### Immutable Updates with Immer

## Writing Thunks

### Using `createAsyncThunk`

## Normalizing State

### Using `createEntityAdapter`

**FIXME Use selectors**

## What You've Learned

## Next Steps for Learning and Using Redux
