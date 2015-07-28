# Store

A store holds the whole state tree of your application.  
The only way to change the state inside it is to dispatch an action on it.  

A store is not a class. It’s just an object with a few methods on it.  
To create it, pass your root reducer function to [`createStore`](createStore.md).

>##### A Note for Flux Users

>If you’re coming from Flux, there is a single important difference you need to understand. Redux doesn’t have a Dispatcher or support many stores. **Instead, there is just a single store with a single root reducer function.** As your app grows, instead of adding stores, you split the root reducer into smaller reducers independently operating on the different parts of the state tree. You can use a helper like [`combineReducers`](combineReducers.md) to combine them. This is similar to how there is just one root component in a React app, but it is composed out of many small components.

### Store Methods

- [`getState()`](#getState)
- [`dispatch(action)`](#dispatch)
- [`subscribe(listener)`](#subscribe)
- [`getReducer()`](#getReducer)
- [`replaceReducer(nextReducer)`](#replaceReducer)

## Store Methods

### <a id='getState'></a>[`getState()`](#getState)

Returns the current state tree of your application.  
It corresponds to the last value returned by the store’s reducer.

#### Returns

*(any)*: The current state tree of your application. Its shape depends on what your reducer returns.

<hr>

### <a id='dispatch'></a>[`dispatch(action)`](#dispatch)

Dispatches an action. This is the only way to trigger a state change.

The store’s reducer function will be called with the current [`getState()`](#getState) result and the given `action` synchronously. Its return value will returned from [`getState()`](#getState) from now on, and the change listeners will immediately be notified.

#### Arguments

1. `action` (*Object*<sup>†</sup>): A plain object describing the change that makes sense for your application. Actions are the only way to get data into the store, so any data, whether from the UI events, network callbacks, or other sources such as WebSockets needs to eventually be dispatched as actions. By convention, actions should have a `type` field that indicates the type of action being performed. Types can be defined as constants and imported from another module. It’s better to use strings for `type` than [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) because strings are serializable. Other than `type`, the structure of an action object is really up to you. If you’re interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions should be constructed.

#### Returns

(Object<sup>†</sup>): The dispatched action.

#### Notes

<sup>†</sup> [Applying the middleware](applyMiddleware.md) may allow you to dispatch something other than plain objects. For example, there is a middleware that lets you dispatch a [Promise](https://github.com/acdlite/redux-promise), or a [thunk](https://github.com/gaearon/redux-thunk). The return value of the `dispatch` method can also be altered by the middleware. For example, it might return a Promise so the caller can wait for completion. This is especially useful for universal apps that run on the server, because this lets you wait for the `dispatch` calls to finish before rendering the app.

#### Example

```js
import { createStore } from 'redux';
let store = createStore(todos, ['Use Redux']);

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  };
}

store.dispatch(addTodo('Read the docs'));
store.dispatch(addTodo('Read about the middleware'));
```

#### Dispatch Asynchronous Actions with Middleware

The “vanilla” store implementation you get by calling [`createStore`](createStore.md) only supports plain object actions and hands them immediately to the reducer. However, if you wrap [`createStore`](createStore.md) with [`applyMiddleware`](applyMiddleware.md), the middleware can interpret actions differently, and provide support for asynchronous primitives like promises, observables, thunks, or anything else.

The middleware is created by the community and does not ship with Redux by default. You need to explicitly install packages like [redux-thunk](https://github.com/gaearon/redux-thunk) or [redux-promise](https://github.com/acdlite/redux-promise) to use it. You may also create your own middleware. Below is an example of using `redux-thunk` for dispatching actions asynchronously and waiting for them to complete.

```js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

let createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
let store = createStoreWithMiddleware(todos);

function addTodoAsync(text) {

  // When redux-thunk middleware sees an attempt to dispatch a function,
  // it inverts the control by giving `dispatch` to it.

  return function (dispatch) {

    // Dispatch an initial action so we can show a spinner
    // or perform an optimistic update.

    dispatch({
      type: 'ADD_TODO',
      readyState: 'request',
      text
    });

    // We can return a promise, and
    // redux-thunk will return it to the caller.

    return postJSON('/api/todos', { text }).then(
      response => dispatch({
        type: 'ADD_TODO',
        readyState: 'success',
        response
      }),
      error => dispatch({
        type: 'ADD_TODO',
        readyState: 'failure',
        error
      })
    );
  };
}

// Delay server rendering until
// the initial actions complete.

Promise.all([
  store.dispatch(addTodoAsync('Learn to use middleware')),
  store.dispatch(addTodoAsync('Write your own middleware'))
]).then(() => {
  response.send(React.renderToString(<MyApp store={store} />));
});
```

If many action creators in your app begin to look like this and you want to reduce the amount of boilerplate, consider using [redux-promise](https://github.com/acdlite/redux-promise) together with [redux-actions](https://github.com/acdlite/redux-actions), or even [writing your own async middleware](https://github.com/gaearon/redux/issues/99).

<hr>

### <a id='subscribe'></a>[`subscribe(listener)`](#subscribe)

Adds a change listener. It will be called any time an action is dispatched, and some part of the state tree may potentially have changed. You may then call [`getState()`](#getState) to read the current state tree inside the callback.

It is a low-level API. Most likely, instead of using it directly, you’ll use React (or other) bindings. If you feel that the callback needs to be invoked with the current state, you might want to [convert the store to an Observable or write a custom `observeStore` utility instead](https://github.com/gaearon/redux/issues/303#issuecomment-125184409).

To unsubscribe the change listener, invoke the function returned by `subscribe`.

#### Arguments

1. `listener` (*Function*): The callback to be invoked any time an action has been dispatched, and the state tree might have changed. You may call [`getState()`](#getState) inside this callback to read the current state tree. It is reasonable to expect that the store’s reducer is a pure function, so you may compare references to some deep path in the state tree to learn whether its value has changed.

##### Returns

(*Function*): A function that unsubscribes the change listener.

##### Example

```js
function select(state) {
  return state.some.deep.property;
}

let currentValue;
function handleChange() {
  let previousValue = currentValue;
  currentValue = select(store.getState());
  
  if (previousValue !== currentValue) {
    console.log('Some deep nested property changed from', previousValue, 'to', currentValue);
  }
}

let unsubscribe = store.subscribe(handleChange);
handleChange();
```

<hr>

### <a id='getReducer'></a>[`getReducer()`](#getReducer)

Returns the reducer currently used by the store to calculate the state.

It is an advanced API. You might only need this if you implement a hot reloading mechanism for Redux.

#### Returns

(*Function*): The store’s current reducer.

<hr>

### <a id='replaceReducer'></a>[`replaceReducer(nextReducer)`](#replaceReducer)

Replaces the reducer currently used by the store to calculate the state.

It is an advanced API. You might need this if your app implements code splitting, and you want to load some of the reducers dynamically. You might also need this if you implement a hot reloading mechanism for Redux.

#### Arguments

1. `reducer` (*Function*) The next reducer for the store to use.
