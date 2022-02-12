# RTK Incubator - Action Listener Middleware

This package provides a callback-based Redux middleware that we plan to include in Redux Toolkit directly in the next feature release. We're publishing it as a standalone package to allow users to try it out separately and give us feedback on its API design.

This middleware lets you define "listener" entries containing "effect" callbacks that will run in response to specific actions being dispatched. It's intended to be a lightweight alternative to more widely used Redux async middleware like sagas and observables. While similar to thunks in level of complexity and concept, it can be used to replicate some common saga usage patterns.

Conceptually, you can think of this as being similar to React's `useEffect` hook, except that it runs logic in response to Redux store updates instead of component props/state updates.

## Installation

```bash
npm i @rtk-incubator/action-listener-middleware

yarn add @rtk-incubator/action-listener-middleware
```

### Basic Usage

```js
import { configureStore } from '@reduxjs/toolkit'
import { createListenerMiddleware } from '@rtk-incubator/action-listener-middleware'

import todosReducer, {
  todoAdded,
  todoToggled,
  todoDeleted,
} from '../features/todos/todosSlice'

// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware()

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
listenerMiddleware.startListening({
  actionCreator: todoAdded,
  effect: async (action, listenerApi) => {
    // Run whatever additional side-effect-y logic you want here
    console.log('Todo added: ', action.payload.text)

    // Can cancel other running instances
    listenerApi.cancelActiveListeners()

    // Run async logic
    const data = await fetchData()

    // Pause until action dispatched or state changed
    if (await listenerApi.condition(matchSomeAction)) {
      // Use the listener API methods to dispatch, get state,
      // unsubscribe the listener, or cancel previous
      listenerApi.dispatch(todoAdded('Buy pet food'))
      listenerApi.unsubscribe()
    }
  },
})

const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  // Add the listener middleware to the store.
  // NOTE: Since this can receive actions with functions inside,
  // it should go before the serializability check middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
})
```

## Motivation

The Redux community has settled around three primary side effects libraries over time:

- Thunks use basic functions passed to `dispatch`. They let users run arbitrary logic, including dispatching actions and getting state. These are mostly used for basic AJAX requests and logic that needs to read from state before dispatching actions
- Sagas use generator functions and a custom set of "effects" APIs, which are then executed by a middleware. Sagas let users write powerful async logic and workflows that can respond to any dispatched action, including "background thread"-type behavior like infinite loops and cancelation.
- Observables use RxJS observable operators. Observables form pipelines that do arbitrary processing similar to sagas, but with a more functional API style.

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

The `createListenerMiddleware` API provides that structure.

For more background and debate over the use cases and API design, see the original discussion issue and PR:

- [RTK issue #237: Add an action listener middleware](https://github.com/reduxjs/redux-toolkit/issues/237)
- [RTK PR #547: yet another attempt at an action listener middleware](https://github.com/reduxjs/redux-toolkit/pull/547)
- [RTK discussion #1648: New experimental "action listener middleware" package available](https://github.com/reduxjs/redux-toolkit/discussions/1648)

## API Reference

`createListenerMiddleware` lets you add listeners by providing an "effect callback" containing additional logic, and a way to specify when that callback should run based on dispatched actions or state changes.

The middleware then gives you access to `dispatch` and `getState` for use in your effect callback's logic, similar to thunks. The listener also receives a set of async workflow functions like `take`, `condition`, `pause`, `fork`, and `unsubscribe`, which allow writing more complex async logic.

Listeners can be defined statically by calling `listenerMiddleware.startListening()` during setup, or added and removed dynamically at runtime with special `dispatch(addListener())` and `dispatch(removeListener())` actions.

### `createListenerMiddleware: (options?: CreateMiddlewareOptions) => ListenerMiddlewareInstance`

Creates an instance of the middleware, which should then be added to the store via `configureStore`'s `middleware` parameter.

Current options are:

- `extra`: an optional "extra argument" that will be injected into the `listenerApi` parameter of each listener. Equivalent to [the "extra argument" in the Redux Thunk middleware](https://redux.js.org/usage/writing-logic-thunks#injecting-config-values-into-thunks).

- `onError`: an optional error handler that gets called with synchronous and async errors raised by `listener` and synchronous errors thrown by `predicate`.

`createListenerMiddleware` returns an object (similar to how `createSlice` does), with the following fields:

- `middleware`: the actual listener middleware instance. Add this to `configureStore()`
- `startListening`: adds a single listener entry to this specific middleware instance
- `stopListening`: removes a single listener entry from this specific middleware instance
- `clearListeners`: removes all listener entries from this specific middleware instance

### `startListening(options: AddListenerOptions) : Unsubscribe`

Statically adds a new listener entry to the middleware.

The available options are:

```ts
type ListenerPredicate<Action extends AnyAction, State> = (
  action: Action,
  currentState?: State,
  originalState?: State
) => boolean

interface AddListenerOptions {
  // Four options for deciding when the listener will run:

  // 1) Exact action type string match
  type?: string

  // 2) Exact action type match based on the RTK action creator
  actionCreator?: ActionCreator

  // 3) Match one of many actions using an RTK matcher
  matcher?: Matcher

  // 4) Return true based on a combination of action + state
  predicate?: ListenerPredicate

  // The actual callback to run when the action is matched
  effect: (action: Action, listenerApi: ListenerApi) => void | Promise<void>
}
```

You must provide exactly _one_ of the four options for deciding when the listener will run: `type`, `actionCreator`, `matcher`, or `predicate`. Every time an action is dispatched, each listener will be checked to see if it should run based on the current action vs the comparison option provided.

These are all acceptable:

```ts
// 1) Action type string
startListening({ type: 'todos/todoAdded', listener })
// 2) RTK action creator
startListening({ actionCreator: todoAdded, listener })
// 3) RTK matcher function
startListening({ matcher: isAnyOf(todoAdded, todoToggled), listener })
// 4) Listener predicate
startListening({
  predicate: (action, currentState, previousState) => {
    // return true when the listener should run
  },
  listener,
})
```

Note that the `predicate` option actually allows matching solely against state-related checks, such as "did `state.x` change" or "the current value of `state.x` matches some criteria", regardless of the actual action.

The ["matcher" utility functions included in RTK](https://redux-toolkit.js.org/api/matching-utilities) are acceptable as predicates.

The return value is a standard `unsubscribe()` callback that will remove this listener. If you try to add a listener entry but another entry with this exact function reference already exists, no new entry will be added, and the existing `unsubscribe` method will be returned.

The `effect` callback will receive the current action as its first argument, as well as a "listener API" object similar to the "thunk API" object in `createAsyncThunk`.

All listener predicates and callbacks are checked _after_ the root reducer has already processed the action and updated the state. The `listenerApi.getOriginalState()` method can be used to get the state value that existed before the action that triggered this listener was processed.

### `stopListening(options: AddListenerOptions): boolean`

Removes a given listener. It accepts the same arguments as `startListening()`. It checks for an existing listener entry by comparing the function references of `listener` and the provided `actionCreator/matcher/predicate` function or `type` string.

Returns `true` if the `options.effect` listener has been removed, or `false` if no subscription matching the input provided has been found.

```ts
// 1) Action type string
stopListening({ type: 'todos/todoAdded', listener })
// 2) RTK action creator
stopListening({ actionCreator: todoAdded, listener })
// 3) RTK matcher function
stopListening({ matcher, listener })
// 4) Listener predicate
stopListening({ predicate, listener })
```

### `clearListeners(): void`

Removes all current listener entries. This is most likely useful for test scenarios where a single middleware or store instance might be used in multiple tests, as well as some app cleanup situations.

### `addListener`

A standard RTK action creator, imported from the package. Dispatching this action tells the middleware to dynamically add a new listener at runtime. It accepts exactly the same options as `startListening()`

Dispatching this action returns an `unsubscribe()` callback from `dispatch`.

```js
// Per above, provide `predicate` or any of the other comparison options
const unsubscribe = store.dispatch(addListener({ predicate, listener }))
```

### `removeListener`

A standard RTK action creator, imported from the package. Dispatching this action tells the middleware to dynamically remove a listener at runtime. Accepts the same arguments as `stopListening()`.

Returns `true` if the `options.listener` listener has been removed, `false` if no subscription matching the input provided has been found.

```js
store.dispatch(removeListener({ predicate, listener }))
```

### `removeAllListeners`

A standard RTK action creator, imported from the package. Dispatching this action tells the middleware to dynamically remove all listeners at runtime.

```js
store.dispatch(removeAllListeners())
```

### `listenerApi`

The `listenerApi` object is the second argument to each listener callback. It contains several utility functions that may be called anywhere inside the listener's logic. These can be divided into several categories:

#### Store Interaction Methods

- `dispatch: Dispatch`: the standard `store.dispatch` method
- `getState: () => State`: the standard `store.getState` method
- `getOriginalState: () => State`: returns the store state as it existed when the action was originally dispatched, _before_ the reducers ran. (**Note**: this method can only be called synchronously, during the initial dispatch call stack, to avoid memory leaks. Calling it asynchronously will throw an error.)

`dispatch` and `getState` are exactly the same as in a thunk. `getOriginalState` can be used to compare the original state before the listener was started.

#### Middleware Options

- `extra: unknown`: the "extra argument" that was provided as part of the middleware setup, if any

`extra` can be used to inject a value such as an API service layer into the middleware at creation time, and is accessible here.

#### Listener Subscription Management

- `unsubscribe: () => void`: will remove the listener from the middleware
- `subscribe: () => void`: will re-subscribe the listener if it was previously removed, or no-op if currently subscribed
- `cancelActiveListeners: () => void`: cancels all other running instances of this same listener _except_ for the one that made this call. (The cancelation will only have a meaningful effect if the other instances are paused using one of the cancelation-aware APIs like `take/cancel/pause/delay` - see "Cancelation and Task Management" in the "Usage" section for more details)
- `signal: AbortSignal`: An [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) whose `aborted` property will be set to `true` if the listener execution is aborted or completed.

Dynamically unsubscribing and re-subscribing this listener allows for more complex async workflows, such as avoiding duplicate running instances by calling `listenerApi.unsubscribe()` at the start of a listener, or calling `listenerApi.cancelActiveListeners()` to ensure that only the most recent instance is allowed to complete.

#### Conditional Workflow Execution

- `take: (predicate: ListenerPredicate, timeout?: number) => Promise<[Action, State, State] | null>`: returns a promise that will resolve when the `predicate` returns `true`. The return value is the `[action, currentState, previousState]` combination that the predicate saw as arguments. If a `timeout` is provided and expires first, the promise resolves to `null`.
- `condition: (predicate: ListenerPredicate, timeout?: number) => Promise<boolean>`: Similar to `take`, but resolves to `true` if the predicate succeeds, and `false` if a `timeout` is provided and expires first. This allows async logic to pause and wait for some condition to occur before continuing. See "Writing Async Workflows" below for details on usage.
- `delay: (timeoutMs: number) => Promise<void>`: returns a cancelation-aware promise that resolves after the timeout, or rejects if canceled before the expiration
- `pause: (promise: Promise<T>) => Promise<T>`: accepts any promise, and returns a cancelation-aware promise that either resolves with the argument promise or rejects if canceled before the resolution

These methods provide the ability to write conditional logic based on future dispatched actions and state changes. Both also accept an optional `timeout` in milliseconds.

`take` resolves to a `[action, currentState, previousState]` tuple or `null` if it timed out, whereas `condition` resolves to `true` if it succeeded or `false` if timed out.

`take` is meant for "wait for an action and get its contents", while `condition` is meant for checks like `if (await condition(predicate))`.

Both these methods are cancelation-aware, and will throw a `TaskAbortError` if the listener instance is canceled while paused.

#### Child Tasks

- `fork: (executor: (forkApi: ForkApi) => T | Promise<T>) => ForkedTask<T>`: Launches a "child task" that may be used to accomplish additional work. Accepts any sync or async function as its argument, and returns a `{result, cancel}` object that can be used to check the final status and return value of the child task, or cancel it while in-progress.

Child tasks can be launched, and waited on to collect their return values. The provided `executor` function will be called with a `forkApi` object containing `{pause, delay, signal}`, allowing it to pause or check cancelation status. It can also make use of the `listenerApi` from the listener's scope.

An example of this might be a listener that forks a child task containing an infinite loop that listens for events from a server. The parent then uses `listenerApi.condition()` to wait for a "stop" action, and cancels the child task.

The task and result types are:

```ts
export interface ForkedTaskAPI {
  pause<W>(waitFor: Promise<W>): Promise<W>
  delay(timeoutMs: number): Promise<void>
  signal: AbortSignal
}

export type TaskResolved<T> = {
  readonly status: 'ok'
  readonly value: T
}

export type TaskRejected = {
  readonly status: 'rejected'
  readonly error: unknown
}

export type TaskCancelled = {
  readonly status: 'cancelled'
  readonly error: TaskAbortError
}

export type TaskResult<Value> =
  | TaskResolved<Value>
  | TaskRejected
  | TaskCancelled

export interface ForkedTask<T> {
  result: Promise<TaskResult<T>>
  cancel(): void
}
```

## Usage Guide

### Overall Purpose

This middleware lets you run additional logic when some action is dispatched, as a lighter-weight alternative to middleware like sagas and observables that have both a heavy runtime bundle cost and a large conceptual overhead.

This middleware is not intended to handle all possible use cases. Like thunks, it provides you with a basic set of primitives (including access to `dispatch` and `getState`), and gives you freedom to write any sync or async logic you want. This is both a strength (you can do anything!) and a weakness (you can do anything, with no guard rails!).

As of v0.5.0, the middleware does include several async workflow primitives that are sufficient to write equivalents to many Redux-Saga effects operators like `takeLatest`, `takeLeading`, and `debounce`.

### Standard Usage Patterns

The most common expected usage is "run some logic after a given action was dispatched". For example, you could set up a simple analytics tracker by looking for certain actions and sending extracted data to the server, including pulling user details from the store:

```js
listenerMiddleware.startListening({
  matcher: isAnyOf(action1, action2, action3),
  effect: (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())

    const { specialData } = action.meta

    analyticsApi.trackUsage(action.type, user, specialData)
  },
})
```

However, the `predicate` option also allows triggering logic when some state value has changed, or when the state matches a particular condition:

```js
listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Trigger logic whenever this field changes
    return currentState.counter.value !== previousState.counter.value
  },
  effect,
})

listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    // Trigger logic after every action if this condition is true
    return currentState.counter.value > 3
  },
  effect,
})
```

You could also implement a generic API fetching capability, where the UI dispatches a plain action describing the type of resource to be requested, and the middleware automatically fetches it and dispatches a result action:

```js
listenerMiddleware.startListening({
  actionCreator: resourceRequested,
  effect: async (action, listenerApi) => {
    const { name, args } = action.payload
    listenerApi.dispatch(resourceLoading())

    const res = await serverApi.fetch(`/api/${name}`, ...args)
    listenerApi.dispatch(resourceLoaded(res.data))
  },
})
```

The `listenerApi.unsubscribe` method may be used at any time, and will remove the listener from handling any future actions. As an example, you could create a one-shot listener by unconditionally calling `unsubscribe()` in the body - it would run the first time the relevant action is seen, and then immediately stop and not handle any future actions. (The middleware actually uses this technique internally for the `take/condition` methods)

### Writing Async Workflows with Conditions

One of the great strengths of both sagas and observables is their support for complex async workflows, including stopping and starting behavior based on specific dispatched actions. However, the weakness is that both require mastering a complex API with many unique operators (effects methods like `call()` and `fork()` for sagas, RxJS operators for observables), and both add a significant amount to application bundle size.

While the listener middleware is _not_ meant to fully replace sagas or observables, it does provide a carefully chosen set of APIs to implement long-running async workflows as well.

Listeners can use the `condition` and `take` methods in `listenerApi` to wait until some action is dispatched or state check is met. The `condition` method is directly inspired by [the `condition` function in Temporal.io's workflow API](https://docs.temporal.io/docs/typescript/workflows/#condition) (credit to [@swyx](https://twitter.com/swyx) for the suggestion!), and `take` is inspired by [the `take` effect from Redux-Saga](https://redux-saga.js.org/docs/api#takepattern).

The signatures are:

```ts
type ConditionFunction<Action extends AnyAction, State> = (
  predicate: ListenerPredicate<Action, State> | (() => boolean),
  timeout?: number
) => Promise<boolean>

type TakeFunction<Action extends AnyAction, State> = (
  predicate: ListenerPredicate<Action, State> | (() => boolean),
  timeout?: number
) => Promise<[Action, State, State] | null>
```

You can use `await condition(somePredicate)` as a way to pause execution of your listener callback until some criteria is met.

The `predicate` will be called before and after every action is processed, and should return `true` when the condition should resolve. (It is effectively a one-shot listener itself.) If a `timeout` number (in ms) is provided, the promise will resolve `true` if the `predicate` returns first, or `false` if the timeout expires. This allows you to write comparisons like `if (await condition(predicate))`.

This should enable writing longer-running workflows with more complex async logic, such as [the "cancellable counter" example from Redux-Saga](https://github.com/redux-saga/redux-saga/blob/1ecb1bed867eeafc69757df8acf1024b438a79e0/examples/cancellable-counter/src/sagas/index.js).

An example of usage, from the test suite:

```ts
test('condition method resolves promise when there is a timeout', async () => {
  let finalCount = 0
  let listenerStarted = false

  listenerMiddleware.startListening({
    predicate: (action, currentState: CounterState) => {
      return increment.match(action) && currentState.value === 0
    },
    effect: async (action, listenerApi) => {
      listenerStarted = true
      // Wait for either the counter to hit 3, or 50ms to elapse
      const result = await listenerApi.condition(
        (action, currentState: CounterState) => {
          return currentState.value === 3
        },
        50
      )

      // In this test, we expect the timeout to happen first
      expect(result).toBe(false)
      // Save the state for comparison outside the listener
      const latestState = listenerApi.getState()
      finalCount = latestState.value
    },
  })

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

### Cancelation and Task Management

As of 0.5.0, the middleware now supports cancelation of running listener instances, `take/condition/pause/delay` functions, and "child tasks", with an implementation based on [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

The `listenerApi.pause/delay()` functions provide a cancelation-aware way to have the current listener sleep. `pause()` accepts a promise, while `delay` accepts a timeout value. If the listener is canceled while waiting, a `TaskAbortError` will be thrown. In addition, both `take` and `condition` support cancelation interruption as well.

`listenerApi.fork()` can used to launch "child tasks" that can do additional work. These can be waited on to collect their results. An example of this might look like:

```ts
listenerMiddleware.startListening({
  actionCreator: increment,
  effect: async (action, listenerApi) => {
    // Spawn a child task and start it immediately
    const task = listenerApi.fork(async (forkApi) => {
      // Artificially wait a bit inside the child
      await forkApi.delay(5)
      // Complete the child by returning an Ovalue
      return 42
    })

    const result = await task.result
    // Unwrap the child result in the listener
    if (result.status === 'ok') {
      console.log('Child succeeded: ', result.value)
    }
  },
})
```

### Complex Async Workflows

The provided async workflow primitives (`cancelActiveListeners`, `unsuscribe`, `subscribe`, `take`, `condition`, `pause`, `delay`) can be used to implement many of the more complex async workflow capabilities found in the Redux-Saga library. This includes effects such as `throttle`, `debounce`, `takeLatest`, `takeLeading`, and `fork/join`. Some examples:

```js
test('debounce / takeLatest', async () => {
  // Repeated calls cancel previous ones, no work performed
  // until the specified delay elapses without another call
  // NOTE: This is also basically identical to `takeLatest`.
  // Ref: https://redux-saga.js.org/docs/api#debouncems-pattern-saga-args
  // Ref: https://redux-saga.js.org/docs/api#takelatestpattern-saga-args

  listenerMiddleware.startListening({
    actionCreator: increment,
    effect: async (action, listenerApi) => {
      // Cancel any in-progress instances of this listener
      listenerApi.cancelActiveListeners()

      // Delay before starting actual work
      await listenerApi.delay(15)

      // do work here
    },
  })
}

test('takeLeading', async () => {
  // Starts listener on first action, ignores others until task completes
  // Ref: https://redux-saga.js.org/docs/api#takeleadingpattern-saga-args

  listenerMiddleware.startListening({
    actionCreator: increment,
    effect: async (action, listenerApi) => {
      listenerCalls++

      // Stop listening for this action
      listenerApi.unsubscribe()

      // Pretend we're doing expensive work

      // Re-enable the listener
      listenerApi.subscribe()
    },
  })
})

test('canceled', async () => {
  // canceled allows checking if the current task was canceled
  // Ref: https://redux-saga.js.org/docs/api#cancelled

  let canceledAndCaught = false
  let canceledCheck = false

  // Example of canceling prior instances conditionally and checking cancelation
  listenerMiddleware.startListening({
    matcher: isAnyOf(increment, decrement, incrementByAmount),
    effect: async (action, listenerApi) => {
      if (increment.match(action)) {
        // Have this branch wait around to be canceled by the other
        try {
          await listenerApi.delay(10)
        } catch (err) {
          // Can check cancelation based on the exception and its reason
          if (err instanceof TaskAbortError) {
            canceledAndCaught = true
          }
        }
      } else if (incrementByAmount.match(action)) {
        // do a non-cancelation-aware wait
        await delay(15)
        if (listenerApi.signal.aborted) {
          canceledCheck = true
        }
      } else if (decrement.match(action)) {
        listenerApi.cancelActiveListeners()
      }
    },
  })
})
```

### TypeScript Usage

The code is fully typed. However, the `startListening` and `addListener` functions do not know what the store's `RootState` type looks like by default, so `getState()` will return `unknown`.

To fix this, the middleware provides types for defining "pre-typed" versions of those methods, similar to the pattern used for defing pre-typed React-Redux hooks:

```ts
// listenerMiddleware.ts
import {
  createListenerMiddleware,
  addListener,
} from '@rtk-incubator/action-listener-middleware'
import type {
  TypedStartListening,
  TypedAddListener,
} from '@rtk-incubator/action-listener-middleware'

import type { RootState } from './store'

export const listenerMiddleware = createListenerMiddleware()

export const startAppListening =
  listenerMiddleware.startListening as TypedStartListening<RootState>
export const addAppListener = addListener as TypedAddListenern<RootState>
```

Then import and use those pre-typed versions in your components.

## Feedback

Please provide feedback in [RTK discussion #1648: "New experimental "action listener middleware" package"](https://github.com/reduxjs/redux-toolkit/discussions/1648).
