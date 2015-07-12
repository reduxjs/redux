### The Redux Store

The store has the following responsibilities:

* Holds application state
* Allows access to state via the `getState` method
* Allows state to be updated via the `dispatch` method
* Registers listeners via the `subscribe` method

####Initialization

The simplest way to initialize the store is to call `createStore` with an object of reducer functions. The following example sets up the store for an application that has both a `counter` reducer and a `todos` reducer.

```js
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import counter from 'reducers/counter';
import todos from 'reducers/todos';

const store = createStore({counter, todos});
```

A recommended pattern is to create the object of reducer functions from a definition file.

```js
// reducers/index.js
export { default as counter } from './counter'
export { default as todos } from './todos'
```

```js
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as reducers from './reducers/index';

const store = createStore(reducers);
```

You may optionally specify the initial state as the second argument to `createStore`. This is useful for hydrating the state of the client to match the state of a Redux application running on the server.

```js
// server
const store = createStore(reducers);
store.dispatch(MyActionCreators.doSomething()); // fire action creators to fill the state
const state = store.getState(); // somehow pass this state to the client

// client
const initialState = window.STATE_FROM_SERVER;
const store = createStore(reducers, initialState);
```

####Usage

Store state is accessed using the `getState` method. Note that when you initialize the store by passing `createStore` an object of reducer functions, the name of each reducer becomes a top-level key on the state object.

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

Store state is updated by calling the `dispatch` method with an action understood by one or more reducers.

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
`createStore` can be called with a single reducing function instead of an object of reducing functions. The `combineReducers` function can be used to compose multiple reducers. TODO: Real world use case?

```js
import { createStore, combineReducers } from 'redux';
import * as reducers from './reducers/index';

const combinedReducerFn = combineReducers(counter, todos);
const store = createStore(combinedReducerFn);
```

[Middleware](middleware.md) can be set up using `applyMiddleware`.

```js
import { createStore, applyMiddleware } from 'redux'
import { logger, promise } from './middleware'
import * as reducers from './reducers/index';

const createWithMiddleware = applyMiddleware(logger, promise)(createStore);
const store = createWithMiddleware(reducers);
```
