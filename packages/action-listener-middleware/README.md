# RTK Incubator - Action Listener Middleware

This package provides an experimental callback-based Redux middleware that we hope to include in Redux Toolkit directly in a future release. We're publishing it as a standalone package to allow users to try it out separately and give us feedback on its API design.

This middleware lets you define callbacks that will run in response to specific actions being dispatched. It's intended to be a lightweight alternative to more widely used Redux async middleware like sagas and observables, and similar to thunks in level of complexity and concept.

## Installation

```bash
npm i @rtk-incubator/action-listener-middleware

yarn add @rtk-incubator/action-listener-middleware
```

### Basic Usage

```js
import { configureStore } from '@reduxjs/toolkit'
import { createActionListenerMiddleware } from '@rtk-incubator/action-listener-middleware'

import todosReducer, {
  todoAdded,
  todoToggled,
  todoDeleted,
} from '../features/todos/todosSlice'

// Create the middleware instance
const listenerMiddleware = createActionListenerMiddleware()

// Add one or more listener callbacks for specific actions
listenerMiddleware.addListener(todoAdded, (action, listenerApi) => {
  // Run whatever additional side-effect-y logic you want here
  const { text } = action.payload
  console.log('Todo added: ', text)

  if (text === 'Buy milk') {
    // Use the listener API methods to dispatch, get state, or unsubscribe the listener
    listenerApi.unsubscribe()
  }
})

const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  // Add the middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware),
})
```

## Motivation

The Redux community has settled around three primary side effects libraries over time:

- Thunks use basic functions passed to `dispatch`. They let users run arbitrary logic, including dispatching actions and getting state. These are mostly used for basic AJAX requests and logic that needs to read from state before dispatching actions
- Sagas use generator functions and a custom set of "effects" APIs, which are then executed by a middleware. Sagas let users write powerful async logic and workflows that can respond to any dispatched action, including "background thread"-type behavior like infinite loops and cancelation.
- Observables use RxJS obesrvable operators. Observables form pipelines that do arbitrary processing similar to sagas, but with a more functional API style.

All three of those have strengths and weaknesses:

- Thunks are simple to use, but can only run imperative code and have no way to _respond_ to dispatched actions
- Sagas are extremely powerful, but require learning generator functions and the specifics of `redux-saga`'s effects API, and are overkill for many simpler use cases
- Observables are also powerful, but RxJS is its own complex API to learn and they can be hard to debug

If you need to run some code in response to a specific action being dispatched, you _could_ write a custom middleware:

```js
const myMiddleware = (storeAPI) => (next) => (action) => {
  if (action.type === 'some/specificAction') {
    console.log('Do something useful here')
  }

  return next(action)
}
```

However, it would be nice to have a more structured API to help abstract this process.

The `createActionListenerMiddleware` API provides that structure.

For more background and debate over the use cases and API design, see the original discussion issue and PR:

- [RTK issue #237: Add an action listener middleware](https://github.com/reduxjs/redux-toolkit/issues/237)
- [RTK PR #547: yet another attempt at an action listener middleware](https://github.com/reduxjs/redux-toolkit/pull/547)

## Usage and API

`createActionListenerMiddleware` lets you add listeners by providing an action type and a callback, lets you specify whether your callback should run before or after the action is processed by the reducers, and gives you access to `dispatch` and `getState` for use in your logic. Callbacks can also unsubscribe.

Listeners can be defined statically by calling `listenerMiddleware.addListener()` during setup, or added and removed dynamically at runtime with special `dispatch(addListenerAction())` and `dispatch(removeListenerAction())` actions.

### `createActionListenerMiddleware`

Creates an instance of the middleware, which should then be added to the store via the `middleware` parameter.

### `listenerMiddleware.addListener(actionType, listener, options?) : Unsubscribe`

Statically adds a new listener callback to the middleware.

Parameters:

- `actionType: string | ActionCreator | Matcher`: Determines which action(s) will cause the `listener` callback to run. May be a plain action type string, a standard RTK-generated action creator with a `.type` field, or an RTK "matcher" function. The listener will be run if the current action's `action.type` string is an exact match, or if the matcher function returns true.
- `listener: (action: Action, listenerApi: ListenerApi) => void`: the listener callback. Will receive the current action as its first argument. The second argument is a "listener API" object similar to the "thunk API" object in `createAsyncThunk`. It contains the usual `dispatch` and `getState` store methods, as well as two listener-specific methods: `unsubscribe` will remove the listener from the middleware, and `stopPropagation` will prevent any further listeners from handling this specific action.
- `options: {when?: 'before' | 'after'}`: an options object. Currently only one options field is accepted - an enum indicating whether to run this listener 'before' the action is processed by the reducers, or 'after'. If not provided, the default is 'after'.

The return value is a standard `unsubscribe()` callback that will remove this listener.

### `addListenerAction`

A standard RTK action creator that tells the middleware to add a new listener at runtime. It accepts the same arguments as `listenerMiddleware.addListener()`.

Dispatching this action returns an `unsubscribe()` callback from `dispatch`.

### `removeListenerAction`

A standard RTK action creator that tells the middleware to remove a listener at runtime. It requires two arguments:

- `typeOrActionCreator: string | ActionCreator`: the same action type / action creator that was used to add the listener
- `listener: ListenerCallback`: the same listener callback reference that was added originally

Note that matcher-based listeners currently cannot be removed with this approach - you must use the `unsubscribe()` callback that was returned when adding the listener.
