Getting Started
--------------------------

Don't be fooled by all the fancy talk about reducers, middleware, stores enhancers — Redux is incredibly simple. If you’ve ever built a Flux application, you will feel right at home. (If you’re new to Flux, it's easy, too!)

In this guide, we’ll walk through the process of creating a simple Todo app.

### Actions

First, let’s define some actions.

**Actions** are payloads of information that send data from your application to your store. They are the *only* source of information for a store. You send them to the store using `store.dispatch()`.

Here's an example action which represents adding a new todo item:

```js
{
  type: ADD_TODO,
  payload: {
    text: 'Build my first Redux app'
  }
}
```

Actions are plain JavaScript objects. By convention, actions should have a `type` field that indicates the type of action being performed. Types should typically be defined as constants and imported from another module. It’s better to use strings than Symbols because strings are serializable.

```js
import { ADD_TODO, REMOVE_TODO } from '../actionTypes';
```

Other than `type`, the structure of an action object is really up to you. If you're interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions should be constructed.

We need one more action type, for removing todos:

```js
{
  type: REMOVE_TODO,
  payload: 123
}
```

`payload` in this case indicates the id of the todo we want to remove.

### Action creators

**Action creators** exactly that — functions that create actions. It’s easy to conflate the terms "action" and "action creator," so do your best to use the proper term.

In *other* Flux implementations, action creators often trigger a dispatch when invoked, like so:

```js
function addTodoWithDispatch(text) {
  const action = {
    type: ADD_TODO,
    payload: {
      text
    }
  };
  dispatch(action);
}
```

By contrast, in Redux action creators are **pure functions** with zero side-effects. They simply return an action:

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: {
      text
    }
  };
}
```

This makes them more portable and easier to test. To actually initiate a dispatch, pass the result to the `dispatch()` function:

```js
dispatch(addTodo(text));
dispatch(removeTodo(id));
```

Or create **bound action creator** that automatically dispatches to a particular store instance:

```js
let boundAddTodo = text => dispatch(addTodo(text));
let boundRemoveTodo = id => dispatch(addTodo(id));
```

The `dispatch()` function can be accessed directly from the store as `store.dispatch()`, but more likely you’ll access it using a helper like `connect` from [react-redux](http://github.com/gaearon/react-redux).

### Reducers

Now let’s set up our store to respond to the action we defined above.

Unlike other Flux implementations, Redux only has a single store, rather than a different store for each domain of data in your application. Instead of creating multiple stores that manually manage their own internal state, we create **reducers** that specify how to calculate a slice of the global state in response to new actions.

A reducer looks like this:

```js
(previousState, action) => newState
```

It’s the type of function you would pass to `Array.prototype.reduce(reducer, ?initialValue)`.

This may seem radical, but it turns out that this function signature is sufficient to express the entirety of the store model from traditional Flux — in a purely functional way. **This is the essence of Redux**. It’s what enables all the cool features like hot reloading, time travel, and universal rendering. Aside from all that, though, it's simply a better model for expressing state changes.

[**See Dan's talk at React Europe for more on this topic**](https://www.youtube.com/watch?v=xsSnOQynTHs).

Let’s make a reducer for our Todo app:

```js
const initialState = { todos: [], idCounter: 0 };

function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [
          ...state.todos,
          { text: action.payload, id: state.idCounter + 1 }
        ],
        idCounter: state.idCounter + 1
      };
    case REMOVE_TODO:
      return {
        ...state,
        todos: state.todos.filter(todo => todo.id !== action.payload)
      };
    default:
      return state;
  }
}
```

Whoa, what’s going on here? A few things to note:

- `state` is the previous state of the store. Redux will dispatch a dummy action immediately upon creating your store, at which point `state` is undefined. From that point on, `state` is the previous value returned by the reducer.
- We’re using a default parameter to specify the initial state of the store.
- We’re using a switch statement to check the action type.
- **We’re not mutating the previous state** — we're returning a **new** state object based on the **previous** state object.

That last point is especially important: never mutate the previous state object. Always return a new state. Remember, reducers are pure functions, and should not perform mutations or side-effects. Here we’re using the ES7 spread operator to shallow copy old state values to a new object. You can use a library like Immutable.js for a nicer API and better performance, since it uses [persistent data structures](http://en.wikipedia.org/wiki/Persistent_data_structure). Here’s how that same reducer would look using immutable values:

```js
const initialState = Immutable.Map({ todos: [], idCounter: 0 });

function todos(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return state
        .update('todos',
          todos => todos.push(Immutable.Map({
            text: action.payload,
            id: state.get('idCounter')
          })
        ))
        .set('idCounter', state.get('idCounter') + 1);
    case REMOVE_TODO:
      return state
        .update('todos',
          todos => todos.filter(todo => todo.id !== action.payload )
        );
    default:
      return state;
  }
}
```

If you’re thinking “yuck, switch statements,” remember that reducers are just functions — you can abstract away these details using helpers. Check out [redux-actions](https://github.com/acdlite/redux-actions) for an example of how to use higher-order functions to create reducers.

### Creating a store

Now we have some action creators and a reducer to handle them. The next step is to create our store.

To create a store, pass a reducer to `createStore()`:

```js
import { createStore } from 'redux';
import todos from '../reducers/todos';
const store = createStore(todos);
```

Usually you’ll have multiple reducers for different domains of data in your app. Consider the following reducers:

```js
// reducers/index.js
import todos as todoReducer from '../reducers/todos';
import counter as counterReducer from '../reducers/counters';

export default const reducers = {
  todos: todoReducer,
  counter: counterReducer
};
```

You can use the `combineReducers()` helper to combine multiple reducers into one:

```js
import { createStore, combineReducers } from 'redux';
import * as reducers from '../reducers';
const reducer = combineReducers(reducers);
const store = createStore(reducer);
```

It will create a reducer which produces a state object, whose keys are match those of your reducers:

```js
const state = {
  todos: todoState,
  counter: counterState
};
```

### Middleware

Middleware is an optional feature of Redux that enables you to customize how dispatches are handled. Think of middleware as a certain type of plugin or extension for Redux.

A common use for middleware is to enable asynchronous dispatches. For example, a promise middleware adds support for dispatching promises:

```js
dispatch(Promise.resolve({ type: ADD_TODO, payload: { text: 'Use middleware!' } }));
```
A promise middleware would detect that a promise was dispatched, intercept it, and instead dispatch with the resolved value at a future point in time.

Middleware is very simple to create using function composition. We won't focus on how middleware works in this document but here's how you enable it when creating your store:

```js
import { createStore, applyMiddleware } from 'redux';
// where promise, thunk, and observable are examples of middleware
const store = applyMiddleware(promise, thunk, observable)(createStore)(reducer);
```

Yes, you read that correctly. [Read more about how middleware works here.](../Recipes/Middleware.md)

### Connecting to your views

You’ll rarely interact with the store object directly. Most often, you’ll use some sort of binding to your preferred view library.

Flux is most popular within the React community, but Redux works with any kind of view layer. The React bindings for Redux are available as [react-redux](github.com/gaearon/react-redux) — see that project for details on how to integrate with React.

However, if you do find yourself needing to access the store directly, the API for doing so is very simple:

- `store.dispatch()` dispatches an action.
- `store.getState()` gets the current state.
- `store.subscribe()` registers a listener which is called after every dispatch, and returns a function which you call to unsubscribe.


### Go make something great

That’s it! As you can see, despite the powerful features that Redux enables, the core of Redux is really quite simple.

Please let us know if you have suggestions for how this guide could be improved.

--------------------------

Next: [Migrating to Redux](Migrating to Redux.md)
