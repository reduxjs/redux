---
id: part-3-data-flow
title: 'Redux Essentials, Part 3: Basic Redux Data Flow'
sidebar_label: 'Basic Redux Data Flow'
description: 'The official Redux Essentials tutorial: learn how data flows in a React + Redux app'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip What You'll Learn

- How to set up a Redux store in a React application
- How to add "slices" of reducer logic to the Redux store with `createSlice`
- Reading Redux data in components with the `useSelector` hook
- Dispatching actions in components with the `useDispatch` hook

:::

:::info Prerequisites

- Familiarity with key Redux terms and concepts like "actions", "reducers", "store", and "dispatching". (See [**Part 1: Redux Overview and Concepts**](./part-1-overview-concepts.md) for explanations of these terms.)
- Basic understanding of [TypeScript syntax and usage](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

:::

## Introduction

In [Part 1: Redux Overview and Concepts](./part-1-overview-concepts.md), we looked at how Redux can help us build maintainable apps by giving us a single central place to put global app state. We also talked about core Redux concepts like dispatching action objects, using reducer functions that return new state values, and writing async logic using thunks. In [Part 2: Redux Toolkit App Structure](./part-2-app-structure.md), we saw how APIs like `configureStore` and `createSlice` from Redux Toolkit and `Provider` and `useSelector` from React-Redux work together to let us write Redux logic and interact with that logic from our React components.

Now that you have some idea of what these pieces are, it's time to put that knowledge into practice. We're going to build a small social media feed app, which will include a number of features that demonstrate some real-world use cases. This will help you understand how to use Redux in your own applications.

We'll be using [TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) syntax to write our code. You can use Redux with plain JavaScript, but using TypeScript helps prevent many common mistakes, provides built-in documentation for your code, and lets your editor show you what variable types are needed in places like React components and Redux reducers. **We strongly recommend using TypeScript for all Redux applications.**

:::caution

The example app is not meant as a complete production-ready project. The goal is to help you learn the Redux APIs and typical usage patterns, and point you in the right direction using some limited examples. Also, some of the early pieces we build will be updated later on to show better ways to do things. **Please read through the whole tutorial to see all the concepts in use**.

:::

### Project Setup

For this tutorial, we've created a pre-configured starter project that already has React and Redux set up, includes some default styling, and has a fake REST API that will allow us to write actual API requests in our app. You'll use this as the basis for writing the actual application code.

To get started, you can open and fork this CodeSandbox:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-0-setup/?&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-essentials-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

You can also [clone the same project from this Github repo](https://github.com/reduxjs/redux-essentials-example-app). The project is configured to use [Yarn 4](https://yarnpkg.com/) as the package manager, but you can use any package manager ([NPM](https://docs.npmjs.com/cli/v10), [PNPM](https://pnpm.io/), or [Bun](https://bun.sh/docs/cli/install)) as you prefer. After installing packages, you can start the local dev server with the `yarn dev` command.

If you'd like to see the final version of what we're going to build, you can check out [the **`tutorial-steps-ts` branch**](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts), or [look at the final version in this CodeSandbox](https://codesandbox.io/s/github/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts).

> We'd like to thank [Tania Rascia](https://www.taniarascia.com/), whose [Using Redux with React](https://www.taniarascia.com/redux-react-guide/) tutorial helped inspire the example in this page. It also uses her [Primitive UI CSS starter](https://taniarascia.github.io/primitive/) for styling.

#### Creating a New Redux + React Project

Once you've finished this tutorial, you'll probably want to try working on your own projects. **We recommend using the [Redux templates for Vite and Next.js](../../introduction/Installation.md#create-a-react-redux-app) as the fastest way to create a new Redux + React project**. The templates come with Redux Toolkit and React-Redux already configured, using [the same "counter" app example you saw in Part 1](./part-1-overview-concepts.md). This lets you jump right into writing your actual application code without having to add the Redux packages and set up the store.

#### Exploring the Initial Project

Let's take a quick look at what the initial project contains:

- `/public`: base CSS styles and other static files like icons
- `/src`
  - `main.tsx`: the entry point file for the application, which renders the `<App>` component. In this example, it also sets up the fake REST API on page load.
  - `App.tsx`: the main application component. Renders the top navbar and handles client-side routing for the other content.
  - `index.css`: styles for the complete application
  - `/api`
    - `client.ts`: a small `fetch` wrapper client that allows us to make HTTP GET and POST requests
    - `server.ts`: provides a fake REST API for our data. Our app will fetch data from these fake endpoints later.
  - `/app`
    - `Navbar.tsx`: renders the top header and nav content

If you load the app now, you should see the header and a welcome message, but no functionality.

With that, let's get started!

## Setting Up the Redux Store

Right now the project is empty, so we'll need to start by doing the one-time setup for the Redux pieces.

### Adding the Redux Packages

If you look at `package.json`, you'll see that we've already installed the two packages needed to use Redux:

- `@reduxjs/toolkit`: the modern Redux package, which includes all the Redux functions we'll be using to build the app
- `react-redux`: the functions needed to let your React components talk to a Redux store

If you're setting up a project from scratch, start by adding those packages to the project yourself.

### Creating the Store

The first step is to create an actual Redux store. **One of the principles of Redux is that there should only be _one_ store instance for an entire application**.

We typically create and export the Redux store instance in its own file. The actual folder structure for the application is up to you, but it's standard to have application-wide setup and configuration in a `src/app/` folder.

We'll start by adding a `src/app/store.ts` file and creating the store.

**Redux Toolkit includes a method called `configureStore`**. This function creates a new Redux store instance. It has several options that you can pass in to change the store's behavior. It also applies the most common and useful configuration settings automatically, including checking for typical mistakes, and enabling the Redux DevTools extension so that you can view the state contents and action history.

```ts title="src/app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import type { Action } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

// An example slice reducer function that shows how a Redux reducer works inside.
// We'll replace this soon with real app logic.
function counterReducer(state: CounterState = { value: 0 }, action: Action) {
  switch (action.type) {
    // Handle actions here
    default: {
      return state
    }
  }
}

// highlight-start
export const store = configureStore({
  // Pass in the root reducer setup as the `reducer` argument
  reducer: {
    // Declare that `state.counter` will be updated by the `counterReducer` function
    counter: counterReducer
  }
})
// highlight-end
```

**`configureStore` always requires a `reducer` option**. This should typically be an object containing the individual "slice reducers" for the different parts of the application. (If necessary, you can also create the root reducer function separately and pass that as the `reducer` argument.)

For this first step, we're passing in a mock slice reducer function for the `counter` slice, to show what the setup looks like. We'll replace this with a real slice reducer for the actual app we want to build in just a minute.

:::tip Setup with Next.js

If you're using Next.js, the setup process takes a few more steps. See the [Setup with Next.js](../../usage/nextjs.mdx) page for details on how to set up Redux with Next.js.

:::

### Providing the Store

Redux by itself is a plain JS library, and can work with any UI layer. In this app, we're using React, so we need a way to let our React components interact with the Redux store.

To make this work, we need to use the React-Redux library and pass the Redux store into a `<Provider>` component. This uses [React's Context API](https://react.dev/learn/passing-data-deeply-with-context) to make the Redux store accessible to all of the React components in our application.

:::tip

It's important that we _should not_ try to directly import the Redux store into other application code files! Because there's only one store file, directly importing the store can accidentally cause circular import issues (where file A imports B imports C imports A), which lead to hard-to-track bugs. Additionally, we want to be able to [write tests for the components and Redux logic](../../usage/WritingTests.mdx), and those tests will need to create their own Redux store instances. Providing the store to the components via Context keeps this flexible and avoids import problems.

:::

To do this, we'll import the `store` into the `main.tsx` entry point file, wrap a `<Provider>` with the store around the `<App>` component:

```tsx title="src/main.tsx"
import { createRoot } from 'react-dom/client'
// highlight-next-line
import { Provider } from 'react-redux'

import App from './App'
// highlight-next-line
import { store } from './app/store'

// skip mock API setup

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    // highlight-start
    <Provider store={store}>
      <App />
    </Provider>
    // highlight-end
  </React.StrictMode>
)
```

### Inspecting the Redux State

Now that we have a store, we can use the Redux DevTools extension to view the current Redux state.

If you open up your browser's DevTools view (such as by right-clicking anywhere in the page and choosing "Inspect"), you can click on the "Redux" tab. This will show the history of dispatched actions and the current state value:

![Redux DevTools: initial app state](/img/tutorials/essentials/devtools-initial.png)

The current state value should be an object that looks like this:

```ts
{
  counter: {
    value: 0
  }
}
```

That shape was defined by the `reducer` option we passed into `configureStore`: an object, with a field named `counter`, and the slice reducer for the `counter` field returns an object like `{value}` as its state.

### Exporting Store Types

Since we're using TypeScript, we're going to frequently refer to TS types for "the type of the Redux state" and "the type of the Redux store `dispatch` function".

We need to export those types from the `store.ts` file. We'll define the types by using the TS `typeof` operator to ask TS to infer the types based on the Redux store definition:

```ts title="src/app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// omit counter slice setup

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
})

// highlight-start
// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
// highlight-end
```

If you hover over the `RootState` type in your editor, you should see `type RootState = { counter: CounterState; }`. Since this type is automatically derived from the store definition, all the future changes to the `reducer` setup will automatically be reflected in the `RootState` type as well. This way we only need to define it once, and it will always be accurate.

### Exporting Typed Hooks

We're going to be using React-Redux's `useSelector` and `useDispatch` hooks extensively in our components. Those need to reference the `RootState` and `AppDispatch` types each time we use the hooks.

We can simplify the usage and avoid repeating the types if we set up "pre-typed" versions of those hooks that have the right types already built in.

React-Redux 9.1 includes `.withTypes()` methods that apply the right types to those hooks. We can export these pre-typed hooks, then use them in the rest of the application:

```ts title="src/app/hooks.ts"
// This file serves as a central hub for re-exporting pre-typed Redux hooks.
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// highlight-start
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
// highlight-end
```

That completes the setup process. Let's start building the app!

## Main Posts Feed

The main feature for our social media feed app will be a list of posts. We'll add several more pieces to this feature as we go along, but to start off, our first goal is to only show the list of post entries on screen.

### Creating the Posts Slice

The first step is to create a new Redux "slice" that will contain the data for our posts.

**A "slice" is a collection of Redux reducer logic and actions for a single feature in your app**, typically defined together in a single file. The name comes from splitting up the root Redux state object into multiple "slices" of state.

Once we have the posts data in the Redux store, we can create the React components to show that data on the page.

Inside of `src`, create a new `features` folder, put a `posts` folder inside of `features`, and add a new file named `postsSlice.ts`.

We're going to use the Redux Toolkit `createSlice` function to make a reducer function that knows how to handle our posts data. Reducer functions need to have some initial data included so that the Redux store has those values loaded when the app starts up.

For now, we'll create an array with some fake post objects inside so that we can begin adding the UI.

We'll import `createSlice`, define our initial posts array, pass that to `createSlice`, and export the posts reducer function that `createSlice` generated for us:

```ts title="features/posts/postsSlice.ts"
import { createSlice } from '@reduxjs/toolkit'

// Define a TS type for the data we'll be using
export interface Post {
  id: string
  title: string
  content: string
}

// Create an initial state value for the reducer, with that type
const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' }
]

// Create the slice and pass in the initial state
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {}
})

// Export the generated reducer function
export default postsSlice.reducer
```

Every time we create a new slice, we need to add its reducer function to our Redux store. We already have a Redux store being created, but right now it doesn't have any data inside. Open up `app/store.ts`, import the `postsReducer` function, remove all of the `counter` code, and update the call to `configureStore` so that the `postsReducer` is being passed as a reducer field named `posts`:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// highlight-next-line
// Removed the `counterReducer` function, `CounterState` type, and `Action` import

// highlight-next-line
import postsReducer from '@/features/posts/postsSlice'

export const store = configureStore({
  reducer: {
    // highlight-next-line
    posts: postsReducer
  }
})
```

This tells Redux that we want our top-level state object to have a field named `posts` inside, and all the data for `state.posts` will be updated by the `postsReducer` function when actions are dispatched.

We can confirm that this works by opening the Redux DevTools Extension and looking at the current state contents:

![Initial posts state](/img/tutorials/essentials/example-initial-posts.png)

### Showing the Posts List

Now that we have some posts data in our store, we can create a React component that shows the list of posts. All of the code related to our feed posts feature should go in the `posts` folder, so go ahead and create a new file named `PostsList.tsx` in there. (Note that since this is a React component written in TypeScript and using JSX syntax, it needs a `.tsx` file extension for TypeScript to compile it properly)

If we're going to render a list of posts, we need to get the data from somewhere. React components can read data from the Redux store using the `useSelector` hook from the React-Redux library. The "selector functions" that you write will be called with the entire Redux `state` object as a parameter, and should return the specific data that this component needs from the store.

Since we're using TypeScript, all of our components should always use the pre-typed `useAppSelector` hook that we added in `src/app/hooks.ts`, since that has the right `RootState` type already included.

Our initial `PostsList` component will read the `state.posts` value from the Redux store, then loop over the array of posts and show each of them on screen:

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
import { useAppSelector } from '@/app/hooks'

export const PostsList = () => {
  // highlight-start
  // Select the `state.posts` value from the store into the component
  const posts = useAppSelector(state => state.posts)
  // highlight-end

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderedPosts}
    </section>
  )
}
```

We then need to update the routing in `App.tsx` so that we show the `PostsList` component instead of the "welcome" message. Import the `PostsList` component into `App.tsx`, and replace the welcome text with `<PostsList />`. We'll also wrap it in a [React Fragment](https://react.dev/reference/react/Fragment), because we're going to add something else to the main page soon:

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
// highlight-next-line
import { PostsList } from './features/posts/PostsList'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              // highlight-start
              <>
                <PostsList />
              </>
              // highlight-end
            }
          ></Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

Once that's added, the main page of our app should now look like this:

![Initial posts list](/img/tutorials/essentials/working_post_list.png)

Progress! We've added some data to the Redux store, and shown it on screen in a React component.

### Adding New Posts

It's nice to look at posts people have written, but we'd like to be able to write our own posts. Let's create an "Add New Post" form that lets us write posts and save them.

We'll create the empty form first and add it to the page. Then, we'll connect the form to our Redux store so that new posts are added when we click the "Save Post" button.

#### Adding the New Post Form

Create `AddPostForm.tsx` in our `posts` folder. We'll add a text input for the post title, and a text area for the body of the post:

```tsx title="features/posts/AddPostForm.tsx"
import React from 'react'

// TS types for the input fields
// See: https://epicreact.dev/how-to-type-a-react-form-on-submit-handler/
interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
}
interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields
}

export const AddPostForm = () => {
  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    console.log('Values: ', { title, content })

    e.currentTarget.reset()
  }

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue=""
          required
        />
        <button>Save Post</button>
      </form>
    </section>
  )
}
```

Note that this doesn't have any Redux-specific logic yet - we'll add that next.

In this example we're using ["uncontrolled" inputs](https://react.dev/reference/react-dom/components/input#reading-the-input-values-when-submitting-a-form) and using HTML5 form validation to prevent submitting empty input fields, but it's up to you how you read values from a form - that's a preference about React usage patterns and not specific to Redux.

Import that component into `App.tsx`, and add it right above the `<PostsList />` component:

```tsx title="App.tsx"
// omit outer `<App>` definition
<Route
  path="/"
  element={
    <>
      // highlight-next-line
      <AddPostForm />
      <PostsList />
    </>
  }
></Route>
```

You should see the form show up in the page right below the header.

#### Saving Post Entries

Now, let's update our posts slice to add new post entries to the Redux store.

Our posts slice is responsible for handling all updates to the posts data. Inside of the `createSlice` call, there's an object called `reducers`. Right now, it's empty. We need to add a reducer function inside of there to handle the case of a post being added.

Inside of `reducers`, add a function named `postAdded`, which will receive two arguments: the current `state` value, and the `action` object that was dispatched. Since the posts slice _only_ knows about the data it's responsible for, the `state` argument will be the array of posts by itself, and not the entire Redux state object.

The `action` object will have our new post entry as the `action.payload` field. When we declare the reducer function, we also need to tell TypeScript what that actual `action.payload` type is, so that it can correctly check when we pass in the argument and access the `action.payload` contents. To do that, we need to import the `PayloadAction` type from Redux Toolkit, and declare the `action` argument as `action: PayloadAction<ThePayloadTypeHere>`. In this case, that will be `action: PayloadAction<Post>`.

The actual state update is adding the new post object into the `state` array, which we can do via `state.push()` in the reducer.

:::warning

Remember: **Redux reducer functions must _always_ create new state values immutably, by making copies!** It's safe to call mutating functions like `Array.push()` or modify object fields like `state.someField = someValue` inside of `createSlice()`, because [it converts those mutations into safe immutable updates internally using the Immer library](./part-2-app-structure.md#reducers-and-immutable-updates), but **don't try to mutate any data outside of `createSlice`!**

:::

When we write the `postAdded` reducer function, `createSlice` will automatically generate an ["action creator" function](../fundamentals/part-7-standard-patterns.md#action-creators) with the same name. We can export that action creator and use it in our UI components to dispatch the action when the user clicks "Save Post".

```ts title="features/posts/postsSlice.ts"
// highlight-start
// Import the `PayloadAction` TS type
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// highlight-end

// omit initial state

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    // Declare a "case reducer" named `postAdded`.
    // The type of `action.payload` will be a `Post` object.
    postAdded(state, action: PayloadAction<Post>) {
      // "Mutate" the existing state array, which is
      // safe to do here because `createSlice` uses Immer inside.
      state.push(action.payload)
    }
    // highlight-end
  }
})

// highlight-start
// Export the auto-generated action creator with the same name
export const { postAdded } = postsSlice.actions
// highlight-end

export default postsSlice.reducer
```

Terminology-wise, `postAdded` here is an example of a **"case reducer"**. It's a reducer function, inside of a slice, that handles one specific action type that was dispatched. Conceptually, it's like we wrote a `case` statement inside of a `switch` - "when we see this exact action type, run this logic":

```ts
function sliceReducer(state = initialState, action) {
  switch (action.type) {
    case 'posts/postAdded': {
      // update logic here
    }
  }
}
```

#### Dispatching the "Post Added" Action

Our `AddPostForm` has text inputs and a "Save Post" button that triggers a submit handler, but the button doesn't do anything yet. We need to update the submit handler to dispatch the `postAdded` action creator and pass in a new post object containing the title and content the user wrote.

Our post objects also need to have an `id` field. Right now, our initial test posts are using some fake numbers for their IDs. We could write some code that would figure out what the next incrementing ID number should be, but it would be better if we generated a random unique ID instead. Redux Toolkit has a `nanoid` function we can use for that.

:::info

We'll talk more about generating IDs and dispatching actions in [Part 4: Using Redux Data](./part-4-using-data.md).

:::

In order to dispatch actions from a component, **we need access to the store's `dispatch` function**. We get this by calling the `useDispatch` hook from React-Redux. Since we're using TypeScript, that means that we should actually **import the `useAppDispatch` hook with the right types**. We also need to import the `postAdded` action creator into this file.

Once we have the `dispatch` function available in our component, we can call `dispatch(postAdded())` in a click handler. We can take the title and content values from our form, generate a new ID, and put them together into a new post object that we pass to `postAdded()`.

```tsx title="features/posts/AddPostForm.tsx"
import React from 'react'
// highlight-start
import { nanoid } from '@reduxjs/toolkit'

import { useAppDispatch } from '@/app/hooks'

import { type Post, postAdded } from './postsSlice'
// highlight-end

// omit form types

export const AddPostForm = () => {
  // highlight-start
  // Get the `dispatch` method from the store
  const dispatch = useAppDispatch()

  // highlight-end

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    // highlight-start
    // Create the post object and dispatch the `postAdded` action
    const newPost: Post = {
      id: nanoid(),
      title,
      content
    }
    dispatch(postAdded(newPost))
    // highlight-end

    e.currentTarget.reset()
  }

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue=""
          required
        />
        <button>Save Post</button>
      </form>
    </section>
  )
}
```

Now, try typing in a title and some text, and click "Save Post". You should see a new item for that post show up in the posts list.

**Congratulations! You've just built your first working React + Redux app!**

This shows the complete Redux data flow cycle:

- Our posts list read the initial set of posts from the store with `useSelector` and rendered the initial UI
- We dispatched the `postAdded` action containing the data for the new post entry
- The posts reducer saw the `postAdded` action, and updated the posts array with the new entry
- The Redux store told the UI that some data had changed
- The posts list read the updated posts array, and re-rendered itself to show the new post

All the new features we'll add after this will follow the same basic patterns you've seen here: adding slices of state, writing reducer functions, dispatching actions, and rendering the UI based on data from the Redux store.

We can check the Redux DevTools Extension to see the action we dispatched, and look at how the Redux state was updated in response to that action. If we click the `"posts/postAdded"` entry in the actions list, the "Action" tab should look like this:

![postAdded action contents](/img/tutorials/essentials/example-postAdded-action.png)

The "Diff" tab should also show us that `state.posts` had one new item added, which is at index 2.

Remember, **the Redux store should only contain data that's considered "global" for the application!** In this case, only the `AddPostForm` will need to know about the latest values for the input fields. Even if we built the form with ["controlled" inputs](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable), we'd want to keep the data in React component state instead of trying to keep the temporary data in the Redux store. When the user is done with the form, we dispatch a Redux action to update the store with the final values based on the user input.

## What You've Learned

We've set up the basics of a Redux app - store, slice with reducers, and UI to dispatch actions. Here's what the app looks like so far:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-1-postAdded?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

Let's recap what you've learned in this section:

:::tip Summary

- **A Redux app has a single `store` that is passed to React components via a `<Provider>` component**
- **Redux state is updated by "reducer functions"**:
  - Reducers always calculate a new state _immutably_, by copying existing state values and modifying the copies with the new data
  - The Redux Toolkit `createSlice` function generates "slice reducer" functions for you, and lets you write "mutating" code that is turned into safe immutable updates
  - Those slice reducer functions are added to the `reducer` field in `configureStore`, and that defines the data and state field names inside the Redux store
- **React components read data from the store with the `useSelector` hook**
  - Selector functions receive the whole `state` object, and should return a value
  - Selectors will re-run whenever the Redux store is updated, and if the data they return has changed, the component will re-render
- **React components dispatch actions to update the store using the `useDispatch` hook**
  - `createSlice` will generate action creator functions for each reducer we add to a slice
  - Call `dispatch(someActionCreator())` in a component to dispatch an action
  - Reducers will run, check to see if this action is relevant, and return new state if appropriate
  - Temporary data like form input values should be kept as React component state or plain HTML input fields. Dispatch a Redux action to update the store when the user is done with the form.
- **If you're using TypeScript, the initial app setup should define TS types for `RootState` and `AppDispatch` based on the store, and export pre-typed versions of the React-Redux `useSelector` and `useDispatch` hooks**

:::

## What's Next?

Now that you know the basic Redux data flow, move on to [Part 4: Using Redux Data](./part-4-using-data.md), where we'll add some additional functionality to our app and see examples of how to work with the data that's already in the store.
