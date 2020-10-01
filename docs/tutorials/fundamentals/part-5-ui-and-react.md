---
id: part-5-ui-react
title: 'Redux Fundamentals, Part 5: UI and React'
sidebar_label: 'UI and React'
hide_title: true
description: 'The official Redux Fundamentals tutorial: learn how to use Redux with React'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Redux Fundamentals, Part 4: Store

:::tip What You'll Learn

- How a Redux store works with a UI
- How to use Redux with React

:::

## Introduction

In [Part 4](./part-4-store.md), we saw how to create a Redux store, dispatch actions, and read the current state. We also looked at how a store works inside, how enhancers and middleware let us customize the store with additional abilities, and how to add the Redux DevTools to let us see what's happening inside our app as actions are dispatched.

In this section, we'll add a User Interface for our todo app. We'll see how Redux works with a UI layer overall, and we'll specifically cover how Redux works together with React.

## Integrating Redux with a UI

Redux is a standalone JS library. As we've already seen, you can create and use a Redux store even if you don't have a user interface set up. This also means that **you can use Redux with any UI framework**. You can write Redux apps with React, Vue, Angular, Ember, jQuery, or vanilla JavaScript.

That said, Redux was specifically designed to work well with [React](https://reactjs.org). React lets you describe your UI as a function of your state, and Redux contains state and updates it in response to actions.

Because of that, we'll use React for this tutorial as we build our todo app, and cover the basics of how to use React with Redux.

Before we get to that part, let's take a quick look at how Redux interacts with a UI layer in general.

### Basic Redux and UI Integration

Using Redux with any UI layer requires a few consistent steps:

1. Create a Redux store
2. Subscribe to updates
3. Inside the subscription callback:
   1. Get the current store state
   2. Extract the data needed by this piece of UI
   3. Update the UI with the data
4. If necessary, render the UI with initial state
5. Respond to UI inputs by dispatching Redux actions

Let's go back to the [the counter app example we saw in Part 1](./part-1-overview.md) and see how it follows those steps:

```js
// 1) Create a new Redux store with the `createStore` function
const store = Redux.createStore(counterReducer)

// 2) Subscribe to redraw whenever the data changes in the future
store.subscribe(render)

// Our "user interface" is some text in a single HTML element
const valueEl = document.getElementById('value')

// 3) When the subscription callback runs:
function render() {
  // 3.1) Get the current store state
  const state = store.getState()
  // 3.2) Extract the data you want
  const newValue = state.value.toString()

  // 3.3) Update the UI with the new value
  valueEl.innerHTML = newValue
}

// 4) Display the UI with the initial store state
render()

// 5) Dispatch actions based on UI inputs
document.getElementById('increment').addEventListener('click', function () {
  store.dispatch({ type: 'counter/incremented' })
})
```

No matter what UI layer you're using, **Redux works this same way with every UI**. The actual implementations are typically a bit more complicated to help optimize performance, but it's the same steps each time.

Since Redux is a separate library, there are different "binding" libraries to help you use Redux with a given UI framework. Those UI binding libraries handle the details of subscribing to the store and efficiently updating the UI as state changes, so that you don't have to write that code yourself.

## Using Redux with React

The official [**React-Redux UI bindings library**](https://react-redux.js.org) is a separate package from the Redux core. You'll need to install that in addition as well:

```sh
npm install react-redux
```

(If you don't use npm, you may grab the latest UMD build from unpkg (either a [development](https://unpkg.com/react-redux@latest/dist/react-redux.js) or a [production](https://unpkg.com/react-redux@latest/dist/react-redux.min.js) build). The UMD build exports a global called `window.ReactRedux` if you add it to your page via a `<script>` tag.)

For this tutorial, we'll cover the most important patterns and examples you need to use React and Redux together, and see how they work in practice as part of our todo app.

:::info

See **the official React-Redux docs at https://react-redux.js.org** for a complete guide on how to use Redux and React together, and reference documentation on the React-Redux APIs.

:::

### Designing the Component Tree

Much like we [designed the state structure](./part-3-state-actions-reducers.md#designing-the-state-structure) based on requirements, we can also design the overall set of UI components and how they related to each other in the application.

Based on [the list of business requirements for the app](./part-3-state-actions-reducers.md#defining-requirements), at a minimum we're going to need this set of components:

- **`<App>`**: the root component that renders everything else.
  - **`<Header>`**: contains the "new todo" text input and the "complete all todos" checkbox
  - **`<TodoList>`**: a list of all currently visible todo items, based on the filtered results
    - **`<TodoListItem>`**: a single todo list item, with a checkbox that can be clicked to toggle the todo's completed status, and a color category selector
  - **`<Footer>`**: Shows the number of active todos and controls for filtering the list based on completed status and color category

Beyond this basic component structure, we could potentially divide the components up in several different ways. For example, the `<Footer>` component _could_ be just one component, or it could have multiple smaller components inside like `<CompletedTodos>`, `<StatusFilter>`, and `<ColorFilter>`. There's no single right way to divide these, and you'll find that it may be better to write larger components or split things into many smaller components depending on your situation.

For now, we'll start with just this small list of components to keep things easier to follow. On that note, since we assume that [you already know React](https//reactjs.org), we're going to skip past the details of how to write the layout code for these components and focus on how to actually use the React-Redux library in your React components

You can see [the complete source code for the app in this CodeSandbox **TODO create sandbox**](.)

### Reading State from the Store with `useSelector`

We know that we need to be able to show a list of todo items. Let's start by creating a `<TodoList>` component that can read the list of todos from the store, loop over them, and show one `<TodoListItem>` component for each todo entry.

You should be familiar with [React hooks like `useState`](https://reactjs.org/docs/hooks-state.html), which can be called in React function components to give them access to React state values. React also lets us write [custom hooks](https://reactjs.org/docs/hooks-custom.html), which let us extract reusable hooks to add our own behavior on top of React's built-in hooks.

Like many other libraries, React-Redux includes [its own custom hooks](https://react-redux.js.org/api/hooks), which you can use in your own components. The React-Redux hooks give your React component the ability to talk to the Redux store by reading state and dispatching actions.

The first React-Redux hook that we'll look at is [the **`useSelector`** hook](https://react-redux.js.org/api/hooks#useselector), which **lets your React components read data from the Redux store**.

`useSelector` accepts a single function, which we call a **selector** function. **A selector is a function that takes the entire Redux store state as its argument, reads some value from the state, and returns that result**.

For example, we know that our todo app's Redux state keeps the array of todo items as `state.todos`. We can write a small selector function that returns that todos array:

```js
const selectTodos = state => state.todos
```

Or, maybe we want to find out how many todos are currently marked as "completed":

```js
const selectTotalCompletedTodos = state => {
  const completedTodos = state.todos.filter(todo => todo.completed)
  return completedTodos.length
}
```

So, **selectors can return values from the Redux store state, and also return _derived_ values based on that state as well**.

Let's read the array of todos into our `<TodoList>` component. First, we'll import the `useSelector` hook from the `react-redux` library, then call it with a selector function as its argument:

```js title="src/features/todos/TodoList.js"
import { useSelector } from 'react-redux'
import TodoListItem from './TodoListItem'

const selectTodos = state => state.todos

export function TodoList() {
  const todos = useSelector(selectTodos)

  // since `todos` is an array, we can loop over it
  const todoListItems = todos.map(todo => {
    return <TodoListItem key={todo.id} todo={todo} />
  })

  return <ul className="todo-list">{todoListItems}</ul>
}
```

The first time the `<TodoList>` component renders, the `useSelector` hook will call `selectTodos` and pass in the _entire_ Redux state object. Whatever the selector returns will be returned by the hook to your component. So, the `const todos` in our component will end up holding the same `state.todos` array inside our Redux store state.

But, what happens if we dispatch an action like `{type: 'todos/todoAdded'}`? The Redux state will be updated by the reducer, but our component needs to know that something has changed so that it can re-render with the new list of todos.

We know that we can call `store.subscribe()` to listen for changes to the store, so we _could_ try writing the code to subscribe to the store in every component. But, that would quickly get very repetitive and hard to handle.

Fortunately, **`useSelector` automatically subscribes to the Redux store for us!** That way, any time an action is dispatched, it will call its selector function again right away. **If the value returned by the selector changes from the last time it ran, `useSelector` will force our component to re-render with the new data**. All we have to do is call `useSelector()` once in our component, and it does the rest of the work for us.

However, there's a very important thing to remember here:

:::caution

**`useSelector` compares its results using strict `===` reference comparisons, so the component will re-render any time the selector result is a new reference!** This means that if you create a new reference in your selector and return it, your component could re-render _every_ time an action has been dispatched, even if the data really isn't different.

:::

This selector will cause the component to _always_ re-render:

```js
// Bad: always returning a new reference
const selectTodoDescriptions = state => {
  // This creates a new array reference!
  return state.todos.map(todo => todo.text)
}
```

:::tip

We'll talk about how you can improve performance and avoid unnecessary re-renders using a special kind of selector function in [Part 7: Standard Redux Patterns](./part-7-standard-patterns.md).

:::

It's also worth noting that we don't have to write a selector function as a separate variable. You can write a selector function directly inside the call to `useSelector`, like this:

```js
const todos = useSelector(state => state.todos)
```
