---
id: reducing-boilerplate
title: Reducing Boilerplate
---

# Reducing Boilerplate

Redux is in part [inspired by Flux](../understanding/history-and-design/PriorArt.md), and the most common complaint about Flux is how it makes you write a lot of boilerplate. In this recipe, we will consider which parts of Redux are actual design decisions, which parts are conventions you can drop, and how [Redux Toolkit](/toolkit) generates the repetitive parts for you.

## Actions

Actions are plain objects describing what happened in the app, and serve as the sole way to describe an intention to mutate the data. It's important that **actions being objects you have to dispatch is not boilerplate, but one of the [fundamental design choices](../understanding/thinking-in-redux/ThreePrinciples.md) of Redux**.

There are frameworks claiming to be similar to Flux, but without a concept of action objects. In terms of being predictable, this is a step backwards from Flux or Redux. If there are no serializable plain object actions, it is impossible to record and replay user sessions, or to implement [hot reloading with time travel](https://www.youtube.com/watch?v=xsSnOQynTHs). If you'd rather modify data directly, you don't need Redux.

Actions look like this:

```js
{ type: 'todos/todoAdded', payload: 'Use Redux' }
{ type: 'todos/todoRemoved', payload: 42 }
{ type: 'articles/articleLoaded', payload: { ... } }
```

It is a common convention that actions have a constant type that helps reducers identify them. We recommend that you use strings and not [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for action types, because strings are serializable, and by using Symbols you make recording and replaying harder than it needs to be.

In Flux, it is traditionally thought that you would define every action type as a string constant:

```js
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const LOAD_ARTICLE = 'LOAD_ARTICLE'
```

Why is this beneficial? For larger projects, there are some benefits to having action types defined in one place:

- It helps keep the naming consistent because all action types are gathered in a single place.
- Sometimes you want to see all existing actions before working on a new feature. It may be that the action you need was already added by somebody on the team, but you didn't know.
- The list of action types that were added, removed, and changed in a Pull Request helps everyone on the team keep track of scope and implementation of new features.
- If you make a typo when importing an action constant, you will get `undefined`. Redux will immediately throw when dispatching such an action, and you'll find the mistake sooner.

Those benefits come from having a single definition per action, not from the constants themselves. With Redux Toolkit's [`createSlice`](/toolkit/api/createSlice), the definition is the case reducer, and the type string is generated from the slice name and the reducer name:

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as string[],
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      state.push(action.payload)
    },
    todoRemoved(state, action: PayloadAction<number>) {
      state.splice(action.payload, 1)
    }
  }
})

export const { todoAdded, todoRemoved } = todosSlice.actions

todoAdded.type // 'todos/todoAdded'
```

You never write the string, but it still exists and is still visible in the DevTools and in the action objects.

## Action Creators

It is another common convention that, instead of creating action objects inline in the places where you dispatch the actions, you would create functions generating them:

```ts
export function addTodo(text: string) {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}

// somewhere in an event handler
dispatch(addTodo('Use Redux'))
```

Action creators have often been criticized as boilerplate. Well, you don't have to write them! **You can use object literals if you feel this better suits your project.** There are, however, some benefits for writing action creators you should know about.

Let's say a designer comes back to us after reviewing our prototype, and tells us that we need to allow three todos maximum. We can enforce this by rewriting our action creator as a [thunk](./writing-logic-thunks.mdx) and adding an early exit:

```ts
import { todoAdded } from './todosSlice'
import type { AppThunk } from '../../app/store'

export function addTodo(text: string): AppThunk {
  return function (dispatch, getState) {
    if (getState().todos.length === 3) {
      // Exit early
      return
    }
    dispatch(todoAdded(text))
  }
}
```

We just modified how the `addTodo` action creator behaves, completely invisible to the calling code. **We don't have to worry about looking at each place where todos are being added, to make sure they have this check.** Action creators let you decouple additional logic around dispatching an action, from the actual components emitting those actions. It's very handy when the application is under heavy development, and the requirements change often.

### Generating Action Creators

Writing an action creator for every action type by hand is repetitive: each one is a function that takes some arguments and puts them in an object with a `type` field. `createSlice` generates one action creator per case reducer, as shown above, and that covers most actions in an app. For an action that is not tied to one slice, [`createAction`](/toolkit/api/createAction) generates a single action creator from a type string:

```ts
import { createAction } from '@reduxjs/toolkit'

export const userLoggedOut = createAction('auth/userLoggedOut')
export const todoEdited = createAction<{ id: number; text: string }>(
  'todos/todoEdited'
)

todoEdited({ id: 1, text: 'Use Redux Toolkit' })
// { type: 'todos/todoEdited', payload: { id: 1, text: 'Use Redux Toolkit' } }
```

Both follow the [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action) convention: the data goes in a `payload` field, with an optional `meta` field for extra information.

## Async Action Creators

[Middleware](../understanding/thinking-in-redux/Glossary.md#middleware) lets you inject custom logic that interprets every action object before it is dispatched. Async actions are the most common use case for middleware.

Without any middleware, [`dispatch`](../api/Store.md#dispatchaction) only accepts a plain object, so we would have to perform AJAX calls inside our components and dispatch a "request" action before the call and a "success" or "failure" action after it. That quickly gets repetitive, because different components request data from the same API endpoints, and we want to reuse some of this logic (like skipping the request when there is cached data) from many components.

**Middleware lets us write more expressive, potentially async action creators.** The thunk middleware, which `configureStore` includes by default, lets you dispatch a function that receives `dispatch` and `getState`, so a single action creator can dispatch many times:

```ts
export function loadPosts(userId: number): AppThunk {
  return async function (dispatch, getState) {
    if (getState().posts.byUser[userId]) {
      // There is cached data! Don't do anything.
      return
    }

    dispatch(postsLoadingStarted({ userId }))

    try {
      const response = await fetch(`http://myapi.com/users/${userId}/posts`)
      const posts = await response.json()
      dispatch(postsLoadingSucceeded({ userId, posts }))
    } catch (error) {
      dispatch(postsLoadingFailed({ userId, error: String(error) }))
    }
  }
}
```

The request / success / failure pattern itself is boilerplate, and Redux Toolkit's [`createAsyncThunk`](/toolkit/api/createAsyncThunk) generates it. You provide the type prefix and a function that returns a promise; it dispatches `pending`, `fulfilled`, and `rejected` actions around that promise, and gives you the action creators to handle in a slice:

```ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface PostsState {
  byUser: Record<number, Post[]>
  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const initialState: PostsState = { byUser: {}, status: 'idle' }

export const loadPosts = createAsyncThunk(
  'posts/loadPosts',
  async (userId: number) => {
    const response = await fetch(`http://myapi.com/users/${userId}/posts`)
    return (await response.json()) as Post[]
  },
  {
    condition(userId, { getState }) {
      // Skip the request if there is cached data
      return !(getState() as RootState).posts.byUser[userId]
    }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadPosts.pending, state => {
        state.status = 'loading'
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.status = 'idle'
        state.byUser[action.meta.arg] = action.payload
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})
```

For data that comes from a server and is cached in the store, [RTK Query](/toolkit/rtk-query/overview) goes one step further and generates the thunks, the reducers, the cache, and the React hooks from a description of the endpoints, so none of this is written per endpoint. See [Side Effects Approaches](./side-effects-approaches.mdx) for how to choose between these.

## Reducers

Redux reduces the boilerplate of Flux stores considerably by describing the update logic as a function. A function is simpler than an object, and much simpler than a class.

Consider this Flux store:

```js
const _todos = []

const TodoStore = Object.assign({}, EventEmitter.prototype, {
  getAll() {
    return _todos
  }
})

AppDispatcher.register(function (action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      _todos.push(text)
      TodoStore.emitChange()
  }
})

export default TodoStore
```

With Redux, the same update logic can be described as a reducer function:

```js
export function todos(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      return [...state, text]
    default:
      return state
  }
}
```

The `switch` statement is _not_ the real boilerplate. The real boilerplate of Flux is conceptual: the need to emit an update, the need to register the Store with a Dispatcher, the need for the Store to be an object (and the complications that arise when you want a universal app).

### Generating Reducers

If you don't like `switch`, a reducer can be expressed as an object mapping from action types to handler functions, and a small helper turns that object into a reducer:

```js
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

export const todos = createReducer([], {
  [ActionTypes.ADD_TODO]: (state, action) => {
    const text = action.text.trim()
    return [...state, text]
  }
})
```

That is what `createSlice` does internally: the `reducers` object is a lookup table from action type to case reducer. It also wraps each case reducer in [Immer](https://immerjs.github.io/immer/), so the handler can write `state.push(text)` instead of copying the array, and generates the action creators described earlier. The Redux reducer API is still `(state, action) => newState`; `createSlice` is one way to produce such a function.

For a step-by-step comparison of hand-written reducers and the same logic in `createSlice`, see [Refactoring Reducers](./structuring-reducers/RefactoringReducersExample.md). For moving an existing hand-written codebase to these patterns, see [Migrating to Modern Redux](./migrating-to-modern-redux.mdx).
