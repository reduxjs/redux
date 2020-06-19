---
id: quick-start-part-1
title: Redux Quick Start - Part 1
sidebar_label: 'Redux Concepts and Structure'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 1: Redux Concepts and Structure

:::tip What You'll Learn

- What Redux is and why you might want to use it
- Key Redux terms and concepts
- The structure of a typical React + Redux app

:::

## Introduction

Welcome to the Redux Quick Start tutorial! This tutorial will introduce you to Redux, so that you can begin using it as quickly as possible. By the time you finish, you should be able to start building your own Redux applications using the tools and patterns you've learned here.

In Part 1 of this tutorial, we'll cover the key concepts and terms you need to know to use Redux, and we'll examine a basic React + Redux app to see how the pieces fit together.

In [Part 2](./quick-start-part-2.md), we'll use that knowledge to build a small blogging app with some real-world features, see how those pieces actually work in practice, and talk about some important patterns and guidelines for using Redux.

### How to Read This Tutorial

This page will focus on showing you _how_ to use Redux the right way, and explain just enough of the concepts so that you can understand how to build Redux apps correctly.

We've tried to keep these explanations beginner-friendly, but we do need to make some assumptions about what you know already:

:::important Prerequisites

- Familiarity with [HTML & CSS](https://internetingishard.com/).
- Familiarity with ES6 syntax and features
- Knowledge of React terminology: JSX, State, Function Components, Props, Lifecycle, and Hooks
- Knowledge of asynchronous JavaScript and making AJAX calls

:::

If you're not already comfortable with those topics, we encourage you to take some time to become comfortable with them first, and then come back to learn about Redux. We'll be here when you're ready!

You should make sure that you have the Redux DevTools extension installed in your browser:

- [Redux DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
- [Redux DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

If you'd like to know more details about specific concepts, we'll have links to other parts of the documentation that will tell you more about how Redux works and the patterns you use with Redux:

:::info Want to know more?

The [Configuring Your Store](../recipes/ConfguringYourStore.md) page has more details about setting up a Redux store

:::

We'll also have expandable "Detailed Explanation" sections, like this:

<DetailedExplanation>

Here you'll find more details about specific topics. We keep these collapsed by default so that you can focus on the main tutorial instructions without being distracted.

</DetailedExplanation>

## What is Redux?

It helps to understand what this "Redux" thing is in the first place. What does it do? What problems does it help me solve? Why would I want to use it?

**Redux is a pattern and library for managing and updating application state, using events called "actions".** It serves as a centralized store for state that needs to be used across your entire application, with rules ensuring that the state can only be updated in a predictable fashion.

### Why Should I Use Redux?

Redux helps you manage "global" state - state that is needed across many parts of your application.

The patterns and tools provided by Redux make it easier to understand when, where, why, and how the state in your application is being updated, and how your application logic will behave when those changes occur. Redux guides you towards writing code that is predictable and testable, which helps give you confidence that your application will work as expected.

### When Should I Use Redux?

Redux helps you deal with shared state management, but like any tool, it has tradeoffs. There's more concepts to learn, and more code to write. It also adds some indirection to your code, and asks you to follow certain restrictions. It's a trade-off between short term and long term productivity.

Redux is more useful when:

- You have large amounts of application state that are needed in many places in the app
- The app state is updated frequently over time
- The logic to update that state may be complex
- The app has a medium or large-sized codebase, and might be worked on by many people

**Not all apps need Redux. Take some time to think about the kind of app you're building, and decide what tools would be best to help solve the problems you're working on.**

:::info Want to know more?

If you're not sure whether Redux is a good choice for your app, these resources give some more guidance:

- **[Redux FAQ: When should I use Redux?](../faq/General.md#when-should-i-use-redux)**
- **[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**
- **[The Tao of Redux, Part 1 - Implementation and Intent](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**

:::

### Redux Libraries and Tools

Redux is a small standalone JS library. However, it is commonly used with several other packages:

#### React-Redux

Redux can integrate with any UI framework, and is most frequently used with React. [**React-Redux**](https://react-redux.js.org/) is our official package that lets your React components interact with a Redux store by reading pieces of state and dispatching actions to update the store.

#### Redux Toolkit

[**Redux Toolkit**](https://redux-toolkit.js.org) is our recommended approach for writing Redux logic. It contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

#### Redux DevTools Extension

The [**Redux DevTools Extension**](https://github.com/zalmoxisus/redux-devtools-extension) shows a history of the changes to the state in your Redux store over time. This allows you to debug your applications effectively, including using powerful techniques like "time-travel debugging".

## Redux Terms and Concepts

Before we dive into some actual code, let's talk about some of the terms and concepts you'll need to know to use Redux.

### Understanding State Management

Let's start by looking at a React counter component:

```jsx
function Counter() {
  // State: a counter value
  const [counter, setCounter] = useState(0)

  // Action: code that causes an update to the state when something happens
  const increment = () => {
    setCounter(prevCounter => prevCounter + 1)
  }

  // View: the UI definition
  return (
    <div>
      Value: {counter} <button onClick={increment}>Increment</button>
    </div>
  )
}
```

It is a self-contained app with the following parts:

- The **state**, the source of truth that drives our app;
- The **view**, a declarative description of the UI based on the current state
- The **actions**, the events that occur in the app based on user input, and trigger updates in the state

This is a small example of **"one-way data flow"**:

- State describes the condition of the app at a specific point in time
- The UI is rendered based on that state
- When something happens (such as a user clicking a button), the state is updated based on what occurred
- The UI re-renders based on the new state

![One-way data flow](/img/tutorials/one-way-data-flow.png)

However, the simplicity can break down when we have **multiple components that need to share and use the same state**, especially if those components are located in different parts of the application. Sometimes this can be solved by ["lifting state up"](https://reactjs.org/docs/lifting-state-up.html) to parent components, but that doesn't always help.

So why don't we extract the shared state out of the components, and manage it in a global singleton? With this, our component tree becomes a big "view", and any component can access the state or trigger actions, no matter where they are in the tree!

By defining and separating the concepts involved in state management and enforcing rules that maintain independence between views and states, we give our code more structure and maintainability.

This is the basic idea behind Redux: a single centralized place to contain the global state in your application, and specific patterns to follow when updating that state to make the code predictable.

### Terminology

There's some important Redux terms that you'll need to be familiar with before we continue:

#### Actions

An **action** is a plain JavaScript object that has a `type` field. **You can think of an action as an event that describes something that happened in the application**.

The `type` field should be a string that gives this action a descriptive name, like `"todos/todoAdded"`. We usually write that type string like `"domain/eventName"`, where the first part is the feature or category that this action belongs to, and the second part is the specific thing that happened.

An action object can have other fields with additional information about what happened. By convention, we put that information in a field called `payload`.

A typical action object might look like this:

```js
const addTodoAction = {
  type: 'todos/todoAdded',
  payload: 'Buy milk'
}
```

#### Action Creators

An **action creator** is a function that creates and returns an action object. We typically use these so we don't have to write the action object by hand every time:

```js
const addTodo = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

#### Reducers

A **reducer** is a function that receives the current `state` and an `action` object, decides how to update the state if necessary, and returns the new state: `(state, action) => newState`.

:::info

"Reducer" functions get their name because they're similar to the kind of callback function you pass to the [`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) method.

:::

Reducers must _always_ follow some specific rules:

- They should only calculate the new state value based on the `state` and `action` arguments
- They are not allowed to modify the existing `state`. Instead, they must make _immutable updates_, by copying the existing `state` and making changes to the copied values.
- They must not do any asynchronous logic, calculate random values, or cause other "side effects"

We'll talk more about the rules of reducers later, including why they're important and how to follow them correctly.

Here's a small example of a reducer, showing the steps that each reducer should follow:

```js
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  // Check to see if the reducer cares about this action
  if (action.type === 'counter/increment') {
    // If so, make a copy of `state`
    return {
      ...state,
      // and update the copy with the new value
      value: state.value + 1
    }
  }
  // otherwise return the existing state unchanged
  return state
}
```

Reducers can use any kind of logic inside to decide what the new state should be: `if/else`, `switch`, loops, and so on.

<DetailedExplanation title="Detailed Explanation: Why Are They Called 'Reducers?'" >

The [`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) method lets you take an array of values, process each item in the array one at a time, and return a single final result. You can think of it as "reducing the array down to one value".

`Array.reduce()` takes a callback function as an argument, which will be called one time for each item in the array. It takes two arguments:

- `previousResult`, the value that your callback returned last time
- `currentItem`, the current item in the array

The first time that the callback runs, there isn't a `previousResult` available, so we need to also pass in an initial value that will be used as the first `previousResult`.

If we wanted to add together an array of numbers to find out what the total is, we could write a reduce callback that looks like this:

```js
const numbers = [2, 5, 8]

const addNumbers = (previousResult, currentItem) => {
  console.log({ previousResult, currentItem })
  return previousResult + currentItem
}

const initialValue = 0

const total = numbers.reduce(addNumbers, initialValue)
// {previousResult: 0, currentItem: 2}
// {previousResult: 2, currentItem: 5}
// {previousResult: 7, currentItem: 8}

console.log(total)
// 15
```

Notice that this `addNumber` "reduce callback" function doesn't need to keep track of anything itself. It takes the `previousResult` and `currentItem` arguments, does something with them, and returns a new result value.

**A Redux reducer function is exactly the same idea as this "reduce callback" function!** It takes a "previous result" (the `state`), and the "current item" (the `action` object), decides a new state value based on those arguments, and returns that new state.

If we were to create an array of Redux actions, call `reduce()`, and pass in a reducer function, we'd get a final result the same way:

```js
const actions = [
  { type: 'counter/increment' },
  { type: 'counter/increment' },
  { type: 'counter/increment' }
]

const initialState = { value: 0 }

const finalResult = actions.reduce(counterReducer, initialState)
console.log(finalResult)
// {value: 3}
```

We can say that **Redux reducers reduce a set of actions (over time) into a single state**. The difference is that with `Array.reduce()` it happens all at once, and with Redux, it happens over the lifetime of your running app.

</DetailedExplanation>

#### Store

The current Redux application state lives in an object called the **store** .

The store is created by passing in a reducer, and has a method called `getState` that returns the current state value:

```js
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({ reducer: counterReducer })

console.log(store.getState())
// {value: 0}
```

#### Dispatch

The Redux store has a method called `dispatch`. **The only way to update the state is to call `store.dispatch()` and pass in an action object**. The store will run its reducer function and save the new state value inside, and we can call `getState()` to retrieve the updated value:

```js
store.dispatch({ type: 'counter/increment' })

console.log(store.getState())
// {value: 1}
```

**You can think of dispatching actions as "triggering an event"** in the application. Something happened, and we want the store to know about it. Reducers act like event listeners, and when they hear an action they are interested in, they update the state in response.

We typically call action creators to dispatch the right action:

```js
const increment = () => {
  return {
    type: 'counter/increment'
  }
}

store.dispatch(increment())

console.log(store.getState())
// {value: 2}
```

#### Selectors

**Selectors** are functions that know how to extract specific pieces of information from a store state value. As an application grows bigger, this can help avoid repeating logic as different parts of the app need to read the same data:

```js
const selectCounterValue = state => state.value

const currentValue = selectCounterValue(store.getState())
console.log(currentValue)
// 2
```

### Redux Application Data Flow

Earlier, we talked about "one-way data flow", which describes this sequence of steps to update the app:

- State describes the condition of the app at a specific point in time
- The UI is rendered based on that state
- When something happens (such as a user clicking a button), the state is updated based on what occurred
- The UI re-renders based on the new state

For Redux specifically, we can break these steps into more detail:

- Initial setup:
  - A Redux store is created using a root reducer function
  - The store calls the root reducer once, and saves the return value as its initial `state`
  - When the UI is first rendered, UI components access the current state of the Redux store, and use that data to decide what to render. They also subscribe to any future store updates so they can know if the state has changed.
- Updates:
  - Something happens in the app, such as a user clicking a button
  - The app code dispatches an action to the Redux store, like `dispatch({type: 'counter/increment'})`
  - The store runs the reducer function again with the previous `state` and the current `action`, and saves the return value as the new `state`
  - The store notifies all parts of the UI that are subscribed that the store has been updated
  - Each UI component that needs data from the store checks to see if the parts of the state they need have changed.
  - Each component that sees its data has changed forces a re-render with the new data, so it can update what's shown on the screen

## Examining a React and Redux App

Now that you know the pieces that make up a Redux app, let's look at a real working example to see how these pieces fit together.

### The Counter Example App

The sample project we'll look at is a small counter application that lets us add or subtract from a number as we click buttons. It may not be very exciting, but it shows all the important pieces of a React+Redux application in action.

The project has been created using [the official Redux template for Create-React-App](https://github.com/reduxjs/cra-template-redux). Out of the box, it has already been configured with a standard Redux application structure, using [Redux Toolkit](https://redux-toolkit.js.org) to create the Redux store and logic, and [React-Redux](https://react-redux.js.org) to connect together the Redux store and the React components.

Here's the live version of the project. You can play around with it by clicking the buttons in the app preview on the right, and browse through the source files on the left.

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quick-start-example/tree/master/?fontsize=14&hidenavigation=1&module=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.js&theme=dark"
  title="redux-quick-start-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

If you'd like to try create this project on your own computer, you can [start a new Create-React-App project](https://create-react-app.dev/docs/getting-started#selecting-a-template) using our Redux template:

```
npx create-react-app redux-quickstart-example --template redux
```

#### Using the Counter App

The counter app has already been set up to let us watch what happens inside as we use it.

Try right-clicking inside the app preview in your browser, and choose "Inspect" from the menu to open up your browser's DevTools. Then, choose the "Redux" tab in the DevTools, and click the "State" button in the upper-right toolbar. You should see something that looks like this:

![Redux DevTools: initial app state](/img/tutorials/quickstart-devtools-initial.png)

On the right, we can see that our Redux store is starting off with an app state value that looks like this:

```js
{
  counter: {
    value: 0
  }
}
```

The DevTools will show us how the store state changes as we use the app.

Let's play with the app first to see what it does. Click the "+" button in the app, then look at the "Diff" tab in the Redux DevTools:

![Redux DevTools: first dispatched action](/img/tutorials/quickstart-devtools-first-action.png)

We can see two important things here:

- When we clicked the "+" button, an action with a type of `"counter/increment"` was dispatched to the store
- When that action was dispatched, the `state.counter.value` field changed from `0` to `1`

Now try these steps:

- Click the "+" button again. The displayed value should now be 2.
- Click the "-" button once. The displayed value should now be 1.
- Click the "Add Amount" button. The displayed value should now be 3.
- Change the number "2" in the textbox to a "3"
- Click the "Add Async" button. You should see a progress bar fill the button, and after a couple seconds, the displayed value should change to 6.

Go back to the Redux DevTools. You should see a total of five actions dispatched, one for each time we clicked a button . Now select the last `"counter/increment"` entry from the list on the left, and click the "Action" tab on the right side:

![Redux DevTools: done clicking buttons](/img/tutorials/quickstart-devtools-done-clicking.png)

We can see that this action object looked like this:

```js
{
  type: 'counter/incrementByAmount',
  payload: 3
}
```

And if you click the "Diff" tab, you can see that the `state.counter.value` field changed from a `3` to a `6` in response to that action.

The ability to see what is happening inside of our app and how our state is changing over time is very powerful!

The DevTools have several more commands and options to help you debug your app, and we'll look at a couple of those later.

### Creating the Redux Store

Now that you know what the app does, let's look at how it works.

Here are the key files that make up this application:

- `/src`
  - `index.js`: the starting point for the app
  - `App.js`: the top-level React component
  - `/app`
    - `store.js`: creates the Redux store instance
  - `/features`
    - `/counter`
      - `Counter.js`: a React component that shows the UI for the counter feature
      - `counterSlice.js`: the Redux logic for the counter feature

Let's start by looking at how the Redux store is created.

Open up `app/store.js`, which should look like this:

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

export default configureStore({
  reducer: {
    counter: counterReducer
  }
})
```

The Redux store is created using the `configureStore` function from Redux Toolkit. `configureStore` requires that we pass in a `reducer` argument.

Our application might be made up of many different features, and each of those features might have its own reducer function. When we call `configureStore`, we can pass in all of the different reducers in an object. The key names in the object will define the keys in our final state value.

We have a file named `features/counter/counterSlice.js` that exports a reducer function for the counter logic. We can import that `counterReducer` function here, and include it when we create the store.

When we pass in an object like `{counter: counterReducer}`, that says that we want to have a `state.counter` section of our Redux state object, and that we want the `counterReducer` function to be in charge of deciding if and how to update the `state.counter` section whenever an action is dispatched.

#### Redux Slices

**A "slice" is a collection of Redux reducer logic and actions for a single feature in your app**, typically defined together in a single file. The name comes from splitting up the root Redux state object into multiple "slices" of state.

For example, in a blogging app, our store setup might look like:

```js
import { configureStore } from '@reduxjs/toolkit'
import usersReducer from '../features/users/usersSlice'
import postsReducer from '../features/posts/postsSlice'
import commentsReducer from '../features/comments/commentsSlice'

export default configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer,
    comments: commentsReducer
  }
})
```

In that example, `state.users`, `state.posts`, and `state.comments` are each a separate "slice" of the Redux state. Since `usersReducer` is responsible for updating the `state.users` slice, we refer to it as a "slice reducer" function.

<DetailedExplanation title="Detailed Explanation: Reducers and State Structure">

A Redux store needs to have a single "root reducer" function passed in when it's created. So if we have many different slice reducer functions, how do we get a single root reducer instead, and how does this define the contents of the Redux store state?

If we tried calling all of the slice reducers by hand, it might look like this:

```js
function rootReducer(state = {}, action) {
  return {
    users: usersReducer(state.users, action),
    posts: postsReducer(state.posts, action),
    comments: commentsReducer(state.comments, action)
  }
}
```

That calls each slice reducer individually, passes in the specific slice of the Redux state, and includes each return value in the final new Redux state object.

Redux has a function called [`combineReducers`](../../api/combineReducers.md) that does this for us automatically. It accepts an object full of slice reducers as its argument, and returns a function that calls each slice reducer whenever an action is dispatched. The result from each slice reducer are all combined together into a single object as the final result. We can do the same thing as the previous example using `combineReducers`:

```js
const rootReducer = combineReducers({
  users: usersReducer,
  posts: postsReducer,
  comments: commentsReducer
})
```

When we pass an object of slice reducers to `configureStore`, it passes those to `combineReducers` for us to generate the root reducer.

As we saw earlier, you can also pass a reducer function directly as the `reducer` argument:

```js
const store = configureStore({
  reducer: rootReducer
})
```

</DetailedExplanation>

### Creating Slice Reducers and Actions

Since we know that the `counterReducer` function is coming from `features/counter/counterSlice.js`, let's see what's in that file, piece by piece.

```js title="features/counter/counterSlice.js"
import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default counterSlice.reducer
```

Earlier, we saw that clicking the different buttons in the UI dispatched three different Redux action types:

- `{type: "counter/increment"}`
- `{type: "counter/decrement"}`
- `{type: "counter/incrementByAmount"}`

We know that actions are plain objects with a `type` field, that the `type` field is always a string, and that we typically have "action creator" functions that create and return the action objects. So where are those action objects, type strings, and action creators defined?

We _could_ write those all by hand, every time. But, that would be tedious. Besides, what's _really_ important in Redux is the reducer functions, and the logic they have for calculating new state.

Redux Toolkit has a function called `createSlice`, which takes care of the work of generating action type strings, action creator functions, and action objects. All you have to do is define a name for this slice, write an object that has some reducer functions in it, and it generates the corresponding action code automatically. The string from the `name` option is used as the first part of each action type, and the key name of each reducer function is used as the second part. So, the `"counter"` name + the `"increment"` reducer function generated an action type of `{type: "counter/increment"}`. (After all, why write this by hand if the computer can do it for us!)

In addition to the `name` field, `createSlice` needs us to pass in the initial state value for the reducers, so that there is a `state` the first time it gets called. In this case, we're providing an object with a `value` field that starts off at 0.

We can see here that there are three reducer functions, and that corresponds to the three different action types that were dispatched by clicking the different buttons.

`createSlice` automatically generates action creators with the same names as the reducer functions we wrote. We can check that by calling one of them and seeing what it returns:

```js
console.log(counterSlice.actions.increment())
// {type: "counter/increment"}
```

It also generates the slice reducer function that knows how to respond to all these action types:

```js
const newState = counterSlice.reducer(
  { value: 10 },
  counterSlice.actions.increment()
)
console.log(newState)
// {value: 11}
```

### Rules of Reducers

We said earlier that reducers must **always** follow some special rules:

- They should only calculate the new state value based on the `state` and `action` arguments
- They are not allowed to modify the existing `state`. Instead, they must make _immutable updates_, by copying the existing `state` and making changes to the copied values.
- They must not do any asynchronous logic or other "side effects"

But why are these rules important? There's a few different reasons:

- One of the goals of Redux is to make your code predictable. When a function's output is only calculated from the input arguments, it's easier to understand how that code works, and to test it.
- On the other hand, if a function depends on variables outside itself, or behaves randomly, you never know what will happen when you run it.
- If a function modifies other values, including its arguments, that can change the way the application works unexpectedly. This can be a common source of bugs, such as "I updated my state, but now my UI isn't updating when it should!"
- Some of the Redux DevTools capabilities depend on having your reducers follow these rules correctly

The rule about "immutable updates" is particularly important, and worth talking about further.

### Reducers and Immutable Updates

If something is "immutable", it can never change. JavaScript objects and arrays are all mutable by default. If I create an object, I can change the contents of its fields. If I create an array, I can change the contents as well:

```js
const obj = { a: 1, b: 2 }
// still the same object outside, but the contents have changed
obj.b = 3

const arr = ['a', 'b']
// In the same way, we can change the contents of this array
arr.push('c')
arr[1] = 'd'
```

This is called _mutating_ the object or array.

:::warning

In Redux, **our reducers are _never_ allowed to mutate the original / current state values!**

:::

So if we can't change the originals, how do we return an updated state?

:::tip

**Reducers can only make _copies_ of the original values, and then they can mutate the copies.**

:::

We can do this by hand using JavaScript's array / object spread operators, as well as array methods that return new copies of the array instead of mutating the original array:

```js
const obj1 = {
  a: {
    // To safely update obj.a.c, we have to copy each piece
    c: 3
  }
  b: 2,
}


const obj2 = {
  // copy obj
  ...obj
  // overwrite a
  a: {
    // copy obj.a
    ...obj.a,
    // overwrite c
    c: 42
  }
}

const arr = ["a", "b"];
// Create a new copy of arr, with "c" appended to the end
const arr2 = arr.concat("c");

// or, we can make a copy of the original array:
const arr3 = arr.slice();
// and mutate the copy:
arr3.push("c");
```

If you're thinking that "this looks hard to remember and do correctly"... yeah, you're right! :)

Writing immutable update logic by hand _is_ hard, and accidentally mutating state in reducers is the single most common mistake Redux users make.

**That's why Redux Toolkit's `createSlice` function lets you write immutable updates an easier way!**

`createSlice` uses a library called [Immer](https://immerjs.github.io/immer/docs/introduction) inside. Immer uses a special JS tool called a `Proxy` to wrap the data you provide, and lets you write code that "mutates" that wrapped data. But, Immer tracks all the changes you've tried to make, and then uses that list of changes to return a safely immutably updated value, as if you'd written all the immutable update logic by hand.

So, instead of this:

```js
function handwrittenReducer(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```

You can write code that looks like this:

```js
function reducerWithImmer(state, action) {
  state.first.second[action.someId].fourth = action.someValue
}
```

That's a lot easier to read!

But, here's something _very_ important to remember:

:::warning

**You can _only_ write "mutating" logic in Redux Toolkit's `createSlice` and `createReducer` because they use Immer inside! If you write mutating logic in reducers without Immer, it _will_ mutate the state and cause bugs!**

:::

With that in mind, let's go back and look at the actual reducers from the counter slice.

```js title="features/counter/counterSlice.js"
export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      // highlight-next-line
      state.value += action.payload
    }
  }
})
```

We can see that the `increment` reducer will always add 1 to `state.value`. Because Immer knows we've made changes to the draft `state` object, we don't have to actually return anything here. In the same way, the `decrement` reducer subtracts 1.

In both of those reducers, we don't actually need to have our code look at the `action` object. It will be passed in anyway, but since we don't need it, we can skip declaring `action` as a parameter for the reducers.

On the other hand, the `incrementByAmount` reducer _does_ need to know something: how much it should be adding to the counter value. So, we declare the reducer as having both `state` and `action` arguments. In this case, we know that the amount we typed into the textbox is being put into the `action.payload` field, so we can add that to `state.value`.

:::info Want to Know More?

For more information on immutability and writing immutable updates, see [the "Immutable Update Patterns" docs page](../../recipes/structuring-reducers/ImmutableUpdatePatterns.md) and [The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/).

:::

### Writing Async Logic with Thunks

The next function that's exported from `counterSlice` might look a bit strange:

```js title="features/counter/counterSlice.js"
// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched
export const incrementAsync = amount => dispatch => {
  setTimeout(() => {
    dispatch(incrementByAmount(amount))
  }, 1000)
}
```

A **thunk** is a special kind of Redux function that can contain asynchronous logic. Thunks are written using two functions:

- An inside thunk function, which gets `dispatch` and `getState` as arguments
- The outside creator function, which creates and returns the thunk function

We can use them the same way we use a typical Redux action creator:

```js
store.dispatch(incrementAsync(5))
```

However, thunks require a special kind of addon called _middleware_ to be added to the Redux store when it's created. Fortunately, Redux Toolkit's `configureStore` function already sets that up for us automatically, so we can go ahead and use this.

When you need to make AJAX calls to fetch data from the server, you can put that call in a thunk. Here's an example that's written a bit longer, so you can see how it's defined:

```js title="features/counter/counterSlice.js"
// the outside "thunk creator" function
const fetchUserById = userId => {
  // the inside "thunk function"
  return async (dispatch, getState) => {
    try {
      // make an async call in the thunk
      const user = userAPI.fetchById(userId)
      // dispatch an action when we get the response back
      dispatch(userLoaded(user))
    } catch (err) {
      // If something went wrong, handle it here
    }
  }
}
```

We'll see thunks being used in Part 2 of this tutorial.

<DetailedExplanation title="Detailed Explanation: Thunks and Async Logic">

We know that we're not allowed to put any kind of async logic in reducers. But, that logic has to live somewhere.

If we have access to the Redux store, we could write some async code and call `store.dispatch()` when we're done:

```js
const store = configureStore({ reducer: counterReducer })

setTimeout(() => {
  store.dispatch(increment())
}, 250)
```

But, in a real Redux app, we're not allowed to import the store into other files, especially in our React components.

In addition, we often need to write some async logic that we know will be used with _some_ store, eventually, but we don't know _which_ store.

The Redux store can be extended with "middleware", which are a kind of add-on or plugin that can add extra abilities. The most common reason to use middleware is to let you write code that can have async logic, but still talk to the store at the same time. They can also modify the store so that we can call `dispatch()` and pass in values that are _not_ plain action objects, like functions or Promises.

The Redux Thunk middleware modifies the store to let you pass functions into `dispatch`. In fact, it's short enough we can paste it here:

```js
const thunkMiddleware = ({ dispatch, getState }) => next => action => {
  if (typeof action === 'function') {
    return action(dispatch, getState, extraArgument)
  }

  return next(action)
}
```

It looks to see if the "action" that was passed into `dispatch` is actually a function instead of a plain action object. If it's actually a function, it calls the function, and returns the result. Otherwise, since this must be an action object, it passes the action forward to the store.

This gives us a way to write whatever sync or async code we want, while still having access to `dispatch` and `getState`.

</DetailedExplanation>

There's one more function in this file, but we'll talk about that in a minute when we look at the `<Counter>` UI component.

:::info Want to Know More?

See [the Redux Thunk docs](https://github.com/reduxjs/redux-thunk), the post [What the heck is a thunk?](https://daveceddia.com/what-is-a-thunk/) and the [Redux FAQ entry on "why do we use middleware for async?"](../../faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior) for more information.

:::

### The React Counter Component

Earlier, we saw what a standalone React `<Counter>` component looks like. Our React+Redux app has a similar `<Counter>` component, but it does a few things differently.

We'll start by looking at the `Counter.js` component file:

```jsx title="features/counter/Counter.js"
import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  decrement,
  increment,
  incrementByAmount,
  incrementAsync,
  selectCount
} from './counterSlice'
import styles from './Counter.module.css'

export function Counter() {
  const count = useSelector(selectCount)
  const dispatch = useDispatch()
  const [incrementAmount, setIncrementAmount] = useState('2')

  return (
    <div>
      <div className={styles.row}>
        // highlight-start
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
        // highlight-end
        <span className={styles.value}>{count}</span>
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
      </div>
      {/* omit additional rendering output here */}
    </div>
  )
}
```

Like with the earlier plain React example, we have a function component called `Counter`, that stores some data in a `useState` hook.

However, in our component, it doesn't look like we're storing the actual current counter value as state. There _is_ a variable called `count`, but it's not coming from a `useState` hook.

While React includes several built-in hooks like `useState` and `useEffect`, other libraries can create their own [custom hooks](https://reactjs.org/docs/hooks-custom.html) that use React's hooks to build custom logic.

The [React-Redux library](https://react-redux.js.org/) has [a set of custom hooks that allow your React component to interact with a Redux store](https://react-redux.js.org/api/hooks).

#### Reading Data with `useSelector`

First, the `useSelector` hook lets our component extract whatever pieces of data it needs from the Redux store state.

Earlier, we saw that we can write "selector" functions, which take `state` as an argument and return some part of the state value.

Our `counterSlice.js` has this selector function at the bottom:

```js  title="features/counter/counterSlice.js"
// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectCount = state => state.counter.value
```

If we had access to a Redux store, we could retrieve the current counter value as:

```js
const count = selectCount(store.getState())
console.log(count)
// 0
```

Our components can't talk to the Redux store directly, because we're not allowed to import it into component files. But, `useSelector` takes care of talking to the Redux store behind the scenes for us. If we pass in a selector function, it calls `someSelector(store.getState())` for us, and returns the result.

So, we can get the current store counter value by doing:

```js
const count = useSelector(selectCount)
```

We don't have to _only_ use selectors that have already been exported, either. For example, we could write a selector function as an inline argument to `useSelector`:

```js
const countPlusTwo = useSelector(state => state.counter.value + 2)
```

Any time an action has been dispatched and the Redux store has been updated, `useSelector` will re-run our selector function. If the selector returns a different value than last time, `useSelector` will make sure our component re-renders with the new value.

#### Dispatching Actions with `useDispatch`

Similarly, we know that if we had access to a Redux store, we could dispatch actions using action creators, like `store.dispatch(increment())`. Since we don't have access to the store itself, we need some way to have access to just the `dispatch` method.

The `useDispatch` hook does that for us, and gives us the actual `dispatch` method from the Redux store:

```js
const dispatch = useDispatch()
```

From there, we can dispatch actions when the user does something like clicking on a button:

```jsx  title="features/counter/Counter.js"
<button
  className={styles.button}
  aria-label="Increment value"
  onClick={() => dispatch(increment())}
>
  +
</button>
```

### Component State and Forms

By now you might be wondering, "Do I always have to put all my app's state into the Redux store?"

The answer is **NO. Global state that is needed across the app should go in the Redux store. State that's only needed in one place should be kept in component state.**

In this example, we have an input textbox where the user can type in the next number to be added to the counter:

```jsx title="features/counter/Counter.js"
const [incrementAmount, setIncrementAmount] = useState('2')

// later
return (
  <div className={styles.row}>
    <input
      className={styles.textbox}
      aria-label="Set increment amount"
      value={incrementAmount}
      onChange={e => setIncrementAmount(e.target.value)}
    />
    <button
      className={styles.button}
      onClick={() => dispatch(incrementByAmount(Number(incrementAmount) || 0))}
    >
      Add Amount
    </button>
    <button
      className={styles.asyncButton}
      onClick={() => dispatch(incrementAsync(Number(incrementAmount) || 0))}
    >
      Add Async
    </button>
  </div>
)
```

We _could_ keep the current number string in the Redux store, by dispatching an action in the input's `onChange` handler and keeping it in our reducer. But, that doesn't give us any benefit. The only place that text string is used is here, in the `<Counter>` component. (Sure, there's only one other component in this example: `<App>`. But even if we had a larger application with many components, only `<Counter>` cares about this input value.)

So, it makes sense to keep that value in a `useState` hook here in the `<Counter>` component.

Similarly, if we had a boolean flag called `isDropdownOpen`, no other components in the app would care about that - it should really stay local to this component.

**In a React + Redux app, your global state should go in the Redux store, and your local state should stay in React components.**

If you're not sure where to put something, here are some common rules of thumb for determining what kind of data should be put into Redux:

- Do other parts of the application care about this data?
- Do you need to be able to create further derived data based on this original data?
- Is the same data being used to drive multiple components?
- Is there value to you in being able to restore this state to a given point in time (ie, time travel debugging)?
- Do you want to cache the data (ie, use what's in state if it's already there instead of re-requesting it)?
- Do you want to keep this data consistent while hot-reloading UI components (which may lose their internal state when swapped)?

This is also a good example of how to think about forms in Redux in general. **Most form state probably shouldn't be kept in Redux.** Instead, keep the data in your form components as you're editing it, and then dispatch Redux actions to update the store when the user is done.

One other thing to note before we move on: remember that `incrementAsync` thunk from `counterSlice.js`? We're using it here in this component. Notice that we use it the same way we dispatch the other normal action creators. This component doesn't care whether we're dispatching a normal action or starting some async logic. It only knows that when you click that button, it dispatches something.

### Providing the Store

We've seen that our components can use the `useSelector` and `useDispatch` hooks to talk to the Redux store. But, since we didn't import the store, how do those hooks know what Redux store to talk to?

Now that we've seen all the different pieces of this application, it's time to circle back to the starting point of this application and see how the last pieces of the puzzle fit together.

```jsx title="src/components/HelloCodeTitle.js"
function HelloCodeTitle(props) {
  return <h1>Hello, {props.name}</h1>
}
```

```jsx  title="index.js"
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import store from './app/store'
// highlight-next-line
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  // highlight-start
  <Provider store={store}>
    <App />
  </Provider>,
  // highlight-end
  document.getElementById('root')
)
```

We always have to call `ReactDOM.render(<App />)` to tell React to start rendering our root `<App>` component. In order for our hooks like `useSelector` to work right, we need to use a component called `<Provider>` to pass down the Redux store behind the scenes so they can access it.

We already created our store in `app/store.js`, so we can import it here. Then, we put our `<Provider>` component around the whole `<App>`, and pass in the store: `<Provider store={store}>`.

Now, any React components that call `useSelector` or `useDispatch` will be talking to the Redux store we gave to the `<Provider>`.
