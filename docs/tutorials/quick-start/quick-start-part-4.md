---
id: quick-start-part-4
title: Redux Quick Start - Part 4
sidebar_label: 'Async Logic and Data Fetching'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 4: Async Logic and Data Fetching

:::tip What You'll Learn

- How to use the Redux "thunk" middleware for async logic
- Patterns for handling async request state
- How to use the Redux Toolkit `createAsyncThunk` API to simplify async calls

:::

:::info Prerequisites

- Familiarity with using AJAX requests to fetch and update data from a server

:::

## Introduction

In [Part 3 of this tutorial](./quick-start-part-3.md), we saw how to use multiple pieces of data from the Redux store inside of React components, customize the contents of action objects before they're dispatched, and handle more complex update logic in our reducers.

So far, all the data we've worked with has been directly inside of our React client application. However, most real applications need to work with data from a server, by making HTTP API calls to fetch and save items.

In this section, we'll convert our social media app to fetch the posts and users data from an API, and add new posts by saving them to the API.

### Example REST API and Client

To keep the example project isolated but realistic, the initial project setup already included a fake in-memory REST API for our data (configured using [the Mirage.js mock API tool](https://miragejs.com/)). The API uses `/fakeApi` as the base URL for the endpoints, and supports the typical `GET/POST/PUT/DELETE` HTTP methods for `/fakeApi/posts`, `/fakeApi/users`, and `fakeApi/notifications`. It's defined in `src/api/server.js`.

The project also includes a small HTTP API client object that exposes `client.get()` and `client.post()` methods, similar to popular HTTP libraries like `axios`. It's defined in `src/api/client.js`.

We'll use the `client` object to make HTTP calls to our in-memory fake REST API for this section.

:::info

As a reminder, the code examples focus on the key concepts and changes for each section. See the CodeSandbox projects and the [**TODO actual repo link here** `some-working-branch` in the project repo]() for the complete changes in the application.

:::

## Thunks and Async Logic

### Using Middleware to Enable Async Logic

By itself, a Redux store doesn't know anything about async logic. It only knows how to synchronously dispatch actions, update the state by calling the root reducer function, and notify the UI that something has changed. Any asynchronicity has to happen outside the store.

But, what if you want to have async logic interact with the store by dispatching or checking the current store state? That's where [Redux middleware](../../advanced/Middleware.md) come in. They extend the store, and allow you to:

- Execute extra logic when any action is dispatched (such as logging the action and state)
- Pause, modify, delay, replace, or halt dispatched actions
- Write extra code that has access to `dispatch` and `getState`
- Teach `dispatch` how to accept other values besides plain action objects, such as functions and promises, by intercepting them and dispatching real action objects instead

[The most common reason to use middleware is to allow different kinds of async logic to interact with the store](../../faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)This allows you to write code that can dispatch actions and check the store state, while keeping that logic separate from your UI.

There are many kinds of async middleware for Redux, and each lets you write your logic using different syntax. The most common async middleware is [`redux-thunk`](https://github.com/reduxjs/redux-thunk), which lets you write plain functions that may contain async logic directly. Redux Toolkit's `configureStore` function [automatically sets up the thunk middleware by default](https://redux-toolkit.js.org/api/getDefaultMiddleware#included-default-middleware), and [we recommend using thunks as the standard approach for writing async logic with Redux](../../style-guide/style-guide.md#use-thunks-for-async-logic).

### Thunk Functions

Once the thunk middleware has been added to the Redux store, it allows you to pass _thunk functions_ directly to `store.dispatch`. A thunk function will always be called with `(dispatch, getState)` as its arguments, and you can use them inside the thunk as needed.

Thunks typically dispatch plain actions using action creators, like `dispatch(increment())`:

```js
const store = configureStore({ reducer: counterReducer })

const exampleThunkFunction = (dispatch, getState) => {
  const stateBefore = getState()
  console.log(`Counter before: ${stateBefore.counter}`)
  dispatch(increment())
  const stateAfter = getState()
  console.log(`Counter after: ${stateAfter.counter}`)
}

store.dispatch(exampleThunkFunction)
```

For consistency with dispatching normal action objects, we typically write these as _thunk action creators_, which return the thunk function. These action creators can take arguments that can be used inside the thunk.

```js
const logAndAdd = amount => {
  return (dispatch, getState) => {
    const stateBefore = getState()
    console.log(`Counter before: ${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`Counter after: ${stateAfter.counter}`)
  }
}

store.dispatch(logAndAdd(5))
```

Thunks are typically written in "slice" files. `createSlice` itself does not have any special support for defining thunks, so you should write them as separate functions in the same slice file. That way, they have access to the plain action creators for that slice, and it's easy to find where the thunk lives.

### Writing Async Thunks

Thunks may have async logic inside of them, such as `setTimeout`, `Promise`s, and `async/await`. This makes them a good place to put AJAX calls to a server API.

Data fetching logic for Redux typically follows a predictable pattern:

- A "start" action is dispatched before the request, to indicate that the request is in progress. This may be used to track loading state to allow skipping duplicate requests or show loading indicators in the UI.
- The async request is made
- Depending on the request result, the async logic dispatches either a "success" action containing the result data, or a "failure" action containing error details. The reducer logic clears the loading state in both cases, and either processes the result data from the success case, or stores the error value for potential display.

These steps are not _required_, but are recommended and commonly used.

Redux Toolkit provides a `createAsyncThunk` API to implement the creation and dispatching of these actions, and we'll look at how to use it shortly.

<DetailedExplanation title="Detailed Explanation: Dispatching Request Status Actions in Thunks">

If we were to write out the code for a typical async thunk by hand, it might look like this:

```js
const getRepoDetailsStarted = () => ({
  type: "repoDetails/fetchStarted"
})
const getRepoDetailsSuccess = (repoDetails) => {
  type: "repoDetails/fetchSucceeded",
  payload: repoDetails
}
const getRepoDetailsFailed = (error) => {
  type: "repoDetails/fetchFailed",
  error
}
const fetchIssuesCount = (org, repo) => async dispatch => {
  dispatch(getRepoDetailsStarted())
  try {
    const repoDetails = await getRepoDetails(org, repo)
    dispatch(getRepoDetailsSuccess(repoDetails))
  } catch (err) {
    dispatch(getRepoDetailsFailed(err.toString()))
  }
}
```

However, writing code using this approach is tedious. Each separate type of request needs repeated similar implementation:

- Unique action types need to be defined for the three different cases
- Each of those action types usually has a corresponding action creator function
- A thunk has to be written that dispatches the correct actions in the right sequence

`createAsyncThunk` abstracts this pattern by generating the action types and action creators, and generating a thunk that dispatches those actions.

</DetailedExplanation>

## Loading Posts

So far, our `postsSlice` has just used some hardcoded sample data as its initial state. We're going to switch that to start with an empty array of posts instead, and then fetch a list of posts from the server.

In order to do that, we're going to have to change the structure of the state in our `postsSlice`, so that we can keep track of the current state of the API request.

### Extracting Posts Selectors

Right now, the `postsSlice` state is just a single array of `posts`. We need to change that to be an object that has the `posts` array, plus the loading state fields.

Meanwhile, the UI components like `<PostsList>` are trying to read posts from `state.posts` in their `useSelector` hooks, assuming that that field is an array. We need to change those locations also to match the new data.

It would be nice if we didn't have to keep rewriting our components every time we made a change to the data format in our reducers. One way to avoid this is to define reusable selector functions in the slice files, and have the components use those selectors to extract the data they need instead of repeating the selector logic in each component. That way, if we do change our state structure again, we only need to update the code in the slice file.

The `<PostsList>` component needs to read a list of all the posts, and the `<SinglePostPage>` and `<EditPostForm>` components need to look up a single post by its ID. Let's export two small selector functions from `postsSlice.js` to cover those cases:

```js title="features/posts/postsSlice.js"
const postsSlice = createSlice(/* omit slice code*/)

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start
export const selectAllPosts = state => state.posts

export const selectPostById = (state, postId) =>
  state.posts.find(post => post.id === postId)
//highlight-end
```

Note that the `state` parameter for these selector functions is the root Redux state object, as it was for the inlined anonymous selectors we wrote directly inside of `useSelector`.

We can then use them in the components:

```js title="features/posts/PostsList.js"
// omit imports
// highlight-next-line
import { selectAllPosts } from './postsSlice'

export const PostsList = () => {
  // highlight-next-line
  const posts = useSelector(selectAllPosts)
  // omit component contents
}
```

```js title="features/posts/EditPostForm.js"
// omit imports
//highlight-next-line
import { selectPostById } from './postsSlice'

export const SinglePostPage = ({ match }) => {
  const { postId } = match.params

  // highlight-next-line
  const post = useSelector(state => selectPostById(state, postId))
  // omit component logic
}
```

It's often a good idea to encapsulate data lookups by writing reusable selectors. You can also create "memoized" selectors that can help improve performance, which we'll look at in a later part of this tutorial.

But, like any abstraction, it's not something you should do _all_ the time, everywhere. Writing selectors means more code to understand and maintain. **Don't feel like you need to write selectors for every single field of your state**. Try starting without any selectors, and add some later when you find yourself looking up the same values in many parts of your application code.

### Loading State for Requests

When we make an API call, we can view its progress as a small state machine that can be in one of four possible states:

- The request hasn't started yet
- The request is in progress
- The request succeeded, and we now have the data we need
- The request failed, and there's probably an error message

We _could_ track that information using some booleans, like `isLoading: true`, but it's better to track these states as a single enum value. A good pattern for this is to have a state section that looks like:

```ts
{
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  error: string | null
}
```

These fields would exist alongside whatever actual data is being stored. These specific string state names aren't required - feel free to use other names if you want, like `'pending'` instead of `'loading'`, or `'complete'` instead of `'succeeded'`.

We can use this information to decide what to show in our UI as the request progresses, and also add logic in our reducers to prevent cases like loading data twice.

Let's update our `postsSlice` to use this pattern to track loading state for a "fetch posts" request. We'll switch our state from being just an array of posts, to look like `{posts, status, error}`. We'll also remove the old sample post entries from our initial state. As part of this change, we also need to change any uses of `state` as an array to be `state.posts` instead, because the array is now one level deeper:

```js title="features/posts/postsSlice.js"
import { createSlice, nanoid } from '@reduxjs/toolkit'

// highlight-start
const initialState = {
  posts: [],
  status: 'idle',
  error: null
}
//highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        // highlight-next-line
        state.posts.push(action.payload)
      },
      prepare(title, content, userId) {
        // omit prepare logic
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start
export const selectAllPosts = state => state.posts.posts

export const selectPostById = (state, postId) =>
  state.posts.posts.find(post => post.id === postId)
// highlight-end
```

Yes, this _does_ mean that we now have a nested object path that looks like `state.posts.posts`, which is somewhat repetitive and silly :) We _could_ change the nested array name to be `items` or `data` or something if we wanted to avoid that, but we'll leave it as-is for now.

### Using `createAsyncThunk`

`createAsyncThunk` accepts two arguments:

- A string that will be used as the prefix for the generated action types
- A "payload creator" function that should return a `Promise` containing some data, or a rejected `Promise` with an error

# TODO MORE CONTENT HERE

## What You've Learned

<!--
<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quickstart-example-app/tree/checkpoint-2-reactionButtons/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>
-->

:::tip

- **You can write reusable "selector" functions to encapsulate reading values from the Redux state**
  - Selectors are functions that get the Redux `state` as an argument, and return some data
- **Redux uses plugins called "middleware" to enable async logic**
  - The standard async middleware is called `redux-thunk`, which is included in Redux Toolkit
  - Thunk functions receive `dispatch` and `getState` as arguments, and can use those as part of async logic
- **You can dispatch additional actions to help track the loading status of an API call**
  - The typical pattern is dispatching a "pending" action before the call, then either a "success" containing the data or a "failure" action containing the error
  - Loading state should usually be stored as an enum, like `'idle' | 'loading' | 'succeeded' | 'failed'`
- **Redux Toolkit has a `createAsyncThunk` API that dispatches these actions for you**
  - `createAsyncThunk` accepts a "payload creator" callback that should return a `Promise`, and generates `pending/fulfilled/rejected` action types automatically
  - You can listen for these action types in `createSlice` using the `extraReducers` field

:::

## What's Next?
