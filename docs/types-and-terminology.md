Types and terminology
=====================

This is a glossary of the core terms in Redux, along with their type signatures. Types are documented using [Flow notation](http://flowtype.org/docs/quick-reference.html#_).

### State

```js
type State = any
```

**State** is a broad term, but in the Redux API it usually refers to the single state value that is managed by the store and returned by `getState()`. It is composed of nested properties and represents the entire state of the Redux store. By convention, the top-level state is an an object or some other key-value collection like a Map, but technically it can be any type.

### Action

```js
type Action = Object
```

An **action** is a payload of information that is used to accumulate state. The application uses actions to send data to the store. By convention, they contain a `type` property which indicates the nature of the action being dispatched.

See also **intermediate actions** below.

### Dispatching function

```js
type Dispatch = (a: Action | IntermediateAction) => any
```

A **dispatching function** (or simply **dispatch function**) is a function that accepts an action or an intermediate action; it then may or may not dispatch one or more actions to the store.

We must distinguish between dispatching functions in general and the base dispatch function provided by the Store interface. The base dispatch function *always* sends an action to the store's reducer, along with the previous state returned by the store, to calculate a new state. However, the application will rarely call the base dispatch function directly — usually, the base dispatch function is wrapped by middleware. See below for more information.

### Reducer

```js
type Reducer<S, A> = (state: S, action: A) => S
```

A **reducer** or **reducing function** is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value. Reducers are not unique to Redux — they are a fundamental concept in functional programming.  Even most non-functional languages, like JavaScript, have a built-in API for reducing. (In JavaScript, it's `Array.prototype.reduce()`.)

In Redux, the accumulated value is the state object, and the values being accumulated are actions. Reducers calculate a new state given the previous state and an action. They must be *pure functions* — functions that return the exact same output for given inputs. They should also be free of side-effects. This is what enables exciting features like hot reloading and time travel.

Reducers are the most important concept in Redux.

### Action creator

```js
type ActionCreator = (...args: any) => Action | IntermediateAction
```

An action creator is, quite simply, a function that creates an action. Do not confuse the two terms — again, an action is a payload of information, and an action creator is a factory that creates them.

### Intermediate action

```js
type IntermediateAction = any
```

An **intermediate action** is a value that is sent to a dispatching function, but is not yet ready for consumption by the reducer; it will be transformed by middleware before being sent to the base `dispatch()` function. Intermediate actions are often asynchronous primitives, like a promise or a thunk, which are not dispatched themselves, but trigger dispatches once an operation has completed.

### Middleware

```js
type Middleware = (methods: { dispatch: Dispatch, getState: () => State }) => (next: Dispatch) => Dispatch;
```

A middleware is a higher-order function that composes a dispatch function to return a new dispatch function.

- The outermost function receives an object of methods which are a subset of the Store interface: `dispatch()` and `getState()`. This gives the inner function access to these methods.
- That returns another function, which receives a dispatch function. This dispatch function is not necessarily the same as the base dispatch function passed to the outermost function — it is the next dispatch function in the middleware chain.
- The innermost function is a dispatch function. It receives an action, and can either call the next dispatch function in the chain, or call the base dispatch function to restart the chain. It can call either function asynchronously and multiple times, or it can call nothing at all. A no-op middleware should synchronously call `next(action)`.

Middleware is composable using function composition.

### Store

```js
type Store = { dispatch: Dispatch, getState: () => State, subscribe: () => Function, getReducer: () => Reducer, replaceReducer: (reducer: Reducer) => void }
```

A store is an object of bound methods to an underlying class instance.

- `dispatch()` is the base dispatch function described above.
- `getState()` returns the current state of the store.
- `subscribe()` registers a function to be called on state changes. It returns an unsubscribe function.
- `getReducer()` and `replaceReducer()` are used to implement hot reloading, and should not be used directly.

### Store-creating function

```js
type CreateStore = (reducer: Function, initialState: any) => Store
```

A store-creating function is a function that creates a Redux store. Like with dispatching function, we must distinguish the base store-creating function, `createStore()`, from store-creating functions that are returned from higher-order stores.

### Higher-order store

```js
type HigherOrderStore = (next: CreateStore) => CreateStore
```

A higher-order store is a higher-order function that composes a store-creating function to return a new store-creating function. This is similar to middleware in that it allows you to alter the store interface in a composable way.

Higher-order stores are much the same concept as higher-order components in React.

Because a store is not an instance, but rather an plain-object collection of bound methods, copies can be easily created and modified without mutating the original store.
