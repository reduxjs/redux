# RTK Incubator - Action Listener Middleware

This package provides an experimental callback-based Redux middleware that we hope to include in Redux Toolkit directly in a future release. We're publishing it as a standalone package to allow users to try it out separately and give us feedback on its API design.

This middleware lets you define callbacks that will run in response to specific actions being dispatched. It's intended to be a lightweight alternative to more widely used Redux async middleware like sagas and observables. While similar to thunks in level of complexity and concept, it can be used to replicate some common saga usage patterns.

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
  // Add the middleware to the store.
  // NOTE Since this can receive actions with functions inside,
  // it should go before the serializability check middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware),
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

The `createActionListenerMiddleware` API provides that structure.

For more background and debate over the use cases and API design, see the original discussion issue and PR:

- [RTK issue #237: Add an action listener middleware](https://github.com/reduxjs/redux-toolkit/issues/237)
- [RTK PR #547: yet another attempt at an action listener middleware](https://github.com/reduxjs/redux-toolkit/pull/547)
- [RTK discussion #1648: New experimental "action listener middleware" package available](https://github.com/reduxjs/redux-toolkit/discussions/1648)

## API Reference

`createActionListenerMiddleware` lets you add listeners by providing a "listener callback" containing additional logic, a way to specify when that callback should run based on dispatched actions or state changes, and whether your callback should run before or after the action is processed by the reducers.

The middleware then gives you access to `dispatch` and `getState` for use in your listener callback's logic. Callbacks can also unsubscribe to stop from being run again in the future.

Listeners can be defined statically by calling `listenerMiddleware.addListener()` during setup, or added and removed dynamically at runtime with special `dispatch(addListenerAction())` and `dispatch(removeListenerAction())` actions.

### `createActionListenerMiddleware: (options?: CreateMiddlewareOptions) => Middleware`

Creates an instance of the middleware, which should then be added to the store via the `middleware` parameter.

Current options are:

- `extra`: an optional "extra argument" that will be injected into the `listenerApi` parameter of each listener. Equivalent to [the "extra argument" in the Redux Thunk middleware](https://redux.js.org/usage/writing-logic-thunks#injecting-config-values-into-thunks).

- `onError`: an optional error handler that gets called with synchronous and async errors raised by `listener` and synchronous errors thrown by `predicate`.

### `listenerMiddleware.addListener(options?: AddListenerOptions) : Unsubscribe`

Statically adds a new listener callback to the middleware.

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

  listener: (action: Action, listenerApi: ListenerApi) => void | Promise<void>

  when?: 'beforeReducer' | 'afterReducer' | 'both'
}
```

You must provide exactly _one_ of the four options for deciding when the listener will run: `type`, `actionCreator`, `matcher`, or `predicate`. Every time an action is dispatched, each listener will be checked to see if it should run based on the current action vs the comparison option provided.

These are all acceptable:

```ts
// 1) Action type string
middleware.addListener({ type: 'todos/todoAdded', listener })
// 2) RTK action creator
middleware.addListener({ actionCreator: todoAdded, listener })
// 3) RTK matcher function
middleware.addListener({ matcher: isAnyOf(todoAdded, todoToggled), listener })
// 4) Listener predicate
middleware.addListener({
  predicate: (action, currentState, previousState) => {
    // return true when the listener should run
  },
  listener,
})
```

The ["matcher" utility functions included in RTK](https://redux-toolkit.js.org/api/matching-utilities) are acceptable as predicates.

The return value is a standard `unsubscribe()` callback that will remove this listener. If you try to add a listener entry but another entry with this exact function reference already exists, no new entry will be added, and the existing `unsubscribe` method will be returned.

The `listener` callback will receive the current action as its first argument, as well as a "listener API" object similar to the "thunk API" object in `createAsyncThunk`.

The listener may be configured to run _before_ an action reaches the reducer, _after_ the reducer, or both, by passing a `when` option when adding the listener. If the `when` option is not provided, the default is 'afterReducer':

```ts
middleware.addListener({
  actionCreator: increment,
  listener,
  when: 'beforeReducer',
})
```

### `listenerMiddleware.removeListener(typeOrActionCreator, listener)`

Removes a given listener. Accepts two arguments:

- `typeOrActionCreator: string | ActionCreator`: the same action type / action creator that was used to add the listener
- `listener: ListenerCallback`: the same listener callback reference that was added originally

Note that matcher-based listeners currently cannot be removed with this approach - you must use the `unsubscribe()` callback that was returned when adding the listener.

### `addListenerAction`

A standard RTK action creator that tells the middleware to dynamically add a new listener at runtime. It accepts exactly the same options as `middleware.addListener()`

Dispatching this action returns an `unsubscribe()` callback from `dispatch`.

```js
// Per above, provide `predicate` or any of the other comparison options
const unsubscribe = store.dispatch(addListenerAction({ predicate, listener }))
```

### `removeListenerAction`

A standard RTK action creator that tells the middleware to remove a listener at runtime. Accepts the same arguments as `middleware.removeListener()`:

```js
store.dispatch(removeListenerAction('todos/todoAdded', listener))
```

### `listenerApi`

The `listenerApi` object is the second argument to each listener callback. It contains several utility functions that may be called anywhere inside the listener's logic. These can be divided into several categories:

#### Store Methods

- `dispatch: Dispatch`: the standard `store.dispatch` method
- `getState: () => State`: the standard `store.getState` method
- `getOriginalState: () => State`: returns the store state as it existed when the action was originally dispatched, _before_ the reducers ran

`dispatch` and `getState` are exactly the same as in a thunk. `getOriginalState` can be used to compare the original state before the listener was started.

#### Middleware Options

- `currentPhase: 'beforeReducer' | 'afterReducer'`: an string indicating when the listener is being called relative to the action processing
- `extra: unknown`: the "extra argument" that was provided as part of the middleware setup, if any

`extra` can be used to inject a value such as an API service layer into the middleware at creation time, and is accessible here.

#### Listener Subscription Management

- `unsubscribe: () => void`: will remove the listener from the middleware
- `subscribe: () => void`: will re-subscribe the listener if it was previously removed, or no-op if currently subscribed
- `cancelPrevious: () => void`: cancels any previously running instances of this same listener. (The cancelation will only have a meaningful effect if the previous instances are paused using one of the `job` APIs, `take`, or `condition` - see "Cancelation and Job Management" in the "Usage" section for more details)

Dynamically unsubscribing and re-subscribing this listener allows for more complex async workflows, such as avoiding duplicate running instances by calling `listenerApi.unsubscribe()` at the start of a listener, or calling `listenerApi.cancelPrevious()` to ensure that only the most recent instance is allowed to complete.

#### Conditional Workflow Execution

- `take: (predicate: ListenerPredicate, timeout?: number) => Promise<[Action, State, State] | null>`: returns a promise that will resolve when the `predicate` returns `true`. The return value is the `[action, currentState, previousState]` combination that the predicate saw as arguments. If a `timeout` is provided and expires if a `timeout` is provided and expires first. the promise resolves to `null`.
- `condition: (predicate: ListenerPredicate, timeout?: number) => Promise<boolean>`: Similar to `take`, but resolves to `true` if the predicate succeeds, and `false` if a `timeout` is provided and expires first. This allows async logic to pause and wait for some condition to occur before continuing. See "Writing Async Workflows" below for details on usage.

These methods provide the ability to write conditional logic based on future dispatched actions and state changes. Both also accept an optional `timeout` in milliseconds.

`take` resolves to a `[action, currentState, previousState]` tuple or `null` if it timed out, whereas `condition` resolves to `true` if it succeeded or `false` if timed out.

`take` is meant for "wait for an action and get its contents", while `condition` is meant for checks like `if (await condition(predicate))`.

Both these methods are cancelation-aware, and will throw a `JobCancelationException` if the listener instance is canceled while paused.

#### Job API

- `job: JobHandle`: a group of functions that allow manipulating the current running listener instance, including cancelation-aware delays, and launching "child Jobs" that can be used to run additional nested logic.

The job implementation is based on https://github.com/ethossoftworks/job-ts . The `JobHandle` type includes:

```ts
interface JobHandle {
  isActive: boolean
  isCompleted: boolean
  isCancelled: boolean
  childCount: number
  ensureActive(): void
  launch<R>(func: JobFunc<R>): Job<R>
  launchAndRun<R>(func: JobFunc<R>): Promise<Outcome<R>>
  pause<R>(func: Promise<R>): Promise<R>
  delay(milliseconds: number): Promise<void>
  cancel(reason?: JobCancellationException): void
  cancelChildren(
    reason?: JobCancellationException,
    skipChildren?: JobHandle[]
  ): void
}
```

`pause` and `delay` are both cancelation-aware. If the current listener is canceled, they will throw a `JobCancelationException` if the listener instance is canceled while paused.

Child jobs can be launched, and waited on to collect their return values.

Note that the jobs API relies on a functional-style async result abstraction called an `Outcome`, which wraps promise results.

This API will be documented more as the middleware implementation is finalized. For now, you can see the existing third-party library docs here:

- https://github.com/ethossoftworks/job-ts/blob/main/docs/api.md
- https://github.com/ethossoftworks/outcome-ts#usage

## Usage Guide

### Overall Purpose

This middleware lets you run additional logic when some action is dispatched, as a lighter-weight alternative to middleware like sagas and observables that have both a heavy runtime bundle cost and a large conceptual overhead.

This middleware is not intended to handle all possible use cases. Like thunks, it provides you with a basic set of primitives (including access to `dispatch` and `getState`), and gives you freedom to write any sync or async logic you want. This is both a strength (you can do anything!) and a weakness (you can do anything, with no guard rails!).

As of v0.4.0, the middleware does include several async workflow primitives that are sufficient to write equivalents to many Redux-Saga effects operators like `takeLatest`, `takeLeading`, and `debounce`.

### Standard Usage Patterns

The most common expected usage is "run some logic after a given action was dispatched". For example, you could set up a simple analytics tracker by looking for certain actions and sending extracted data to the server, including pulling user details from the store:

```js
middleware.addListener({
  matcher: isAnyOf(action1, action2, action3),
  listener: (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())

    const { specialData } = action.meta

    analyticsApi.trackUsage(action.type, user, specialData)
  },
})
```

You could also implement a generic API fetching capability, where the UI dispatches a plain action describing the type of resource to be requested, and the middleware automatically fetches it and dispatches a result action:

```js
middleware.addListener({
  actionCreator: resourceRequested,
  listener: async (action, listenerApi) => {
    const { name, args } = action.payload
    listenerApi.dispatch(resourceLoading())

    const res = await serverApi.fetch(`/api/${name}`, ...args)
    listenerApi.dispatch(resourceLoaded(res.data))
  },
})
```

The `listenerApi.unsubscribe` method may be used at any time, and will remove the listener from handling any future actions. As an example, you could create a one-shot listener by unconditionally calling `unsubscribe()` in the body - it would run the first time the relevant action is seen, and then immediately stop and not handle any future actions.

### Writing Async Workflows with Conditions

One of the great strengths of both sagas and observables is their support for complex async workflows, including stopping and starting behavior based on specific dispatched actions. However, the weakness is that both require mastering a complex API with many unique operators (effects methods like `call()` and `fork()` for sagas, RxJS operators for observables), and both add a significant amount to application bundle size.

While this middleware is _not_ at all meant to fully replace those, it has some ability to implement long-running async workflows as well.

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

### Cancelation and Job Management

As of 0.4.0, the middleware now uses a `Job` abstraction to help manage cancelation of existing listener instances. The `Job` implementation is based on https://github.com/ethossoftworks/job-ts .

Each running listener instance is wrapped in a `Job` that provides cancelation awareness. A running `Job` instance has a `JobHandle` object that can be used to control it:

```ts
interface JobHandle {
  isActive: boolean
  isCompleted: boolean
  isCancelled: boolean
  childCount: number
  ensureActive(): void
  launch<R>(func: JobFunc<R>): Job<R>
  launchAndRun<R>(func: JobFunc<R>): Promise<Outcome<R>>
  pause<R>(func: Promise<R>): Promise<R>
  delay(milliseconds: number): Promise<void>
  cancel(reason?: JobCancellationException): void
  cancelChildren(
    reason?: JobCancellationException,
    skipChildren?: JobHandle[]
  ): void
}
```

`listenerApi.job` exposes that `JobHandle` for the current listener instance so it can be accessed by the listener logic.

Full documentation of `JobHandle` can currently be viewed at https://github.com/ethossoftworks/job-ts/blob/main/docs/api.md . Note that this API also uses a custom functional-style wrapper around async results called an `Outcome`: https://github.com/ethossoftworks/outcome-ts .

The `listenerApi.job.pause/delay()` functions provide a cancelation-aware way to have the current listener sleep. `pause()` accepts a promise, while `delay` accepts a timeout value. If the listener is canceled while waiting, a `JobCancelationException` will be thrown.

This can also be used to launch "child jobs" that can do additional work. These can be waited on to collect their results. An example of this might look like:

```ts
middleware.addListener({
  actionCreator: increment,
  listener: async (action, listenerApi) => {
    // Spawn a child job and start it immediately
    const childJobPromise = listenerApi.job.launchAndRun(async (jobHandle) => {
      // Artificially wait a bit inside the child
      await jobHandle.delay(5)
      // Complete the child by returning an Outcome-wrapped value
      return Outcome.ok(42)
    })

    const result = await childJobPromise
    // Unwrap the child result in the listener
    if (result.isOk()) {
      console.log('Child succeeded: ', result.value)
    }
  },
})
```

### Complex Async Workflows

The provided async workflow primitives (`cancelPrevious`, `unsuscribe`, `subscribe`, `take`, `condition`, `job.pause`, `job.delay`) can be used to implement many of the more complex async workflow capabilities found in the Redux-Saga library. This includes effects such as `throttle`, `debounce`, `takeLatest`, `takeLeading`, and `fork/join`. Some examples:

```js
test('debounce / takeLatest', async () => {
  // Repeated calls cancel previous ones, no work performed
  // until the specified delay elapses without another call
  // NOTE: This is also basically identical to `takeLatest`.
  // Ref: https://redux-saga.js.org/docs/api#debouncems-pattern-saga-args
  // Ref: https://redux-saga.js.org/docs/api#takelatestpattern-saga-args

  addListener({
    actionCreator: increment,
    listener: async (action, listenerApi) => {
      // Cancel any in-progress instances of this listener
      listenerApi.cancelPrevious()

      // Delay before starting actual work
      await listenerApi.job.delay(15)

      // do work here
    },
  })
}

test('takeLeading', async () => {
  // Starts listener on first action, ignores others until task completes
  // Ref: https://redux-saga.js.org/docs/api#takeleadingpattern-saga-args

  addListener({
    actionCreator: increment,
    listener: async (action, listenerApi) => {
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
  addListener({
    matcher: isAnyOf(increment, decrement, incrementByAmount),
    listener: async (action, listenerApi) => {
      if (increment.match(action)) {
        // Have this branch wait around to be canceled by the other
        try {
          await listenerApi.job.delay(10)
        } catch (err) {
          // Can check cancelation based on the exception and its reason
          if (err instanceof JobCancellationException) {
            canceledAndCaught = true
          }
        }
      } else if (incrementByAmount.match(action)) {
        // do a non-cancelation-aware wait
        await sleep(15)
        // Or can check based on `job.isCancelled`
        if (listenerApi.job.isCancelled) {
          canceledCheck = true
        }
      } else if (decrement.match(action)) {
        listenerApi.cancelPrevious()
      }
    },
  })
})
```

### TypeScript Usage

The code is fully typed. However, the `middleware.addListener` and `addListenerAction` functions do not know what the store's `RootState` type looks like by default, so `getState()` will return `unknown`.

To fix this, the middleware provides types for defining "pre-typed" versions of those methods, similar to the pattern used for defing pre-typed React-Redux hooks:

```ts
// middleware.ts
import {
  createActionListener,
  addListenerAction,
  TypedAddListener,
  TypedAddListenerAction,
} from '@rtk-incubator/action-listener-middleware'

import { RootState } from './store'

export const listenerMiddleware = createActionListenerMiddleware()

export const addAppListener =
  listenerMiddleware.addListener as TypedAddListener<RootState>
export const addAppListenerAction =
  addListenerAction as TypedAddListenerAction<RootState>
```

Then import and use those pre-typed versions in your components.

## Feedback

Please provide feedback in [RTK discussion #1648: "New experimental "action listener middleware" package"](https://github.com/reduxjs/redux-toolkit/discussions/1648).
