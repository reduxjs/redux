API
=====================

>**All type signatures and terms in this document are mentioned in the [Glossary](./Glossary.md).**

Redux API surface is tiny. Instead of being a monolithic framework, Redux defines a set of contracts for you to implement (such as [reducers](./Glossary.md#reducer)) and provides a few helper functions to tie these contracts together.

This file documents the complete Redux API. Keep in mind that Redux is only concerned with managing the state. In a real app, you’ll want to use [UI bindings](../Recipes/Connecting UI.md) to the view library of your choice, such as [React](../Recipes/React.md).

Every function described below is a top-level export. You can access them like this:

```js
// ES6
import { createStore } from 'redux';

// ES5 (CommonJS)
var createStore = require('redux').createStore;

// ES5 (UMD build)
var createStore = Redux.createStore;
```

#### Table of Contents

* [createStore(reducer: Reducer, initialState: any): Store](#createstorereducer-reducer-initialstate-any-store)
* [Store API](#store-api)
  * [getState(): any](#getstate-any)
  * [dispatch(action: Action | IntermediateAction): any](#dispatchaction-action--intermediateaction-any)
  * [subscribe(listener: Function): Function](#subscribelistener-function-function)
  * [getReducer(): Reducer](#getreducer-reducer)
  * [replaceReducer(nextReducer: Reducer): void](#replacereducernextreducer-reducer-void)
* [combineReducers(reducers: Object): Reducer](#combinereducersreducers-object-reducer)
* [applyMiddleware(...middlewares: Array<Middleware>): StoreEnhancer](#applymiddlewaremiddlewares-arraymiddleware-storeenhancer)
* [bindActionCreators(actionCreators: Object, dispatch: Function): Object](#bindactioncreatorsactioncreators-object-dispatch-function-object)
* [compose(...funcs: Array<Function>): Function](#composefuncs-arrayfunction-function)

=====================

### `createStore(reducer: Reducer, initialState: any): Store`

Creates and returns a Redux store that holds the state tree.  
The only way to change the data in the store is to call `dispatch()` on it.  

There should only be a single store in your app.

##### Parameters

* `reducer: Reducer`: Required. A [reducer](./Glossary.md#reducer) function that returns the next state tree, given
the current state tree and the action to handle.

* `initialState: any`: The initial [state](./Glossary.md#state). You may optionally specify it
to hydrate the state from the server in universal apps, or to restore a
previously serialized user session. If you use `combineReducers` to produce the root reducer function, this must be an object with the same shape as `combineReducers` keys.

##### Example

```js
function todos(state = [], action) {
  switch (action.type) {
  case 'ADD_TODO':
    return state.concat([ action.text ]);
  default:
    return state;
  }
}

let store = createStore(todos, ['Use Redux']);
store.dispatch({ type: 'ADD_TODO', text: 'Read the docs' });

console.log(store.getState());
// ['Use Redux', 'Read the docs']
```

##### Notes

**There should only be a single store in your app.** To specify how different
parts of the state tree respond to actions, you may combine several reducers
into a single reducer function by using `combineReducers`.

In [universal apps](../Recipes/Universal Apps.md), you’ll want to create a store
instance per request so that they are isolated, and dispatch a few actions
to fetch the data before rendering the app.

=====================

### Store API

Once you obtain a Redux [store](../Glossary.md#store) from `createStore` to manage your state,
you may call these methods on it.

#### `getState(): any`

Returns the current state tree of your application.

#### `dispatch(action: Action | IntermediateAction): any`

Dispatches an action. It is the only way to trigger a state change.

The `reducer` function the store was created with will be called with the
current state tree and the given `action`. Its return value will
be considered the next state of the tree, and the change listeners will be
notified.

The base implementation only supports plain object actions. However, if you wrapped
`createStore` with `applyMiddleware`, the [middleware](./Glossary.md#middleware) can interpret actions differently,
and provide support for asynchronous primitives like promises, observables, thunks or something else
that makes sense for your project.

By default, it returns the action you just dispatched, but the middleware can override the return result.
For example, an async middleware may return a promise so you can wait for the dispatch completion.

##### Example (no middleware)

```js
import { createStore } from 'redux';
let store = createStore(todos, ['Use Redux']);

function addTodo(text) {
  return { type: 'ADD_TODO', text };
}

// No middleware: you can only dispatch plain object actions
store.dispatch(addTodo('Read the docs'));
store.dispatch(addTodo('Read about the middleware'));
```

##### Example ([redux-thunk](https://github.com/gaearon/redux-thunk) middleware)

```js
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

let createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
let store = createStoreWithMiddleware(todos, ['Use Redux']);

function addTodo(text) {
  return { type: 'ADD_TODO', text };
}

function addTodoAsync(text, delay) {
  // redux-thunk knows how to handle functions
  return function (dispatch) {
    setTimeout(function () {
      dispatch(addTodo(text));
    }, delay);
  };
}

store.dispatch(addTodo('Read the docs'));
store.dispatch(addTodoAsync('Learn to use middleware', 1000));
```

#### `subscribe(listener: Function): Function`

Adds a change listener. It will be called any time an action is dispatched,
and some part of the state tree may potentially have changed. You may then
call `getState()` to read the current state tree inside the callback.

Any [bindings for a view layer](../Recipes/Connecting UI.md) internally use `subscribe`
to be notified of the state changes. If you want to do something sophisticated with
the stream of resulting values, it might be a good idea to use a library like [Rx](https://github.com/Reactive-Extensions/RxJS)
and turn the store subscription into a proper Observable.

Returns a function to remove this change listener.

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

#### `getReducer(): Reducer`

Returns the reducer currently used by the store to calculate the state.

It is likely that you will only need this function if you implement a [hot
reloading](../Recipes/Hot Reloading.md) mechanism for Redux.

#### `replaceReducer(nextReducer: Reducer): void`

Replaces the reducer currently used by the store to calculate the state.

You might need this if your app implements [code splitting](../Recipes/Code Splitting.md) and you want to
load some of the reducers dynamically. You might also need this if you
implement a hot reloading mechanism for Redux.

=====================

### `combineReducers(reducers: Object): Reducer`

Turns an object whose values are different reducer functions, into a single
reducer function. It will call every child reducer, and gather their results
into a single state object, whose keys correspond to the keys of the passed
reducer functions.

Returns a reducer function that invokes every reducer inside the
passed object, and builds a state object with the same shape.

##### Parameters

* `reducers: Object`: An object whose values correspond to different
reducer functions that need to be combined into one. One handy way to obtain
it is to use ES6 `import * as reducers` syntax. The reducers may never return
`undefined` for any action. Instead, they should return their initial state
if the state passed to them was undefined, and the current state for any
unrecognized action.

##### Example

```js
// reducers.js
export function todos(state = [], action) {
  // ...
}
export function counter(state = 0, action) {
  // ...
}

// App.js
import { createStore, combineReducers } from 'redux';

import * as reducers from './reducers';
console.log(reducers);
// { todos: Function, counter: Function }

let reducer = combineReducers(reducers);
let store = createStore(reducer);
console.log(store.getState());
// { counter: 0, todos: [] }
```

=====================

### `applyMiddleware(...middlewares: Array<Middleware>): StoreEnhancer`

Creates a [store enhancer](./Glossary.md#store-enhancer) that applies middleware to the dispatch method
of the Redux store. This is handy for a variety of tasks, such as expressing
asynchronous actions in a concise manner, or logging every action payload.

Because middleware is potentially asynchronous, this should be the first store enhancer in the composition chain.

Returns a store enhancer function that needs to be applied to `createStore` to add any middleware to it.

Note that each middleware will be given the `dispatch` and `getState` functions as named arguments.

##### Parameters

* `...middlewares: Array<Middleware>`: The middleware chain to be applied.

##### Example

```js
function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action);
    let result = next(action);
    console.log('state after dispatch', getState());
    return result;
  };
}

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

let createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);
let store = createStoreWithMiddleware(todos, ['Use Redux']);
```

=====================

### `bindActionCreators(actionCreators: Object, dispatch: Function): Object`

Turns an object whose values are [action creators](./Glossary.md#action-creator),
into an object with the same keys, but with every function wrapped into a `dispatch` call
so they may be invoked directly. This is just a convenience method, as you can call
`store.dispatch(MyActionCreators.doSomething())` yourself just fine.

Returns an object mimicking the original object, but with every
action creator wrapped into the `dispatch` call.

##### Parameters

* `actionCreators: Object`: An object whose values are action creator
functions. One handy way to obtain it is to use ES6 `import * as` syntax.

* `dispatch: Function`: The `dispatch` function available on your Redux
store. 

##### Example

```js
// actionCreators.js
export function addTodo(text) {
  // ...
}
export function removeTodo(id) {
  // ...
}


// SomeComponent.js
import * as actionCreators from './actionCreators';
console.log(actionCreators);
// { addTodo: Function, removeTodo: function }

// You can always dispatch yourself:
store.dispatch(actionCreators.addTodo('Use Redux'));

// But it can be handy to bind action creators to a store instance:
let boundActionCreators = bindActionCreators(actionCreators, store.dispatch);
boundActionCreators.addTodo('Use Redux');
// You can pass them down and decouple components below from the Redux store.
```

=====================

### `compose(...funcs: Array<Function>): Function`

Composes functions from left to right.

This is a common function programming utility, and is included in Redux as convenience.  
You might want to use it to apply several store enhancers in a row.

Returns a function that passes its only argument to the first of
the `funcs`, then pipes its return value to the second one, and so on, until
the last of the `funcs` is called, and its result is returned.

#### Parameters

* `...funcs: Array<Function>`: The functions to compose.
