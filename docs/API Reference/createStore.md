# `createStore(reducer, [initialState])`

Creates a Redux store that holds the complete state tree of your app.  
There should only be a single store in your app.

#### Arguments

1. `reducer` *(Function)*: A reducer function that returns the next state tree, given
the current state tree and the action to handle.

2. [`initialState`] *(any)*: The initial state. You may optionally specify it
to hydrate the state from the server in universal apps, or to restore a
previously serialized user session. If you produced `reducer` with [`combineReducers`](combineReducers.md), this must be a plain object with the same shape as the keys passed to it. Otherwise, you are free to pass anything that your `reducer` can understand.

#### Returns

*(Store)* An object that holds the complete state of your app, lets you change it by dispatching actions, and subscribe to the changes.

#### Example

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

store.dispatch({
  type: 'ADD_TODO',
  text: 'Read the docs'
});

console.log(store.getState());
// ['Use Redux', 'Read the docs']
```
