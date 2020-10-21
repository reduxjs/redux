---
id: part-7-standard-patterns
title: 'Redux Fundamentals, Part 7: Standard Redux Patterns'
sidebar_label: 'Standard Redux Patterns'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the standard patterns used in real-world Redux apps'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

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

In this section, we'll rework our existing todo app code to use some of these patterns, and talk about why they're commonly used in Redux apps. Then, in [**Part 8**](./part-8-modern-redux.md), we'll talk about "modern Redux", including **how to use our official [Redux Toolkit](https://redux-toolkit.js.org) package to simplify all the Redux logic we've written "by hand"** in our app, and why **we recommend using Redux Toolkit as the standard approach for writing Redux apps**.

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

<DetailedExplanation title="Detailed Explanation: Why use Action Creators?">

In our small example todo app, writing action objects by hand every time isn't too difficult. In fact, by switching to using action creators, we've added _more_ work - now we have to write a function _and_ the action object.

But, what if we needed to dispatch the same action from many parts of the application? Or what if there's some additional logic that we have to do every time we dispatch an action, like creating a unique ID? We'd end up having to copy-paste the additional setup logic every time we need to dispatch that action.

Action creators have two primary purposes:

- They prepare and format the contents of action objects
- They encapsulate any additional work needed whenever we create those actions

That way, we have a consistent approach for creating actions, whether or not there's any extra work that needs to be done. The same goes for thunks as well.

</DetailedExplanation>

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

Similarly, we _could_ shorten the plain action creators if we wanted to:

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
export const todoAdded = todo => ({ type: 'todos/todoAdded', payload: todo })
```

It's up to you to decide whether using arrow functions this way is better or not.

:::info

For more details on why action creators are useful, see:

- [Idiomatic Redux: Why Use Action Creators?](https://blog.isquaredsoftware.com/2016/10/idiomatic-redux-why-use-action-creators/)

:::

## Memoized Selectors

We've already seen that we can write "selector" functions, which accept the Redux `state` object as an argument, and return a value:

```js
const selectTodos = state => state.todos
```

What if we need to _derive_ some data? For example, maybe we want to have an array of just the todo IDs:

```js
const selectTodoIds = state => state.todos.map(todo => todo.id)
```

However, `array.map()` always returns a new array reference. We know that the React-Redux `useSelector` hook will re-run its selector function after _every_ dispatched action, and if the selector result changes, it will force the component to re-render.

In this example, **calling `useSelector(selectTodoIds)` will _always_ cause the component to re-render after _every_ action, because it's returning a new array reference!**

In Part 5, we saw that [we can pass `shallowEqual` as an argument to `useSelector`](./part-5-ui-and-react.md#selecting-data-in-list-items-by-id). There's another option here, though: we could use "memoized" selectors.

**Memoization** is a kind of caching - specifically, saving the results of an expensive calculation, and reusing those results if we see the same inputs later.

**Memoized selector functions** are selectors that save the most recent result value, and if you call them multiple times with the same inputs, will return the same result value. If you call them with _different_ inputs than last time, they will recalculate a new result value, cache it, and return the new result.

### Memoizing Selectors with `createSelector`

The **[Reselect library](https://github.com/reduxjs/reselect) provides a `createSelector` API that will generate memoized selector functions**. `createSelector` accepts one or more "input selector" functions as arguments, plus an "output selector", and returns the new selector function. Every time you call the selector:

- All "input selectors" are called with all of the arguments
- If any of the input selector return values have changed, the "output selector" will re-run
- All of the input selector results become arguments to the output selector
- The final result of the output selector is cached for next time

Let's create a memoized version of `selectTodoIds` and use that with our `<TodoList>`.

First, we need to install Reselect:

```bash
npm install reselect
```

Then, we can import and call `createSelector`. Our original `selectTodoIds` function was defined over in `TodoList.js`, but it's more common for selector functions to be written in the relevant slice file. So, let's add this to the todos slice:

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSelector } from 'reselect'

// omit reducer

// omit action creators

// highlight-start
export const selectTodoIds = createSelector(
  // First, pass one or more "input selector" functions:
  state => state.todos,
  // Then, an "output selector" that receives all the input results as arguments
  // and returns a final result value
  todos => todos.map(todo => todo.id)
)
// highlight-end
```

Then, let's use it in `<TodoList>`:

```js title="src/features/todos/TodoList.js"
import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'

// highlight-next-line
import { selectTodoIds }
import TodoListItem from './TodoListItem'

const TodoList = () => {
  // highlight-next-line
  const todoIds = useSelector(selectTodoIds)

  const renderedListItems = todoIds.map((todoId) => {
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}
```

This actually behaves a bit differently than the `shallowEqual` comparison function does. Any time the `state.todos` array changes, we're going to create a new todo IDs array as a result. That includes any immutable updates to todo items like toggling their `completed` field, since we have to create a new array for the immutable update.

:::tip

Memoized selectors are only helpful when you actually derive additional values from the original data. If you are only looking up and returning an existing value, you can keep the selector as a plain function.

:::

### Selectors with Multiple Arguments

Our todo app is supposed to have the ability to filter the visible todos based on their completed status. Let's write a memoized selector that returns that filtered list of todos.

We know we need the entire `todos` array as one argument to our output selector. We also need to pass in the current completion status filter value as well. We'll add a separate "input selector" to extract each value, and pass the results to the "output selector".

```js title="src/features/todos/todosSlice.js"
import { createSelector } from 'reselect'
import { StatusFilters } from '../filters/filtersSlice'

// omit other code

// highlight-start
export const selectFilteredTodos = createSelector(
  // First input selector: all todos
  state => state.todos,
  // Second input selector: current status filter
  state => state.filters.status,
  // Output selector: receives both values
  (todos, status) => {
    if (status === StatusFilters.All) {
      return todos
    }

    const completedStatus = status === StatusFilters.Completed
    // Return either active or completed todos based on filter
    return todos.filter(todo => todo.completed === completedStatus)
  }
)
// highlight-end
```

:::caution

Note that we've just added an import dependency between two slices - the `todosSlice` is importing a value from the `filtersSlice`. This is legal, but be careful. **If two slices _both_ try to import something from each other, you can end up with a "cyclic import dependency" problem that can cause your code to crash**. If that happens, try moving some common code to its own file and import from that file instead.

:::

Now we can use this new "filtered todos" selector as an input to another selector that returns the IDs of those todos:

```js title="src/features/todos/todosSlice.js"
export const selectFilteredTodoIds = createSelector(
  // Pass our other memoized selector as an input
  selectFilteredTodos,
  // And derive data in the output selector
  filteredTodos => filteredTodos.map(todo => todo.id)
)
```

If we switch `<TodoList>` to use `selectFilteredTodoIds`, we should then be able to mark a couple todo items as completed:

![Todo app - todos marked completed](/img/tutorials/fundamentals/todos-app-markedCompleted.png)

and then filter the list to _only_ show completed todos:

![Todo app - todos marked completed](/img/tutorials/fundamentals/todos-app-showCompleted.png)

:::info

To learn more about how to use Reselect and memoized selectors, see:

- The [Reselect docs](https://github.com/reduxjs/reselect)
- [Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance](https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/)

:::

## Normalized State

## Async Request Status

## Thunks and Promises

## What You've Learned

As you've seen, there's several additional patterns that are widely used in Redux apps. These patterns do involve writing more code, but they provide benefits like making logic reusable, encapsulating implementation details, improving app performance, and making it easier to look up data.

:::info

For more details on why these patterns exist and how Redux is meant to be used, see:

- [Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)
- [Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)

:::

Here's how our app looks after it's been fully converted to use these patterns:

**FIXME Add CodeSandbox here**

:::tip

- **Action creator functions encapsulate preparing action objects and thunks**
  - Action creators can accept arguments and contain setup logic, and return the final action object or thunk function
- **Memoized selectors help improve Redux app performance**
  - Reselect has a `createSelector` API that generates memoized selectors
  - Memoized selectors return the same result reference if given the same inputs
- **Normalized state makes it easier to find items by ID**
  - Normalized data is stored in objects instead of arrays, with item IDs as keys
- **Request status should be stored as an enum, not booleans**
  - Using enums like `'idle' | 'loading'` helps track status consistently
- **Thunks can return promises from `dispatch`**
  - Components can wait for async thunks to complete then do more work

:::

## What's Next?

Writing all this code "by hand" can be time-consuming and difficult. **That's why we recommend that you use our official [Redux Toolkit](https://redux-toolkit.js.org) package to write your Redux logic instead**.

Redux Toolkit includes APIs that **help you write all the typical Redux usage patterns, but with less code**. It also helps **prevent common mistakes** like accidentally mutating state.

In [Part 8: Modern Redux](./part-8-modern-redux.md), we'll cover how to use Redux Toolkit to simplify all the code we've written so far.
