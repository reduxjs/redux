### The Redux Store

The store has the following responsibilities:

* Holds application state
* Allows access to state via `getState`
* Allows state to be updated via `dispatch`
* Registers listeners via `subscribe`

####Initialization

To intialize a store you simply call `createStore` with a reducer:

```js
import { createStore } from 'redux';
import counterReducer from './reducers/counter';

const store = createStore(counterReducer);
```

`createStore` intializes the store with a single reducer, but in the following example we would like to use functionality from both the `counter` and `todos` reducers. To do this we need to somehow combine `counter` and `todos` into a single reducer. Here is one approach:

```js
import { createStore } from 'redux';
import counterReducer from './reducers/counter';
import todosReducer from './reducers/todos';

// set up the initial combined state
const initialState = {
  counterState: undefined,
  todoState: undefined
};
 
function masterReducer(state = initialState, action) {
  // call each reducer separately
  const counterState = counterReducer(state.counterState, action);
  const todoState = todosReducer(state.todoState, action);
  
  // combine updated state created by each reducer into the new combined state
  return { counterState, todoState };
}

const store = createStore(masterReducer);
```

Combining reducers is very common so there is a helper function named `combineReducers` to assist. `combineReducers` takes an object of reducers and combines them into a single reducer. Here is the previous example using `combineReducers`:

```js
import { createStore, combineReducers } from 'redux';
import counterReducer from './reducers/counter';
import todosReducer from './reducers/todos';

const reducers = {
  counter: counterReducer,
  todos: todosReducer
}

const masterReducer = combineReducers(reducers);
const store = createStore(masterReducer);
```

Note that the key of each reducer in the reducer object passed to `combineReducers` becomes a top-level key on the state object returned by the combined reducer. In the previous example, the state object returned by `masterReducer` looks like this:

```js
const state = {
  counter: counterState,
  todos: todosState
};
```

A recommended pattern is to use `import *` to import an object of reducers from a definition file:

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

Store state is accessed using the `getState` method.

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
