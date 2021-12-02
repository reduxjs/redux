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

// Add one or more listener callbacks for specific actions. They may
// contain any sync or async logic, similar to thunks.
listenerMiddleware.addListener(todoAdded, (action, listenerApi) => {
  // Run whatever additional side-effect-y logic you want here
  const { text } = action.payload
  console.log('Todo added: ', text)

  if (text === 'Buy milk') {
    // Use the listener API methods to dispatch, get state, or unsubscribe the listener
    listenerApi.dispatch(todoAdded('Buy pet food'))
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

## API Reference

`createActionListenerMiddleware` lets you add listeners by providing a "listener callback" containing additional logic, a way to specify when that callback should run based on dispatched actions or state changes, and whether your callback should run before or after the action is processed by the reducers.

The middleware then gives you access to `dispatch` and `getState` for use in your listener callback's logic. Callbacks can also unsubscribe to stop from being run again in the future.

Listeners can be defined statically by calling `listenerMiddleware.addListener()` during setup, or added and removed dynamically at runtime with special `dispatch(addListenerAction())` and `dispatch(removeListenerAction())` actions.

### `createActionListenerMiddleware: (options?: CreateMiddlewareOptions) => Middleware`

Creates an instance of the middleware, which should then be added to the store via the `middleware` parameter.

Current options are:

- `extra`: an optional "extra argument" that will be injected into the `listenerApi` parameter of each listener. Equivalent to [the "extra argument" in the Redux Thunk middleware](https://redux.js.org/usage/writing-logic-thunks#injecting-config-values-into-thunks).

- `onError`: an optional error handler that gets called with synchronous and async errors raised by `listener` and synchronous errors thrown by `predicate`.

### `listenerMiddleware.addListener(predicate, listener, options?) : Unsubscribe`

Statically adds a new listener callback to the middleware.

Parameters:

- `predicate: string | ActionCreator | Matcher | ListenerPredicate`: Determines which action(s) will cause the `listener` callback to run. May be a plain action type string, a standard RTK-generated action creator with a `.type` field, an RTK "matcher" function, or a "listener predicate" that also receives the current and original state. The listener will be run if the current action's `action.type` string is an exact match, or if the matcher/predicate function returns `true`.
- `listener: (action: Action, listenerApi: ListenerApi) => void`: the listener callback. Will receive the current action as its first argument, as well as a "listener API" object similar to the "thunk API" object in `createAsyncThunk`. It contains:
  - `dispatch: Dispatch`: the standard `store.dispatch` method
  - `getState: () => State`: the standard `store.getState` method
  - `getOriginalState: () => State`: returns the store state as it existed when the action was originally dispatched, _before_ the reducers ran
  - `currentPhase: 'beforeReducer' | 'afterReducer'`: an string indicating when the listener is being called relative to the action processing
  - `condition: (predicate: ListenerPredicate, timeout?) => Promise<boolean>`: allows async logic to pause and wait for some condition to occur before continuing. See "Writing Async Workflows" below for details on usage.
  - `extra`: the "extra argument" that was provided as part of the middleware setup, if any
  - `unsubscribe` will remove the listener from the middleware
- `options: {when?: 'before' | 'after'}`: an options object. Currently only one options field is accepted - an enum indicating whether to run this listener 'before' the action is processed by the reducers, or 'after'. If not provided, the default is 'after'.

The return value is a standard `unsubscribe()` callback that will remove this listener.

If you try to add a listener entry but another entry with this exact function reference already exists, no new entry will be added, and the existing `unsubscribe` method will be returned.

Adding a listener takes a "listener predicate" callback, which will be called when an action is dispatched, and should return `true` if the listener itself should be called:

```ts
type ListenerPredicate<Action extends AnyAction, State> = (
  action: Action,
  currentState?: State,
  originalState?: State
) => boolean
```

The ["matcher" utility functions included in RTK](https://redux-toolkit.js.org/api/matching-utilities) are acceptable as predicates.

You may also pass an RTK action creator directly, or even a specific action type string. These are all acceptable:

```js
// 1) Action type string
middleware.addListener('todos/todoAdded', listener)
// 2) RTK action creator
middleware.addListener(todoAdded, listener)
// 3) RTK matcher function
middleware.addListener(isAnyOf(todoAdded, todoToggled), listener)
// 4) Listener predicate
middleware.addListener((action, currentState, previousState) => {
  // return comparison here
}, listener)
```

The listener may be configured to run _before_ an action reaches the reducer, _after_ the reducer, or both, by passing a `{when}` option when adding the listener:

```ts
middleware.addListener(increment, listener, { when: 'afterReducer' })
```

### `listenerMiddleware.removeListener(actionType, listener)`

Removes a given listener based on an action type string and a listener function reference.

### `addListenerAction`

A standard RTK action creator that tells the middleware to dynamcially add a new listener at runtime.

> **NOTE**: It is intended to eventually accept the same arguments as `listenerMiddleware.addListener()`, but currently only accepts action types and action creators - this will hopefully be fixed in a later update.

Dispatching this action returns an `unsubscribe()` callback from `dispatch`.

```js
const unsubscribe = store.dispatch(addListenerAction(predicate, listener))
```

### `removeListenerAction`

A standard RTK action creator that tells the middleware to remove a listener at runtime. It requires two arguments:

- `typeOrActionCreator: string | ActionCreator`: the same action type / action creator that was used to add the listener
- `listener: ListenerCallback`: the same listener callback reference that was added originally

Note that matcher-based listeners currently cannot be removed with this approach - you must use the `unsubscribe()` callback that was returned when adding the listener.

## Usage Guide

### Overall Purpose

This middleware lets you run additional logic when some action is dispatched, as a lighter-weight alternative to middleware like sagas and observables that have both a heavy runtime bundle cost and a large conceptual overhead.

This middleware is not intended to handle all possible use cases. Like thunks, it provides you with a basic set of primitives (including access to `dispatch` and `getState`), and gives you freedom to write any sync or async logic you want. This is both a strength (you can do anything!) and a weakness (you can do anything, with no guard rails!).

### Standard Usage Patterns

The most common expected usage is "run some logic after a given action was dispatched". For example, you could set up a simple analytics tracker by looking for certain actions and sending extracted data to the server, including pulling user details from the store:

```js
middleware.addListener(
  isAnyOf(action1, action2, action3),
  (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())

    const { specialData } = action.meta

    analyticsApi.trackUsage(action.type, user, specialData)
  }
)
```

You could also implement a generic API fetching capability, where the UI dispatches a plain action describing the type of resource to be requested, and the middleware automatically fetches it and dispatches a result action:

```js
middleware.addListener(resourceRequested, async (action, listenerApi) => {
  const { name, args } = action.payload
  dispatch(resourceLoading())

  const res = await serverApi.fetch(`/api/${name}`, ...args)
  dispatch(resourceLoaded(res.data))
})
```

The provided `listenerPredicate` should be `(action, currentState?, originalState?) => boolean`

The `listenerApi.unsubscribe` method may be used at any time, and will remove the listener from handling any future actions. As an example, you could create a one-shot listener by unconditionally calling `unsubscribe()` in the body - it would run the first time the relevant action is seen, and then immediately stop and not handle any future actions.

### Writing Async Workflows

One of the great strengths of both sagas and observables is their support for complex async workflows, including stopping and starting behavior based on specific dispatched actions. However, the weakness is that both require mastering a complex API with many unique operators (effects methods like `call()` and `fork()` for sagas, RxJS operators for observables), and both add a significant amount to application bundle size.

While this middleware is _not_ at all meant to fully replace those, it has some ability to implement long-running async workflows as well, using the `condition` method in `listenerApi`. This method is directly inspired by [the `condition` function in Temporal.io's workflow API](https://docs.temporal.io/docs/typescript/workflows/#condition) (credit to [@swyx](https://twitter.com/swyx) for the suggestion!).

The signature is:

```ts
type ConditionFunction<Action extends AnyAction, State> = (
  predicate: ListenerPredicate<Action, State> | (() => boolean),
  timeout?: number
) => Promise<boolean>
```

You can use `await condition(somePredicate)` as a way to pause execution of your listener callback until some criteria is met.

The `predicate` will be called before and after every action is processed, and should return `true` when the condition should resolve. (It is effectively a one-shot listener itself.) If a `timeout` number (in ms) is provided, the promise will resolve `true` if the `predicate` returns first, or `false` if the timeout expires. This allows you to write comparisons like `if (await condition(predicate))`.

This should enable writing longer-running workflows with more complex async logic, such as [the "cancellable counter" example from Redux-Saga](https://github.com/redux-saga/redux-saga/blob/1ecb1bed867eeafc69757df8acf1024b438a79e0/examples/cancellable-counter/src/sagas/index.js).

An example of usage, from the test suite:

```ts
test('condition method resolves promise when there is a timeout', async () => {
  let finalCount = 0
  let listenerStarted = false

  middleware.addListener(
    // @ts-expect-error state declaration not yet working right
    (action, currentState: CounterState) => {
      return increment.match(action) && currentState.value === 0
    },
    async (action, listenerApi) => {
      listenerStarted = true
      // Wait for either the counter to hit 3, or 50ms to elapse
      const result = await listenerApi.condition(
        // @ts-expect-error state declaration not yet working right
        (action, currentState: CounterState) => {
          return currentState.value === 3
        },
        50
      )

      // In this test, we expect the timeout to happen first
      expect(result).toBe(false)
      // Save the state for comparison outside the listener
      const latestState = listenerApi.getState() as CounterState
      finalCount = latestState.value
    },
    { when: 'beforeReducer' }
  )

  store.dispatch(increment())
  // The listener should have started right away
  expect(listenerStarted).toBe(true)

  store.dispatch(increment())

  // If we wait 150ms, the condition timeout will expire first
  await delay(150)
  // Update the state one more time to confirm the listener isn't checking it
  store.dispatch(increment())

  // Handled the state update before the delay, but not after
  expect(finalCount).toBe(2)
})
```

### TypeScript Usage

The code is typed, but the behavior is incomplete. In particular, the various `state`, `dispatch`, and `extra` types in the listeners are not at all connected to the actual store types. You will likely need to manually declare or cast them as appropriate for your store setup, and possibly even use `// @ts-ignore` if the compiler doesn't accept declaring those types.

## Feedback

Please provide feedback in [RTK discussion #1648: "New experimental "action listener middleware" package"](https://github.com/reduxjs/redux-toolkit/discussions/1648).
