---
id: troubleshooting
title: Troubleshooting
---

# Troubleshooting

This is a place to share common problems and solutions to them.
The examples use React and Redux Toolkit, but you should still find them useful if you use something else.

If your problem isn't listed here, the [Debugging Redux](./DebuggingRedux.md) page describes how to track down what your app is actually doing, using the Redux DevTools and other tools.

## Common Problems

### Nothing happens when I dispatch an action

Sometimes, you are trying to dispatch an action, but your view does not update. There are a few usual causes.

#### The reducer mutated the state

Redux assumes that reducers never mutate the objects they are given. React-Redux's `useSelector` decides whether a component needs to re-render by comparing the selected value before and after the dispatch with `===`. If a reducer mutates the existing state object and returns it, the reference is the same, the comparison says "nothing changed", and the component does not update.

Redux Toolkit's `createSlice` and `createReducer` wrap your reducers in [Immer](https://immerjs.github.io/immer/), so you can write "mutating" code inside them and Immer produces a correctly updated copy:

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: string
  text: string
  completed: boolean
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    todoAdded(state, action: PayloadAction<Todo>) {
      // Safe: Immer turns this into an immutable update
      state.push(action.payload)
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    }
  }
})
```

That only works _inside_ `createSlice`, `createReducer`, or Immer's `produce`. If you write a reducer by hand, you have to copy every level you change:

```ts
import type { PayloadAction, UnknownAction } from '@reduxjs/toolkit'

function todosReducer(state: Todo[] = [], action: UnknownAction): Todo[] {
  switch (action.type) {
    case 'todos/todoToggled': {
      const id = (action as PayloadAction<string>).payload
      return state.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }
    default:
      return state
  }
}
```

The same rule applies to selectors and to code that reads from `store.getState()`: don't modify the objects you get back.

In development, `configureStore` adds a middleware that checks for accidental mutations and throws an error like `A state mutation was detected between dispatches, in the path 'todos.0.completed'`. If you see that error, the path tells you which value was changed in place. See [the immutability middleware docs](https://redux-toolkit.js.org/api/immutabilityMiddleware) for details. The [Immutable Update Patterns](./structuring-reducers/ImmutableUpdatePatterns.md) page covers how to write these updates by hand.

#### The action was never dispatched

Calling an action creator does _not_ dispatch anything. It only returns an action object. This code does nothing:

```tsx
import { todoAdded } from './todosSlice'

function AddTodo() {
  const handleClick = () => {
    // Won't work! This just creates an object and throws it away.
    todoAdded({ id: '1', text: 'Fix the issue', completed: false })
  }

  return <button onClick={handleClick}>Add</button>
}
```

It is up to you to pass the action to `dispatch`. In a component, get `dispatch` from the `useDispatch` hook (or a typed `useAppDispatch` wrapper):

```tsx
import { useAppDispatch } from '../../app/hooks'
import { todoAdded } from './todosSlice'

function AddTodo() {
  const dispatch = useAppDispatch()

  const handleClick = () => {
    // Works!
    dispatch(todoAdded({ id: '1', text: 'Fix the issue', completed: false }))
  }

  return <button onClick={handleClick}>Add</button>
}
```

The Redux DevTools show every dispatched action. If the action you expect is not in the list, it was never dispatched.

#### The selector reads the wrong part of the state

If the action shows up in the DevTools and the state changes, but the component still doesn't update, check the selector. A common mistake is reading a field that doesn't exist, which silently returns `undefined`:

```ts
// State shape: { todos: Todo[]; filters: { status: string } }

// Wrong: there is no `state.todo`, so this is always `undefined`
const todos = useAppSelector(state => state.todo)

// Right
const todos = useAppSelector(state => state.todos)
```

Typing your hooks with `RootState` catches this at compile time. See [Usage with TypeScript](./UsageWithTypescript.md#define-typed-hooks).

If the selector reads a value that isn't in the store at all (for example, the reducer wasn't added to `configureStore`), check the "State" tab in the DevTools to see the actual shape.

### "A non-serializable value was detected in an action" or "in the state"

In development, `configureStore` also adds a middleware that checks whether every action and every piece of state is serializable (plain objects, arrays, strings, numbers, booleans, `null`, `undefined`). The error message includes the path where the value was found:

```
A non-serializable value was detected in an action, in the path: `payload.dueDate`.
Value: Fri Sep 18 2026 10:00:00 GMT-0400 (Eastern Daylight Time)
```

The usual causes are `Date` objects, class instances, `Map`/`Set`, functions, and Promises. The fix is to convert the value before it goes into an action or the state: store `dueDate.toISOString()` instead of a `Date`, store a plain object instead of a class instance, and keep functions and Promises out of actions entirely. If a value must be non-serializable, you can tell the middleware to ignore specific paths or action types, or disable the check. See [Working with Non-Serializable Data](https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data) and the [serializability middleware docs](https://redux-toolkit.js.org/api/serializabilityMiddleware).

The FAQ explains why this matters: [Can I put functions, promises, or other non-serializable items in my store state?](../faq/OrganizingState.md#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)

### "Selector returned a different result when called with the same parameters"

React-Redux logs this warning in development when a `useSelector` callback returns a new reference each time it runs. The warning is telling you the component will re-render after _every_ dispatched action, whether or not the data it uses changed. Selectors that build a new object or array (`.map()`, `.filter()`, `{ a, b }`) all do this:

```ts
// Re-renders on every action: `filter` returns a new array every time
const completed = useAppSelector(state =>
  state.todos.filter(todo => todo.completed)
)
```

Either select the source data and derive the result inside the component, or memoize the derivation with `createSelector`:

```ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.filter(todo => todo.completed)
)

const completed = useAppSelector(selectCompletedTodos)
```

See [Why is my component re-rendering too often?](../faq/ReactRedux.md#why-is-my-component-re-rendering-too-often) and [Deriving Data with Selectors](./deriving-data-selectors.md). The check itself is described in the [React-Redux hooks docs](https://react-redux.js.org/api/hooks#development-mode-checks).

### "could not find react-redux context value; please ensure the component is wrapped in a `<Provider>`"

`useSelector` and `useDispatch` read the store from React context. This error means a component called one of them without a `<Provider store={store}>` above it in the tree. Check that `Provider` wraps your root component, and that anything rendered outside the main tree (portals are fine, but a separate `createRoot` call or a test render is not) gets its own `Provider`. In tests, render the component inside a `Provider` with a store created for that test, as shown in [Writing Tests](./WritingTests.mdx).

### TypeScript says a thunk is not assignable to `UnknownAction`

Calling `dispatch(someThunk())` from a component fails with an error like `Argument of type 'ThunkAction<...>' is not assignable to parameter of type 'UnknownAction'`. The plain `useDispatch()` hook returns the base `Dispatch` type, which does not know about the thunk middleware. Use a `useAppDispatch` hook typed with your store's `AppDispatch` instead:

```ts
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

`AppDispatch` is `typeof store.dispatch`, which `configureStore` infers to include the thunk middleware. See [Define Root State and Dispatch Types](./UsageWithTypescript.md#define-root-state-and-dispatch-types).

### An RTK Query hook returns an error

Query and mutation hooks do not throw. They return `isError`, `error`, and `status` fields, and the error object has a different shape depending on whether the request failed on the network (`{ status: 'FETCH_ERROR', error: string }`) or the server returned a non-2xx status (`{ status: number, data: unknown }`). Read the hook result rather than wrapping it in `try`/`catch`. See [RTK Query error handling](https://redux-toolkit.js.org/rtk-query/usage/error-handling). The "RTK Query" tab in the Redux DevTools shows every cached query, its status, and its last response.

## Something else doesn't work

Most Redux problems come down to one of three questions: was the action dispatched, what did the reducer do with it, and what did the component select? The Redux DevTools answer all three. See [Debugging Redux](./DebuggingRedux.md) for how to use them, and for the general debugging approach they fit into.

Ask around on the **#redux** [Reactiflux](https://www.reactiflux.com/) Discord channel, or [create an issue](https://github.com/reduxjs/redux/issues).

If you figure it out, [edit this document](https://github.com/reduxjs/redux/edit/master/docs/usage/Troubleshooting.md) as a courtesy to the next person having the same problem.
