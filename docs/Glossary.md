# Glossary

This is a glossary of the core terms in Redux, along with their type signatures. The types are documented using [Flow notation](http://flowtype.org/docs/quick-reference.html).

## State

```js
type State = any
```

*State* (also called the *state tree*) is a broad term, but in the Redux API it usually refers to the single state value that is managed by the store and returned by [`getState()`](api/Store.md#getState). It represents the entire state of a Redux application, which is often a deeply nested object.

By convention, the top-level state is an object or some other key-value collection like a Map, but technically it can be any type. Still, you should do your best to keep the state serializable. Don't put anything inside it that you can't easily turn into JSON.

## Action

```js
type Action = Object
```

An *action* is a plain object that represents an intention to change the state. Actions are the only way to get data into the store. Any data, whether from UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions.

Actions must have a `type` field that indicates the type of action being performed. Types can be defined as constants and imported from another module. It's better to use strings for `type` than [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) because strings are serializable.

Other than `type`, the structure of an action object is really up to you. If you're interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions should be constructed.

See also [async action](#async-action) below.

## Reducer

```js
type Reducer<S, A> = (state: S, action: A) => S
```

A *reducer* (also called a *reducing function*) is a function that accepts an accumulation and a value and returns a new accumulation. They are used to reduce a collection of values down to a single value.

Reducers are not unique to Redux—they are a fundamental concept in functional programming.  Even most non-functional languages, like JavaScript, have a built-in API for reducing. In JavaScript, it's [`Array.prototype.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce).

In Redux, the accumulated value is the state object, and the values being accumulated are actions. Reducers calculate a new state given the previous state and an action. They must be *pure functions*—functions that return the exact same output for given inputs. They should also be free of side-effects. This is what enables exciting features like hot reloading and time travel.

Reducers are the most important concept in Redux.

*Do not put API calls into reducers.*

## Dispatching Function

```js
type BaseDispatch = (a: Action) => Action
type Dispatch = (a: Action | AsyncAction) => any
```

A *dispatching function* (or simply *dispatch function*) is a function that accepts an action or an [async action](#async-action); it then may or may not dispatch one or more actions to the store.

We must distinguish between dispatching functions in general and the base [`dispatch`](api/Store.md#dispatch) function provided by the store instance without any middleware.

The base dispatch function *always* synchronously sends an action to the store's reducer, along with the previous state returned by the store, to calculate a new state. It expects actions to be plain objects ready to be consumed by the reducer.

[Middleware](#middleware) wraps the base dispatch function. It allows the dispatch function to handle [async actions](#async-action) in addition to actions. Middleware may transform, delay, ignore, or otherwise interpret actions or async actions before passing them to the next middleware. See below for more information.

## Action Creator

```js
type ActionCreator = (...args: any) => Action | AsyncAction
```

An *action creator* is, quite simply, a function that creates an action. Do not confuse the two terms—again, an action is a payload of information, and an action creator is a factory that creates an action.

Calling an action creator only produces an action, but does not dispatch it. You need to call the store's [`dispatch`](api/Store.md#dispatch) function to actually cause the mutation. Sometimes we say *bound action creators* to mean functions that call an action creator and immediately dispatch its result to a specific store instance.

If an action creator needs to read the current state, perform an API call, or cause a side effect, like a routing transition, it should return an [async action](#async-action) instead of an action.

## Async Action

```js
type AsyncAction = any
```

An *async action* is a value that is sent to a dispatching function, but is not yet ready for consumption by the reducer. It will be transformed by [middleware](#middleware) into an action (or a series of actions) before being sent to the base [`dispatch()`](api/Store.md#dispatch) function. Async actions may have different types, depending on the middleware you use. They are often asynchronous primitives, like a Promise or a thunk, which are not passed to the reducer immediately, but trigger action dispatches once an operation has completed.

## Middleware

```js
type MiddlewareAPI = { dispatch: Dispatch, getState: () => State }
type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch
```

A middleware is a higher-order function that composes a [dispatch function](#dispatching-function) to return a new dispatch function. It often turns [async actions](#async-action) into actions.

Middleware is composable using function composition. It is useful for logging actions, performing side effects like routing, or turning an asynchronous API call into a series of synchronous actions.

See [`applyMiddleware(...middlewares)`](./api/applyMiddleware.md) for a detailed look at middleware.

## Store

```js
type Store = {
  dispatch: Dispatch
  getState: () => State
  subscribe: (listener: () => void) => () => void
  replaceReducer: (reducer: Reducer) => void
}
```

A store is an object that holds the application's state tree.  
There should only be a single store in a Redux app, as the composition happens on the reducer level.

- [`dispatch(action)`](api/Store.md#dispatch) is the base dispatch function described above.
- [`getState()`](api/Store.md#getState) returns the current state of the store.
- [`subscribe(listener)`](api/Store.md#subscribe) registers a function to be called on state changes.
- [`replaceReducer(nextReducer)`](api/Store.md#replaceReducer) can be used to implement hot reloading and code splitting. Most likely you won't use it.

See the complete [store API reference](api/Store.md#dispatch) for more details.

## Store creator

```js
type StoreCreator = (reducer: Reducer, preloadedState: ?State) => Store
```

A store creator is a function that creates a Redux store. Like with dispatching function, we must distinguish the base store creator, [`createStore(reducer, preloadedState)`](api/createStore.md) exported from the Redux package, from store creators that are returned from the store enhancers.

## Store enhancer

```js
type StoreEnhancer = (next: StoreCreator) => StoreCreator
```

A store enhancer is a higher-order function that composes a store creator to return a new, enhanced store creator. This is similar to middleware in that it allows you to alter the store interface in a composable way.

Store enhancers are much the same concept as higher-order components in React, which are also occasionally called “component enhancers”.

Because a store is not an instance, but rather a plain-object collection of functions, copies can be easily created and modified without mutating the original store. There is an example in [`compose`](api/compose.md) documentation demonstrating that.

Most likely you'll never write a store enhancer, but you may use the one provided by the [developer tools](https://github.com/gaearon/redux-devtools). It is what makes time travel possible without the app being aware it is happening. Amusingly, the [Redux middleware implementation](api/applyMiddleware.md) is itself a store enhancer.
