### The Redux Store

The store has the following responsibilities:

* Holds application state
* Allows access to state via `getState`
* Allows state to be updated via `dispatch`
* Registers listeners via `subscribe`

####Initialization

To intialize a store you simply call `createStore` with a reducer.

```js
import { createStore } from 'redux';
import counter from './reducers/counter';

const store = createStore(counter);
```

A redux store works with a single reducer, but in the following example we would like to use the functionality of both the `counter` and `todos` reducers. To do this we need to somehow combine `counter` and `todos` into a single reducer. Here is one approach: 

```js
import { createStore } from 'redux';
import counter from './reducers/counter';
import todos from './reducers/todos';

// set up the initial combined state
const initialState = {
  counterState: undefined,
  todoState: undefined
};
 
function combinedReducer(state = initialState, action) {
  // call each reducer separately
  const counterState = counter(state.counterState, action);
  const todoState = todos(state.todoState, action);
  
  // combine updated state created by each reducer into the new combined state
  return { counterState, todoState };
}

const store = createStore(combinedReducer);
```

As combining reducers is so common there is a helper function named `combineReducers` to assist. `combineReducers` takes an object of reducers and returns them combined into a single reducer.

```js
import { createStore, combineReducers } from 'redux';
import counter from './reducers/counter';
import todos from './reducers/todos';

const reducer = combineReducers({ counter, todos });
const store = createStore(reducer);
```

A recommended pattern is to import the object passed to `combineReducers` from a definition file.

```js
// reducers/index.js
export { default as counter } from './counter'
export { default as todos } from './todos'
```

```js
import { createStore, combineReducers } from 'redux';
import * as reducers from './reducers/index';

const reducer = combineReducers(reducers);
const store = createStore(reducer);
```

You may optionally specify the initial state as the second argument to `createStore`. This is useful for hydrating the state of the client to match the state of a Redux application running on the server.

```js
// server
const store = createStore(reducer);
store.dispatch(MyActionCreators.doSomething()); // fire action creators to fill the state
const state = store.getState(); // somehow pass this state to the client

// client
const initialState = window.STATE_FROM_SERVER;
const store = createStore(reducer, initialState);
```

####Usage

Store state is accessed using the `getState` method. Note that the name of each reducer in the object passed to `combineReducers` becomes a top-level key on the state object.

```js
store.getState();
// {
//   counter: 0,
//   todos: [{
//     text: 'Use Redux',
//     marked: false,
//     id: 0
//   }];
// }
```

Store state is updated by calling the `dispatch` method with an action understood by the reducer.

```js
store.dispatch({
  type: INCREMENT_COUNTER
});
store.dispatch({
  type: MARK_TODO,
  id: 0
});
```
```js
store.getState();
// {
//   counter: 1,
//   todos: [{
//     text: 'Use Redux',
//     marked: true,
//     id: 0
//   }];
// }
```

A listener can be registered with the store by passing a callback to the `subscribe` method. The `subscribe` method returns a function that can later be called to unsubscribe the listener.

```js
let unsubscribe = store.subscribe(() => console.log('state change!'));
```

####Advanced Intitialization

[Middleware](middleware.md) can be set up using `applyMiddleware`.

```js
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { logger, promise } from './middleware'
import * as reducers from './reducers/index';

const reducer = combineReducers(reducers);
const createStoreWithMiddleware = applyMiddleware(logger, promise)(createStore);
const store = createStoreWithMiddleware(reducer);
```
