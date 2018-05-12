# Implementing Undo History

Building an Undo and Redo functionality into an app has traditionally required conscious effort from the developer. It is not an easy problem with classical MVC frameworks because you need to keep track of every past state by cloning all relevant models. In addition, you need to be mindful of the undo stack because the user-initiated changes should be undoable.

This means that implementing Undo and Redo in an MVC application usually forces you to rewrite parts of your application to use a specific data mutation pattern like [Command](https://en.wikipedia.org/wiki/Command_pattern).

With Redux, however, implementing undo history is a breeze. There are three reasons for this:

* There are no multiple models—just a state subtree that you want to keep track of.
* The state is already immutable, and mutations are already described as discrete actions, which is close to the undo stack mental model.
* The reducer `(state, action) => state` signature makes it natural to implement generic “reducer enhancers” or “higher order reducers”. They are functions that take your reducer and enhance it with some additional functionality while preserving its signature. Undo history is exactly such a case.

Before proceeding, make sure you have worked through the [basics tutorial](../basics/README.md) and understand [reducer composition](../basics/Reducers.md) well. This recipe will build on top of the example described in the [basics tutorial](../basics/README.md).

In the first part of this recipe, we will explain the underlying concepts that make Undo and Redo possible to implement in a generic way.

In the second part of this recipe, we will show how to use [Redux Undo](https://github.com/omnidan/redux-undo) package that provides this functionality out of the box.

[![demo of todos-with-undo](http://i.imgur.com/lvDFHkH.gif)](https://twitter.com/dan_abramov/status/647038407286390784)


## Understanding Undo History

### Designing the State Shape

Undo history is also part of your app's state, and there is no reason why we should approach it differently. Regardless of the type of the state changing over time, when you implement Undo and Redo, you want to keep track of the *history* of this state at different points in time.

For example, the state shape of a counter app might look like this:

```js
{
  counter: 10
}
```

If we wanted to implement Undo and Redo in such an app, we'd need to store more state so we can answer the following questions:

* Is there anything left to undo or redo?
* What is the current state?
* What are the past (and future) states in the undo stack?

It is reasonable to suggest that our state shape should change to answer these questions:

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    present: 10,
    future: []
  }
}
```

Now, if user presses “Undo”, we want it to change to move into the past:

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    present: 9,
    future: [10]
  }
}
```

And further yet:

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7],
    present: 8,
    future: [9, 10]
  }
}
```

When the user presses “Redo”, we want to move one step back into the future:

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    present: 9,
    future: [10]
  }
}
```

Finally, if the user performs an action (e.g. decrement the counter) while we're in the middle of the undo stack, we're going to discard the existing future:

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    present: 8,
    future: []
  }
}
```

The interesting part here is that it does not matter whether we want to keep an undo stack of numbers, strings, arrays, or objects. The structure will always be the same:

```js
{
  counter: {
    past: [0, 1, 2],
    present: 3,
    future: [4]
  }
}
```

```js
{
  todos: {
    past: [
      [],
      [{ text: 'Use Redux' }],
      [{ text: 'Use Redux', complete: true }]
    ],
    present: [
      { text: 'Use Redux', complete: true },
      { text: 'Implement Undo' }
    ],
    future: [
      [
        { text: 'Use Redux', complete: true },
        { text: 'Implement Undo', complete: true }
      ]
    ]
  }
}
```

In general, it looks like this:

```js
{
  past: Array<T>,
  present: T,
  future: Array<T>
}
```

It is also up to us whether to keep a single top-level history:

```js
{
  past: [
    { counterA: 1, counterB: 1 },
    { counterA: 1, counterB: 0 },
    { counterA: 0, counterB: 0 }
  ],
  present: { counterA: 2, counterB: 1 },
  future: []
}
```

Or many granular histories so user can undo and redo actions in them independently:

```js
{
  counterA: {
    past: [1, 0],
    present: 2,
    future: []
  },
  counterB: {
    past: [0],
    present: 1,
    future: []
  }
}
```

We will see later how the approach we take lets us choose how granular Undo and Redo need to be.

### Designing the Algorithm

Regardless of the specific data type, the shape of the undo history state is the same:

```js
{
  past: Array<T>,
  present: T,
  future: Array<T>
}
```

Let's talk through the algorithm to manipulate the state shape described above. We can define two actions to operate on this state: `UNDO` and `REDO`. In our reducer, we will do the following steps to handle these actions:

#### Handling Undo

* Remove the *last* element from the `past`.
* Set the `present` to the element we removed in the previous step.
* Insert the old `present` state at the *beginning* of the `future`.

#### Handling Redo

* Remove the *first* element from the `future`.
* Set the `present` to the element we removed in the previous step.
* Insert the old `present` state at the *end* of the `past`.

#### Handling Other Actions

* Insert the `present` at the end of the `past`.
* Set the `present` to the new state after handling the action.
* Clear the `future`.

### First Attempt: Writing a Reducer

```js
const initialState = {
  past: [],
  present: null, // (?) How do we initialize the present?
  future: []
}

function undoable(state = initialState, action) {
  const { past, present, future } = state

  switch (action.type) {
    case 'UNDO':
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      }
    case 'REDO':
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      }
    default:
      // (?) How do we handle other actions?
      return state
  }
}
```

This implementation isn't usable because it leaves out three important questions:

* Where do we get the initial `present` state from? We don't seem to know it beforehand.
* Where do we react to the external actions to save the `present` to the `past`?
* How do we actually delegate the control over the `present` state to a custom reducer?

It seems that reducer isn't the right abstraction, but we're very close.

### Meet Reducer Enhancers

You might be familiar with [higher order functions](https://en.wikipedia.org/wiki/Higher-order_function). If you use React, you might be familiar with [higher order components](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750). Here is a variation on the same pattern, applied to reducers.

A *reducer enhancer* (or a *higher order reducer*) is a function that takes a reducer, and returns a new reducer that is able to handle new actions, or to hold more state, delegating control to the inner reducer for the actions it doesn't understand. This isn't a new pattern—technically, [`combineReducers()`](../api/combineReducers.md) is also a reducer enhancer because it takes reducers and returns a new reducer.

A reducer enhancer that doesn't do anything looks like this:

```js
function doNothingWith(reducer) {
  return function (state, action) {
    // Just call the passed reducer
    return reducer(state, action)
  }
}
```

A reducer enhancer that combines other reducers might look like this:

```js
function combineReducers(reducers) {
  return function (state = {}, action) {
    return Object.keys(reducers).reduce((nextState, key) => {
      // Call every reducer with the part of the state it manages
      nextState[key] = reducers[key](state[key], action)
      return nextState
    }, {})
  }
}
```

### Second Attempt: Writing a Reducer Enhancer

Now that we have a better understanding of reducer enhancers, we can see that this is exactly what `undoable` should have been:

```js
function undoable(reducer) {
  // Call the reducer with empty action to populate the initial state
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: []
  }

  // Return a reducer that handles undo and redo
  return function (state = initialState, action) {
    const { past, present, future } = state

    switch (action.type) {
      case 'UNDO':
        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)
        return {
          past: newPast,
          present: previous,
          future: [present, ...future]
        }
      case 'REDO':
        const next = future[0]
        const newFuture = future.slice(1)
        return {
          past: [...past, present],
          present: next,
          future: newFuture
        }
      default:
        // Delegate handling the action to the passed reducer
        const newPresent = reducer(present, action)
        if (present === newPresent) {
          return state
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: []
        }
    }
  }
}
```

We can now wrap any reducer into `undoable` reducer enhancer to teach it to react to `UNDO` and `REDO` actions.

```js
// This is a reducer
function todos(state = [], action) {
  /* ... */
}

// This is also a reducer!
const undoableTodos = undoable(todos)

import { createStore } from 'redux'
const store = createStore(undoableTodos)

store.dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
})

store.dispatch({
  type: 'ADD_TODO',
  text: 'Implement Undo'
})

store.dispatch({
  type: 'UNDO'
})
```

There is an important gotcha: you need to remember to append `.present` to the current state when you retrieve it. You may also check `.past.length` and `.future.length` to determine whether to enable or to disable the Undo and Redo buttons, respectively.

You might have heard that Redux was influenced by [Elm Architecture](https://github.com/evancz/elm-architecture-tutorial/). It shouldn't come as a surprise that this example is very similar to [elm-undo-redo package](http://package.elm-lang.org/packages/TheSeamau5/elm-undo-redo/2.0.0).

## Using Redux Undo

This was all very informative, but can't we just drop a library and use it instead of implementing `undoable` ourselves? Sure, we can! Meet [Redux Undo](https://github.com/omnidan/redux-undo), a library that provides simple Undo and Redo functionality for any part of your Redux tree.

In this part of the recipe, you will learn how to make the [Todo List example](http://redux.js.org/basics/ExampleTodoList.html) undoable. You can find the full source of this recipe in the [`todos-with-undo` example that comes with Redux](https://github.com/reduxjs/redux/tree/master/examples/todos-with-undo).

### Installation

First of all, you need to run

```
npm install --save redux-undo
```

This installs the package that provides the `undoable` reducer enhancer.

### Wrapping the Reducer

You will need to wrap the reducer you wish to enhance with `undoable` function. For example, if you exported a `todos` reducer from a dedicated file, you will want to change it to export the result of calling `undoable()` with the reducer you wrote:

#### `reducers/todos.js`

```js
import undoable, { distinctState } from 'redux-undo'

/* ... */

const todos = (state = [], action) => {
  /* ... */
}

const undoableTodos = undoable(todos, {
  filter: distinctState()
})

export default undoableTodos
```

The `distinctState()` filter serves to ignore the actions that didn't result in a state change. There are [many other options](https://github.com/omnidan/redux-undo#configuration) to configure your undoable reducer, like setting the action type for Undo and Redo actions.

Note that your `combineReducers()` call will stay exactly as it was, but the `todos` reducer will now refer to the reducer enhanced with Redux Undo:

#### `reducers/index.js`

```js
import { combineReducers } from 'redux'
import todos from './todos'
import visibilityFilter from './visibilityFilter'

const todoApp = combineReducers({
  todos,
  visibilityFilter
})

export default todoApp
```

You may wrap one or more reducers in `undoable` at any level of the reducer composition hierarchy. We choose to wrap `todos` instead of the top-level combined reducer so that changes to `visibilityFilter` are not reflected in the undo history.

### Updating the Selectors

Now the `todos` part of the state looks like this:

```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: {
    past: [
      [],
      [{ text: 'Use Redux' }],
      [{ text: 'Use Redux', complete: true }]
    ],
    present: [
      { text: 'Use Redux', complete: true },
      { text: 'Implement Undo' }
    ],
    future: [
      [
        { text: 'Use Redux', complete: true },
        { text: 'Implement Undo', complete: true }
      ]
    ]
  }
}
```

This means you need to access your state with `state.todos.present` instead of
just `state.todos`:

#### `containers/VisibleTodoList.js`

```js
const mapStateToProps = state => {
  return {
    todos: getVisibleTodos(state.todos.present, state.visibilityFilter)
  }
}
```

### Adding the Buttons

Now all you need to do is add the buttons for the Undo and Redo actions.

First, create a new container component called `UndoRedo` for these buttons. We won't bother to split the presentational part into a separate file because it is very small:

#### `containers/UndoRedo.js`

```js
import React from 'react'

/* ... */

let UndoRedo = ({ canUndo, canRedo, onUndo, onRedo }) => (
  <p>
    <button onClick={onUndo} disabled={!canUndo}>
      Undo
    </button>
    <button onClick={onRedo} disabled={!canRedo}>
      Redo
    </button>
  </p>
)
```

You will use `connect()` from [React Redux](https://github.com/reduxjs/react-redux) to generate a container component. To determine whether to enable Undo and Redo buttons, you can check `state.todos.past.length` and `state.todos.future.length`. You won't need to write action creators for performing undo and redo because Redux Undo already provides them:

#### `containers/UndoRedo.js`

```js
/* ... */

import { ActionCreators as UndoActionCreators } from 'redux-undo'
import { connect } from 'react-redux'

/* ... */

const mapStateToProps = state => {
  return {
    canUndo: state.todos.past.length > 0,
    canRedo: state.todos.future.length > 0
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onUndo: () => dispatch(UndoActionCreators.undo()),
    onRedo: () => dispatch(UndoActionCreators.redo())
  }
}

UndoRedo = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoRedo)

export default UndoRedo
```

Now you can add `UndoRedo` component to the `App` component:

#### `components/App.js`

```js
import React from 'react'
import Footer from './Footer'
import AddTodo from '../containers/AddTodo'
import VisibleTodoList from '../containers/VisibleTodoList'
import UndoRedo from '../containers/UndoRedo'

const App = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
    <UndoRedo />
  </div>
)

export default App
```

This is it! Run `npm install` and `npm start` in the [example folder](https://github.com/reduxjs/redux/tree/master/examples/todos-with-undo) and try it out!
