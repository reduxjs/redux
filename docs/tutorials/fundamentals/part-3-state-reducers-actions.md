---
id: part-3-state-reducers-actions
title: 'Redux Fundamentals, Part 3: State, Reducers, and Actions'
sidebar_label: 'State, Reducers, and Actions'
hide_title: true
description: 'The official Fundamentals tutorial for Redux: learn the fundamentals of using Redux'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Redux Fundamentals, Part 3: State, Reducers, and Actions

:::tip What You'll Learn

- How to define state values that contain your app's data
- How to define action objects that describe what happens in your app
- How to write reducer functions that calculate updated state based on existing state and actions

:::

:::info Prerequisites

- Familiarity with key Redux terms and concepts like "actions", "reducers", "store", and "dispatching". (See **[Part 2](./part-2-concepts-data-flow.md)** for explanations of these terms.)

:::

## Introduction

In [Part 2: Redux Concepts and Data Flow](./part-2-concepts-data-flow.md), we looked at how Redux can help us build maintainable apps by giving us a single central place to put global app state. We also talked about core Redux concepts like dispatching action objects and using reducer functions that return new state values.

Now that you have some idea of what these pieces are, it's time to put that knowledge into practice. We're going to build a small example app to see how these pieces actually work together.

:::caution

The example app is not meant as a complete production-ready project. The goal is to help you learn core Redux APIs and usage patterns, and point you in the right direction using some limited examples. Also, some of the early pieces we build will be updated later on to show better ways to do things. Please read through the whole tutorial to see all the concepts in use.

:::

### Project Setup

For this tutorial, we've created a pre-configured starter project that already has React and Redux set up, includes some default styling, and has a fake REST API that will allow us to write actual API requests in our app. You'll use this as the basis for writing the actual application code.

To get started, you can open and fork this CodeSandbox:

**TODO** Create actual example app, repo, and CodeSandbox

<!--
<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/master/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
-->

You can also [clone the same project from this Github repo **TODO CREATE NEW EXAMPLE REPO**](.). After cloning the repo, you can install the tools for the project with `npm install`, and start it with `npm start`.

<!--

If you'd like to see the final version of what we're going to build, you can check out [the **`tutorial-steps` branch**](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps), or [look at the final version in this CodeSandbox](https://codesandbox.io/s/github/reduxjs/redux-essentials-example-app/tree/tutorial-steps).

-->

#### Creating a New Redux + React Project

Once you've finished this tutorial, you'll probably want to try working on your own projects. **We recommend using the [Redux templates for Create-React-App](https://github.com/reduxjs/cra-template-redux) as the fastest way to create a new Redux + React project**. It comes with Redux Toolkit and React-Redux already configured, using [a modernized version of the "counter" app example you saw in Part 1](./part-1-overview.md). This lets you jump right into writing your actual application code without having to add the Redux packages and set up the store.

If you want to know specific details on how to add Redux to a project, see this explanation:

<DetailedExplanation title="Detailed Explanation: Adding Redux to a React Project">

The Redux template for CRA comes with Redux Toolkit and React-Redux already configured. If you're setting up a new project from scratch without that template, follow these steps:

- Add the `@reduxjs/toolkit` and `react-redux` packages
- Create a Redux store using RTK's `configureStore` API, and pass in at least one reducer function
- Import the Redux store into your application's entry point file (such as `src/index.js`)
- Wrap your root React component with the `<Provider>` component from React-Redux, like:

```jsx
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

</DetailedExplanation>

#### Exploring the Initial Project

This initial project is based on [the standard Create-React-App](https://create-react-app.dev/docs/getting-started) project template, with some modifications.

Let's take a quick look at what the initial project contains:

- `/src`
  - `index.js`: the entry point file for the application. It renders the main `<App>` component.
  - `App.js`: the main application component.
  - `index.css`: styles for the complete application
  - `/api`
    - `client.js`: a small AJAX request client that allows us to make GET and POST requests
    - `server.js`: provides a fake REST API for our data. Our app will fetch data from these fake endpoints later.

If you load the app now, you should see a welcome message, but the rest of the app is otherwise empty.

With that, let's get started!

## Starting the Todo Example App

Our example application will be a small "todo" application. You've probably seen todo app examples before - they make
good examples because they let us show how to do things like tracking a list of items, handling user input, and updating
the UI when that data changes, which are all things that happen in a normal application.

### Defining Requirements

Let's start by figuring out the initial business requirements for this application:

- The UI should consist of three main sections:
  - An input box to let the user type in the text of a new todo item
  - A list of all the existing todo items
  - A footer section that shows the number of non-completed todos, and shows filtering options
- Todo list items should have a checkbox that toggles their "completed" status. We should also be able to add a color-coded
  category tag for a predefined list of colors.
- The counter should pluralize the number of active todos: "0 items", "1 item", "3 items", etc
- There should be buttons to mark all todos as completed, and to clear all completed todos by removing them
- There should be to ways to filter the displayed todos in the list:
  - Filtering based on showing "All", "Active", and "Completed" todos
  - Filtering based on selecting one or more colors, and showing any todos whose tag that match those colors

We'll add some more requirements later on, but this is enough to get us started.

### Designing the State Values

One of the core principles of React and Redux is that your UI should be based on your state. It's also a very good idea
to try to describe your UI using as few state values as possible, so there's less data you need to keep track of
and update.

Conceptually, there are two main aspects of this application:

- The actual list of current todo items
- The current filtering options

We'll also need to keep track of the data the user is typing into the "Add Todo" input box, but that's less important
and we'll handle that later.

For each todo item, we need to store a few pieces of information:

- The text the user entered
- The boolean flag saying if it's completed or not
- A unique ID value
- A color category, if selected

Our filtering behavior can probably be described with some enumerated values:

- Completed status: "All", "Active", and "Completed"
- Colors: "Red", "Yellow", "Green", "Blue", "Orange", "Purple"

### Designing the State Structure

With Redux, \*\*our application state is always kept in plain JavaScript objects and arrays". That means you may not put
other things into the Redux state - no class instances, built-in JS types like `Map`s / `Set`s `Promise`s / `Date`s, functions, or anything else that is not plain JS data.

**The root Redux state value is almost always a plain JS object**, with other data nested inside of it.

Based on this information, we should now be able to describe the kinds of values we need to have inside our Redux state:

- First, we need an array of todo item objects. Each item should have these fields:
  - `id`: a unique number
  - `text`: the text the user typed in
  - `completed`: a boolean flag
  - `color`: An optional color category
- Then, we need to describe our filtering options. We need to have:
  - The current "completed" filter value
  - An array of the currently selected color categories

So, here's what an example of our app's state might look like:

```js
const todoAppState = {
  todos: [
    { id: 0, text: 'Learn React', completed: true },
    { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
    { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
  ],
  filters: {
    status: 'Active',
    colors: ['red', 'blue']
  }
}
```
