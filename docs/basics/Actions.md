# Actions

First, let’s define some actions.

**Actions** are payloads of information that send data from your application to your store. They are the *only* source of information for a store. You send them to the store using [`store.dispatch()`](../api/Store.md#dispatch).

Here’s an example action which represents adding a new todo item:

```js
{
  type: 'ADD_TODO',
  text: 'Build my first Redux app'
}
```

Actions are plain JavaScript objects. By convention, actions should have a string `type` field that indicates the type of action being performed. Types should typically be defined as string constants. Once your app is large enough, you may want to move them into a separate module.

```js
import { ADD_TODO, REMOVE_TODO } from '../actionTypes';
```

>##### Note on Boilerplate

>You don’t have to define action type constants in a separate file, or even to define them at all. For a small project, it might be easier to just use string literals for action types. However, there are some benefits to explicitly declaring constants in larger codebases. Read [Reducing Boilerplate](../recipes/ReducingBoilerplate.md) for more practical tips on keeping your codebase clean. 

Other than `type`, the structure of an action object is really up to you. If you’re interested, check out [Flux Standard Action](https://github.com/acdlite/flux-standard-action) for recommendations on how actions should be constructed.

We’ll add one more action type to describe a user ticking off a todo as completed. We refer to a particular todo by `index` because we store them in an array. In a real app it is wiser to generate a unique ID every time something new is created.

```js
{
  type: COMPLETE_TODO,
  index: 5
}
```

It’s a good idea to pass as little data in action as possible. For example, it’s better to pass `index` than the whole todo object.

Finally, we’ll add one more action type for changing the currently visible todos.

```js
{
  type: SET_VISIBILITY_FILTER,
  filter: SHOW_COMPLETED
}
```

## Action Creators

**Action creators** are exactly that—functions that create actions. It's easy to conflate the terms “action” and “action creator,” so do your best to use the proper term.

In [traditional Flux](http://facebook.github.io/flux) implementations, action creators often trigger a dispatch when invoked, like so:

```js
function addTodoWithDispatch(text) {
  const action = {
    type: ADD_TODO,
    text
  };
  dispatch(action);
}
```

By contrast, in Redux action creators are **pure functions** with zero side-effects. They simply return an action:

```js
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  };
}
```

This makes them more portable and easier to test. To actually initiate a dispatch, pass the result to the `dispatch()` function:

```js
dispatch(addTodo(text));
dispatch(completeTodo(index));
```

Or create a **bound action creator** that automatically dispatches:

```js
const boundAddTodo = (text) => dispatch(addTodo(text));
const boundCompleteTodo = (index) => dispatch(CompleteTodo(index));
```

You’ll be able to call them directly:

```
boundAddTodo(text);
boundCompleteTodo(index);
```

The `dispatch()` function can be accessed directly from the store as [`store.dispatch()`](../api/Store.md#dispatch), but more likely you'll access it using a helper like [react-redux](http://github.com/gaearon/react-redux)'s `connect()`. You can use [`bindActionCreators()`](../api/bindActionCreators.md) to automatically bind many action creators to a `dispatch()` function.

## Source Code

### `actions.js`

```js
/*
 * action types
 */

export const ADD_TODO = 'ADD_TODO';
export const COMPLETE_TODO = 'COMPLETE_TODO';
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

/*
 * other constants
 */

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};

/*
 * action creators
 */

export function addTodo(text) {
  return { type: ADD_TODO, text };
}

export function completeTodo(index) {
  return { type: COMPLETE_TODO, index };
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter };
}
```

## Next Steps

Now let’s [define some reducers](Reducers.md) to specify how the state updates when you dispatch these actions!

>##### Note for Advanced Users
>If you’re already familiar with the basic concepts and have previously completed this tutorial, don’t forget to check out [async actions](../advanced/AsyncActions.md) in the [advanced tutorial](../advanced/README.md) to learn how to handle AJAX responses and compose action creators into async control flow.
