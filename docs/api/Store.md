# Store

A store holds the whole [state tree](../Glossary.md#state) of your application.  
The only way to change the state inside it is to dispatch an [action](../Glossary.md#action) on it.  

A store is not a class. It's just an object with a few methods on it.  
To create it, pass your root [reducing function](../Glossary.md#reducer) to [`createStore`](createStore.md).

>##### A Note for Flux Users

>If you're coming from Flux, there is a single important difference you need to understand. Redux doesn't have a Dispatcher or support many stores. **Instead, there is just a single store with a single root [reducing function](../Glossary.md#reducer).** As your app grows, instead of adding stores, you split the root reducer into smaller reducers independently operating on the different parts of the state tree. You can use a helper like [`combineReducers`](combineReducers.md) to combine them. This is similar to how there is just one root component in a React app, but it is composed out of many small components.

### Store Methods

- [`getState()`](#getState)
- [`dispatch(action)`](#dispatch)
- [`subscribe(listener)`](#subscribe)
- [`replaceReducer(nextReducer)`](#replaceReducer)

## Store Methods

### <a id='getState'></a>[`getState()`](#getState)

Returns the current state tree of your application.  
It is equal to the last value returned by the store's reducer.

#### Returns

*(any)*: The current state tree of your application.

<hr>

### <a id='dispatch'></a>[`dispatch(action)`](#dispatch)

Dispatches an action. This is the only way to trigger a state change.

The store's reducing function will be called with the current [`getState()`](#getState) result and the given `action` synchronously. Its return value will be considered the next state. It will be returned from [`getState()`](#getState) from now on, and the change listeners will immediately be notified.

>##### A Note for Flux Users
>If you attempt to call `dispatch` from inside the [reducer](../Glossary.md#reducer), it will throw with an error saying “Reducers may not dispatch actions.” This is similar to “Cannot dispatch in a middle of dispatch” error in Flux, but doesn't cause the problems associated with it. In Flux, a dispatch is forbidden while Stores are handling the action and emitting updates. This is unfortunate because it makes it impossible to dispatch actions from component lifecycle hooks or other benign places.

>In Redux, subscriptions are called after the root reducer has returned the new state, so you *may* dispatch in the subscription listeners. You are only disallowed to dispatch inside the reducers because they must have no side effects. If you want to cause a side effect in response to an action, the right place to do this is in the potentially async [action creator](../Glossary.md#action-creator).

#### Arguments

1. `action` (*Object*<sup>†</sup>): A plain object describing the change that makes sense for your application. Actions are the only way to get data into the store, so any data, whether from the UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions. Actions must have a `type` field that indicates the type of action being performed. Types can be defined as constants and imported from another module. It's better to use strings for `type` than [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) because strings are serializable. Other than `type`, the structure of an action object is really up to you. If you're interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions could be constructed.

#### Returns

(Object<sup>†</sup>): The dispatched action (see notes).

#### Notes

<sup>†</sup> The “vanilla” store implementation you get by calling [`createStore`](createStore.md) only supports plain object actions and hands them immediately to the reducer.

However, if you wrap [`createStore`](createStore.md) with [`applyMiddleware`](applyMiddleware.md), the middleware can interpret actions differently, and provide support for dispatching [async actions](../Glossary.md#async-action). Async actions are usually asynchronous primitives like Promises, Observables, or thunks.

Middleware is created by the community and does not ship with Redux by default. You need to explicitly install packages like [redux-thunk](https://github.com/gaearon/redux-thunk) or [redux-promise](https://github.com/acdlite/redux-promise) to use it. You may also create your own middleware.

To learn how to describe asynchronous API calls, read the current state inside action creators, perform side effects, or chain them to execute in a sequence, see the examples for [`applyMiddleware`](applyMiddleware.md).

#### Example

```js
import { createStore } from 'redux'
const store = createStore(todos, ['Use Redux'])

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

store.dispatch(addTodo('Read the docs'))
store.dispatch(addTodo('Read about the middleware'))
```

<hr>

### <a id='subscribe'></a>[`subscribe(listener)`](#subscribe)

Adds a change listener. It will be called any time an action is dispatched, and some part of the state tree may potentially have changed. You may then call [`getState()`](#getState) to read the current state tree inside the callback.

You may call [`dispatch()`](#dispatch) from a change listener, with the following caveats:

1. The listener should only call [`dispatch()`](#dispatch) either in response to user actions or under specific conditions (e. g. dispatching an action when the store has a specific field). Calling [`dispatch()`](#dispatch) without any conditions is technically possible, however it leads to an infinite loop as every [`dispatch()`](#dispatch) call usually triggers the listener again.

2. The subscriptions are snapshotted just before every [`dispatch()`](#dispatch) call. If you subscribe or unsubscribe while the listeners are being invoked, this will not have any effect on the [`dispatch()`](#dispatch) that is currently in progress. However, the next [`dispatch()`](#dispatch) call, whether nested or not, will use a more recent snapshot of the subscription list.

3. The listener should not expect to see all state changes, as the state might have been updated multiple times during a nested [`dispatch()`](#dispatch) before the listener is called. It is, however, guaranteed that all subscribers registered before the [`dispatch()`](#dispatch) started will be called with the latest state by the time it exits.

It is a low-level API. Most likely, instead of using it directly, you'll use React (or other) bindings. If you commonly use the callback as a hook to react to state changes, you might want to [write a custom `observeStore` utility](https://github.com/reduxjs/redux/issues/303#issuecomment-125184409). The `Store` is also an [`Observable`](https://github.com/zenparsing/es-observable), so you can `subscribe` to changes with libraries like [RxJS](https://github.com/ReactiveX/RxJS). 

To unsubscribe the change listener, invoke the function returned by `subscribe`.

#### Arguments

1. `listener` (*Function*): The callback to be invoked any time an action has been dispatched, and the state tree might have changed. You may call [`getState()`](#getState) inside this callback to read the current state tree. It is reasonable to expect that the store's reducer is a pure function, so you may compare references to some deep path in the state tree to learn whether its value has changed.

##### Returns

(*Function*): A function that unsubscribes the change listener.

##### Example

```js
function select(state) {
  return state.some.deep.property
}

let currentValue
function handleChange() {
  let previousValue = currentValue
  currentValue = select(store.getState())

  if (previousValue !== currentValue) {
    console.log(
      'Some deep nested property changed from',
      previousValue,
      'to',
      currentValue
    )
  }
}

const unsubscribe = store.subscribe(handleChange)
unsubscribe()
```

<hr>

### <a id='replaceReducer'></a>[`replaceReducer(nextReducer)`](#replaceReducer)

Replaces the reducer currently used by the store to calculate the state.

It is an advanced API. You might need this if your app implements code splitting, and you want to load some of the reducers dynamically. You might also need this if you implement a hot reloading mechanism for Redux.

#### Arguments

1. `nextReducer` (*Function*) The next reducer for the store to use.
