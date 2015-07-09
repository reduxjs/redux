### Running the same code on client and server

The `redux` instance returned by `createRedux` also has the `dispatch(action)`, `subscribe()` and `getState()` methods that you may call outside the React components.

You may optionally specify the initial state as the second argument to `createRedux`. This is useful for hydrating the state you received from running Redux on the server:

```js
// server
const redux = createRedux(stores);
redux.dispatch(MyActionCreators.doSomething()); // fire action creators to fill the state
const state = redux.getState(); // somehow pass this state to the client

// client
const initialState = window.STATE_FROM_SERVER;
const redux = createRedux(stores, initialState);
```
