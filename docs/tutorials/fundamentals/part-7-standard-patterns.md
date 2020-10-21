---
id: part-7-standard-patterns
title: 'Redux Fundamentals, Part 7: Standard Redux Patterns'
sidebar_label: 'Standard Redux Patterns'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the standard patterns used in real-world Redux apps'
---

# Redux Fundamentals, Part 7: Standard Redux Patterns

:::tip What You'll Learn

- Standard patterns used in real-world Redux apps, and why those patterns exist:
  - Action creators for encapsulating action objects
  - Memoized selectors for improving performance
  - Normalizing state for manging collections of items
  - Tracking request status via loading enums
  - Working with promises and thunks

:::

:::info Prerequisites

- Understanding the topics in all previous sections

:::

In [Part 6: Async Logic and Data Fetching](./part-6-async-logic.md), we saw how to use Redux middleware to write async logic that can talk to the store. In particular, we used the Redux "thunk" middleware to write functions that can contain reusable async logic, without knowing what Redux store they'll be talking to ahead of time.

So far, we've covered the basics of how Redux actually works. But, real world Redux applications use some additional patterns on top of those basics.

It's important to note that **none of these patterns are _required_ to use Redux!** But, there are very good reasons why each of these patterns exists.

In this section, we'll rework our existing todo app code to use some of these patterns, and talk about why they're commonly used in Redux apps.

## Action Creators

In our app, we've been writing action objects directly in the code, where they're being dispatched:

```js
dispatch({ type: 'todos/todoAdded', payload: trimmedText })
```

However, in practice, well-written Redux apps don't actually write those action objects inline when we dispatch them. Instead, we use "action creator" functions.

An **action creator** is a function that creates and returns an action object. We typically use these so we don't have to write the action object by hand every time:

```js
const todoAdded = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

We then use them by **calling the action creator**, and then **passing the resulting action object directly to `dispatch`**:

```js
store.dispatch(todoAdded('Buy milk'))

console.log(store.getState().todos)
// [ {id: 0, text: 'Buy milk', completed: false}]
```

### Using Action Creators

Let's update our todos slice file to use action creators for a couple of our action types.

We'll start with the two main actions we've been using so far: loading the list of todos from the server, and adding a new todo after saving it to the server.

Right now, `todosSlice.js` is dispatching an action object directly, like this:

```js
dispatch({ type: 'todos/todosLoaded', payload: response.todos })
```

We'll create a function that creates and returns that same kind of action object, but accepts the array of todos as its argument and puts it into the action as `action.payload`. Then, we can dispatch the action using that new action creator inside of our `fetchTodos` thunk:

```js title="src/features/todos/todosSlice.js"
// highlight-start
export const todosLoaded = todos => {
  return {
    type: 'todos/todosLoaded',
    payload: todos
  }
}
// highlight-end

export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  // highlight-next-line
  dispatch(todosLoaded(response.todos))
}
```

We can also do the same thing for the "todo added" action:

```js title="src/features/todos/todosSlice.js"
// highlight-start
export const todoAdded = todo => {
  return {
    type: 'todos/todoAdded',
    payload: todo
  }
}
// highlight-end

export function saveNewTodo(text) {
  return async function saveNewTodoThunk(dispatch, getState) {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    // highlight-next-line
    dispatch(todoAdded(response.todo))
  }
}
```

While we're at it, let's do the same thing for the "color filter changed" action:

```js title="src/features/filters/filtersSlice.js"
// highlight-start
export const colorFilterChanged = (color, changeType) => {
  return {
    type: 'filters/colorFilterChanged',
    payload: { color, changeType }
  }
}
// highlight-end
```

And since this action was being dispatched from the `<Footer>` component, we'll need to import the `colorFilterChanged` action creator over there and use it:

```js title="src/features/footer/Footer.js"
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { availableColors, capitalize } from '../filters/colors'
// highlight-next-line
import { StatusFilters, colorFilterChanged } from '../filters/filtersSlice'

// omit child components

const Footer = () => {
  const dispatch = useDispatch()

  const todosRemaining = useSelector(state => {
    const uncompletedTodos = state.todos.filter(todo => !todo.completed)
    return uncompletedTodos.length
  })

  const { status, colors } = useSelector(state => state.filters)

  const onMarkCompletedClicked = () => dispatch({ type: 'todos/allCompleted' })
  const onClearCompletedClicked = () =>
    dispatch({ type: 'todos/completedCleared' })

  // highlight-start
  const onColorChange = (color, changeType) =>
    dispatch(colorFilterChanged(color, changeType))
  // highlight-end

  const onStatusChange = status =>
    dispatch({ type: 'filters/statusFilterChanged', payload: status })

  // omit rendering output
}

export default Footer
```

Notice that the `colorFilterChanged` action creator actually accepts two different arguments, and then combines them together to form the right `action.payload` field.

This doesn't change anything about how the application works, or how the Redux data flow behaves - we're still creating action objects, and dispatching them. But, instead of writing action objects directly in our code all the time, we're now using action creators to prepare those action objects before they're dispatched.

We can also use action creators with thunk functions, and in fact [we wrapped a thunk in an action creator in the previous section](./part-6-async-logic.md#saving-todo-items) . We specifically wrapped `saveNewTodo` in a "thunk action creator" function so that we could pass in a `text` parameter. While `fetchTodos` doesn't take any parameters, we could still wrap it in an action creator as well:

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
export function fetchTodos() {
  return async function fetchTodosThunk(dispatch, getState) {
    const response = await client.get('/fakeApi/todos')
    dispatch(todosLoaded(response.todos))
  }
}
```

And that means we have to change the place it's dispatched in `index.js` to call the outer thunk action creator function, and pass the returned inner thunk function to `dispatch`:

```js title="src/index.js"
import store from './store'
import { fetchTodos } from './features/todos/todosSlice'

// highlight-next-line
store.dispatch(fetchTodos())
```

We've written thunks using the `function` keyword so far to make it clear what they're doing. However, we can also write them using arrow function syntax instead. Using implicit returns can shorten the code, although it may make it a bit harder to read as well if you're not familiar with arrow functions:

```js title="src/features/todos/todosSlice.js"
// Same thing as the above example!
// highlight-next-line
export const fetchTodos = () => async dispatch => {
  const response = await client.get('/fakeApi/todos')
  dispatch(todosLoaded(response.todos))
}
```

### Why Use Action Creators?

In our small example todo app, writing action objects by hand every time isn't too difficult. In fact, by switching to using action creators, we've added _more_ work - now we have to write a function _and_ the action object.

But, what if we needed to dispatch the same action from many parts of the application? Or what if there's some additional logic that we have to do every time we dispatch an action, like creating a unique ID? We'd end up having to copy-paste the additional setup logic every time we need to dispatch that action.

Action creators have two primary purposes:

- They prepare and format the contents of action objects
- They encapsulate any additional work needed whenever we create those actions

That way, we have a consistent approach for creating actions, whether or not there's any extra work that needs to be done. The same goes for thunks as well.

:::info

For more details on why action creators are useful, see:

- [Idiomatic Redux: Why Use Action Creators?](https://blog.isquaredsoftware.com/2016/10/idiomatic-redux-why-use-action-creators/)

:::

## Memoized Selectors

## Normalized State

## Async Request Status

## Thunks and Promises
