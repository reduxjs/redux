# Three Principles

Redux can be described in three fundamental principles:

### Single source of truth

**The [state](../Glossary.md#state) of your whole application is stored in an object tree inside a single [store](../Glossary.md#store).**

This makes it easy to create universal apps. The state from the server can be serialized and hydrated into the client with no extra coding effort. It is easier to debug an application when there is a single state tree. You can also persist your app’s state in development for a faster development cycle. And with a single state tree, you get previously difficult functionality like Undo/Redo for free.

```js
console.log(store.getState());

{
  visibilityFilter: 'SHOW_ALL',
  todos: [{
    text: 'Consider using Redux',
    completed: true,
  }, {
    text: 'Keep all state in a single tree',
    completed: false
  }]
}
```

### State is read-only

**The only way to mutate the state is to emit an [action](../Glossary.md#action), an object describing what happened.**

This ensures that the views or the network callbacks never write directly to the state, and instead express the intent to mutate. Because all mutations are centralized and happen one by one in a strict order, there are no subtle race conditions to watch out for. Actions are just plain objects, so they can be logged, serialized, stored, and later replayed for debugging or testing purposes.

```js
store.dispatch({
  type: 'COMPLETE_TODO',
  index: 1
});

store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
});
```

### Mutations are written as pure functions

**To specify how the state tree is transformed by actions, you write pure [reducers](../Glossary.md#reducer).**

Reducers are just pure functions that take the previous state and an action, and return the next state. Remember to return new state objects, instead of mutating the previous state. You can start with a single reducer, but as your app grows, you can split it into smaller reducers that manage specific parts of the state tree. Because reducers are just functions, you can control the order in which they are called, pass additional data, or even make reusable reducers for common tasks such as pagination.

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
  case 'SET_VISIBILITY_FILTER':
    return action.filter;
  default:
    return state;
  }
}

function todos(state = [], action) {
  switch (action.type) {
  case 'ADD_TODO':
    return [...state, {
      text: action.text,
      completed: false
    }];
  case 'COMPLETE_TODO':
    return [
      ...state.slice(0, action.index),
      Object.assign({}, state[action.index], {
        completed: true
      }),
      ...state.slice(action.index + 1)
    ]
  default:
    return state;
  }
}

import { combineReducers, createStore } from 'redux';
let reducer = combineReducers({ visibilityFilter, todos });
let store = createStore(reducer);
```

That’s it! Now you know what Redux is all about.
