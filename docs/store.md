### The Redux Store

The store has the following responsibilities:

* Holds application state
* Allows access to state via the `getState` method
* Allows state to be updated via the `dispatch` method
* Registers listeners via the `subscribe` method

####Initialization

The simplest way to initialize the store is to call `createStore` with a reducer function. The following example has both a `counter` reducer and a `todos` reducer, so they need to be combined into a single reducer using the `combineReducers` function.

```js
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import counter from 'reducers/counter';
import todos from 'reducers/todos';

const reducer = combineReducers({counter, todos});
const store = createStore(reducer);
```

A recommended pattern is to create the object passed to `combineReducers` from a definition file.

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
