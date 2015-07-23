Glossary
=====================

This is a glossary of the core terms in Redux, along with their type signatures.  
Types are documented using [Flow notation](http://flowtype.org/docs/quick-reference.html#_).

### State

```js
type State = any;
```

**State** is a broad term, but in the Redux API it usually refers to the single state value that is managed by the store and returned by `getState()`. It represents the entire state of a Redux application, which is often a deeply nested object. By convention, the top-level state is an object or some other key-value collection like a Map, but technically it can be any type.

### Action

```js
type Action = Object;
```

An **action** is a plain object that represents an intention to change the state. The only way to change the state inside a store is by dispatching an action. By convention, actions contain a string `type` property which indicates the nature of the action being dispatched. It is advisable that your actions are serializable, so that you can [record and replay](../Recipes/Recording and Replaying.md) user sessions. This is why we recommend to describe action types as string constants instead of Symbols.

See also **intermediate actions** below.

### Dispatching function

```js
type Dispatch = (a: Action | IntermediateAction) => any;
```

A **dispatching function** (or simply **dispatch function**) is a function that accepts an action or an intermediate action; it then may or may not dispatch one or more actions to the store.

We must distinguish between dispatching functions in general and the base dispatch function provided by the store instance without the middleware. The base dispatch function *always* synchronously sends an action to the store’s reducer, along with the previous state returned by the store, to calculate a new state. It expects actions to be plain objects ready to be consumed by the reducer.

A middleware wraps the base dispatch function, potentially transforming, delaying, ignoring, or otherwise interpreting the intermediate actions. See below for more information.

### Reducer

```js
type Reducer<S, A> = (state: S, action: A) => S;
```

A **reducer** or **reducing function** is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value. Reducers are not unique to Redux—they are a fundamental concept in functional programming.  Even most non-functional languages, like JavaScript, have a built-in API for reducing. (In JavaScript, it's [`Array.prototype.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce).)

In Redux, the accumulated value is the state object, and the values being accumulated are actions. Reducers calculate a new state given the previous state and an action. They must be *pure functions*—functions that return the exact same output for given inputs. They should also be free of side-effects. This is what enables exciting features like [hot reloading](../Recipes/Hot Reloading.md) and [time travel](../Recipes/Time Travel.md).

Reducers are the most important concept in Redux.

### Action creator

```js
type ActionCreator = (...args: any) => Action | IntermediateAction;
```

An **action creator** is, quite simply, a function that creates an action. Do not confuse the two terms—again, an action is a payload of information, and an action creator is a factory that creates them.

Calling an action creator only produces an action, but does not dispatch it. You need to call the store’s `dispatch` function to actually cause the mutation. Sometimes we say **bound action creators** to mean functions that call an action creator and immediately dispatch its result to a specific store instance.

### Intermediate action

```js
type IntermediateAction = any;
```

An **intermediate action** is a value that is sent to a dispatching function, but is not yet ready for consumption by the reducer; it will be transformed by middleware before being sent to the base `dispatch()` function. Intermediate actions are often asynchronous primitives, like a promise or a thunk, which are not dispatched themselves, but trigger dispatches once an operation has completed.

### Middleware

```js
type MiddlewareAPI = { dispatch: Dispatch, getState: () => State };
type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch;
```

A middleware is a higher-order function that composes a dispatch function to return a new dispatch function.

* The outermost function receives an object of methods which are a subset of the Store interface: `dispatch()` and `getState()`. This gives the inner function access to these methods.
* That returns another function, which receives a dispatch function. This dispatch function is not necessarily the same as the base dispatch function passed to the outermost function — it is the next dispatch function in the middleware chain.
* The innermost function is a dispatch function. It receives an action, and can either call the next dispatch function in the chain, or call the base dispatch function to restart the chain. It can call either function asynchronously and multiple times, or it can call nothing at all. A no-op middleware should synchronously call `next(action)`.

Middleware is composable using function composition. It is useful for [logging actions](../Recipes/Logging.md), performing side effects like [routing](../Recipes/React Router.md), or turning an [asynchronous API call](https://github.com/gaearon/redux/blob/rewrite-docs/docs/Recipes/Asynchronous%20Data%20Fetching.md) into a series of synchronous actions.

### Store

```js
type Store = {
  dispatch: Dispatch;
  getState: () => State;
  subscribe: (listener: () => void) => () => void;
  getReducer: () => Reducer;
  replaceReducer: (reducer: Reducer) => void;
};
```

A store is an object that holds the application’s state tree.  
There should only be a single store in a Redux app, as the composition happens on the reducer level.

- `dispatch()` is the base dispatch function described above.
- `getState()` returns the current state of the store.
- `subscribe()` registers a function to be called on state changes. It returns an unsubscribe function.
- `getReducer()` and `replaceReducer()` can be used to implement hot reloading and code splitting. Most likely you won’t use them.

### Store creator

```js
type StoreCreator = (reducer: Reducer, initialState: any) => Store;
```

A store creator is a function that creates a Redux store. Like with dispatching function, we must distinguish the base store creator, `createStore()` exported from the Redux package, from store creators that are returned from the store enhancers.

### Store enhancer

```js
type StoreEnhancer = (next: StoreCreator) => StoreCreator;
```

A store enhancer is a higher-order function that composes a store creator to return a new, enhanced store creator. This is similar to middleware in that it allows you to alter the store interface in a composable way.

Store enhancers are much the same concept as higher-order components in React, which are also occasionally called “component enhancers”.

Because a store is not an instance, but rather a plain-object collection of functions, copies can be easily created and modified without mutating the original store.

Most likely you’ll never write a store enhancer, but you may use the one provided by the [developer tools](../Recipes/Developer Tools.md). It is what makes [time travel](../Recipes/Time Travel.md) possible without the app being aware it is happening.
