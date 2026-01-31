---
id: part-5-async-logic
title: 'Redux Essentials, Part 5: Async Logic and Data Fetching'
sidebar_label: 'Async Logic and Data Fetching'
description: 'The official Redux Essentials tutorial: learn how async logic works in Redux apps'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip What You'll Learn

- How to use the Redux "thunk" middleware for async logic
- Patterns for handling async request state
- How to use the Redux Toolkit `createAsyncThunk` API to manage async calls

:::

:::info Prerequisites

- Familiarity with using HTTP requests to fetch and update data from a server REST API

:::

## Introduction

In [Part 4: Using Redux Data](./part-4-using-data.md), we saw how to use multiple pieces of data from the Redux store inside of React components, customize the contents of action objects before they're dispatched, and handle more complex update logic in our reducers.

So far, all the data we've worked with has been directly inside of our React client application. However, most real applications need to work with data from a server, by making HTTP API calls to fetch and save items.

In this section, we'll convert our social media app to fetch the posts and users data from an API, and add new posts by saving them to the API.

:::tip

Redux Toolkit includes the [**RTK Query data fetching and caching API**](https://redux-toolkit.js.org/rtk-query/overview). RTK Query is a purpose built data fetching and caching solution for Redux apps, and **can eliminate the need to write _any_ additional Redux logic like thunks or reducers to manage data fetching**. We specifically teach RTK Query as the default approach for data fetching.

RTK Query is built on the same patterns shown in this page, so **this section will help you understand the underlying mechanics of how data fetching works with Redux**.

We'll cover how to use RTK Query starting in [Part 7: RTK Query Basics](./part-7-rtk-query-basics.md).

:::

### Example REST API and Client

To keep the example project isolated but realistic, the initial project setup already includes a fake in-memory REST API for our data (configured using [the Mock Service Worker mock API tool](https://mswjs.io/)). The API uses `/fakeApi` as the base URL for the endpoints, and supports the typical `GET/POST/PUT/DELETE` HTTP methods for `/fakeApi/posts`, `/fakeApi/users`, and `fakeApi/notifications`. It's defined in `src/api/server.ts`.

The project also includes a small HTTP API client object that exposes `client.get()` and `client.post()` methods, similar to popular HTTP libraries like `axios`. It's defined in `src/api/client.ts`.

We'll use the `client` object to make HTTP calls to our in-memory fake REST API for this section.

Also, the mock server has been set up to reuse the same random seed each time the page is loaded, so that it will generate the same list of fake users and fake posts. If you want to reset that, delete the `'randomTimestampSeed'` value in your browser's Local Storage and reload the page, or you can turn that off by editing `src/api/server.ts` and setting `useSeededRNG` to `false`.

:::info

As a reminder, the code examples focus on the key concepts and changes for each section. See the CodeSandbox projects and the [`tutorial-steps-ts` branch in the project repo](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts) for the complete changes in the application.

:::

## Using Middleware to Enable Async Logic

By itself, a Redux store doesn't know anything about async logic. It only knows how to synchronously dispatch actions, update the state by calling the root reducer function, and notify the UI that something has changed. Any asynchronicity has to happen outside the store.

But, what if you want to have async logic interact with the store by dispatching actions, checking the current store state, or some kind of side effect? That's where [Redux middleware](../fundamentals/part-4-store.md#middleware) come in. They extend the store to add additional capabilities, and allow you to:

- Execute extra logic when any action is dispatched (such as logging the action and state)
- Pause, modify, delay, replace, or halt dispatched actions
- Write extra code that has access to `dispatch` and `getState`
- Teach `dispatch` how to accept other values besides plain action objects, such as functions and promises, by intercepting them and dispatching real action objects instead
- Write code that uses async logic or other side effects

[The most common reason to use middleware is to allow different kinds of async logic to interact with the store](../../faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior). This allows you to write code that can dispatch actions and check the store state, while keeping that logic separate from your UI.

:::info Middleware and the Redux Store

For more details on how middleware let you customize the Redux store, see:

- [Redux Fundamentals, Part 4: Store > Middleware](../fundamentals/part-4-store.md#middleware)

:::

### Middleware and Redux Data Flow

Earlier, we saw [what the synchronous data flow for Redux looks like](part-1-overview-concepts.md#redux-application-data-flow).

Middleware update the Redux data flow by adding an extra step at the start of `dispatch`. That way, middleware can run logic like HTTP requests, then dispatch actions. That makes the async data flow look like this:

![Redux async data flow diagram](/img/tutorials/essentials/ReduxAsyncDataFlowDiagram.gif)

## Thunks and Async Logic

There are many kinds of async middleware for Redux, and each lets you write your logic using different syntax. The most common async middleware is [`redux-thunk`](https://github.com/reduxjs/redux-thunk), which lets you write plain functions that may contain async logic directly. Redux Toolkit's `configureStore` function [automatically sets up the thunk middleware by default](https://redux-toolkit.js.org/api/getDefaultMiddleware#included-default-middleware), and [we recommend using thunks as a standard approach for writing async logic with Redux](../../style-guide/style-guide.md#use-thunks-and-listeners-for-other-async-logic).

:::info What is a "Thunk"?

The word "thunk" is a programming term that means ["a piece of code that does some delayed work"](https://en.wikipedia.org/wiki/Thunk).

For more details on how to use Redux thunks, see the thunk usage guide page:

- [Using Redux: Writing Logic with Thunks](../../usage/writing-logic-thunks.mdx)

as well as these posts:

- [What the heck is a thunk?](https://daveceddia.com/what-is-a-thunk/)
- [Thunks in Redux: the basics](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)

:::

### Thunk Functions

Once the thunk middleware has been added to the Redux store, it allows you to pass _thunk functions_ directly to `store.dispatch`. A thunk function will always be called with `(dispatch, getState)` as its arguments, and you can use them inside the thunk as needed.

A thunk function can contain _any_ logic, sync or async.

Thunks typically dispatch plain actions using action creators, like `dispatch(increment())`:

```ts
const store = configureStore({ reducer: counterReducer })

const exampleThunkFunction = (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const stateBefore = getState()
  console.log(`Counter before: ${stateBefore.counter}`)
  dispatch(increment())
  const stateAfter = getState()
  console.log(`Counter after: ${stateAfter.counter}`)
}

store.dispatch(exampleThunkFunction)
```

For consistency with dispatching normal action objects, we typically write these as _thunk action creators_, which return the thunk function. These action creators can take arguments that can be used inside the thunk.

```ts
const logAndAdd = (amount: number) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const stateBefore = getState()
    console.log(`Counter before: ${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`Counter after: ${stateAfter.counter}`)
  }
}

store.dispatch(logAndAdd(5))
```

Thunks are typically written in ["slice" files](./part-2-app-structure.md#redux-slices), since the thunk data fetching is usually conceptually related to a particular slice's update logic. We'll look at a couple different ways to define thunks as we go through this section.

### Writing Async Thunks

Thunks may have async logic inside of them, such as `setTimeout`, Promises, and `async/await`. This makes them a good place to put HTTP calls to a server API.

Data fetching logic for Redux typically follows a predictable pattern:

- A "start" action is dispatched before the request, to indicate that the request is in progress. This may be used to track loading state to allow skipping duplicate requests or show loading indicators in the UI.
- The async request is made with `fetch` or a wrapper library, with a promise for the result
- When the request promise resolves, the async logic dispatches either a "success" action containing the result data, or a "failure" action containing error details. The reducer logic clears the loading state in both cases, and either processes the result data from the success case, or stores the error value for potential display.

These steps are not _required_, but are commonly used. (If all you care about is a successful result, you can just dispatch a single "success" action when the request finishes, and skip the "start" and "failure" actions.)

**Redux Toolkit provides a [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk) API to implement the creation and dispatching of actions describing an async request**.

Basic `createAsyncThunk` usage looks like this:

```ts title="createAsyncThunk example"
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchItemById = createAsyncThunk(
  'items/fetchItemById',
  async (itemId: string) => {
    const item = await someHttpRequest(itemId)
    return item
  }
)
```

See this details section for more info on how `createAsyncThunk` simplifies the code for dispatching actions for async requests. We'll see how it gets used in practice shortly.

<DetailedExplanation title="Detailed Explanation: Dispatching Request Status Actions in Thunks">

If we were to write out the code for a typical async thunk by hand, it might look like this:

```ts
const getRepoDetailsStarted = () => ({
  type: 'repoDetails/fetchStarted'
})
const getRepoDetailsSuccess = (repoDetails: RepoDetails) => ({
  type: 'repoDetails/fetchSucceeded',
  payload: repoDetails
})
const getRepoDetailsFailed = (error: any) => ({
  type: 'repoDetails/fetchFailed',
  error
})

const fetchIssuesCount = (org: string, repo: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(getRepoDetailsStarted())
    try {
      const repoDetails = await getRepoDetails(org, repo)
      dispatch(getRepoDetailsSuccess(repoDetails))
    } catch (err) {
      dispatch(getRepoDetailsFailed(err.toString()))
    }
  }
}
```

However, writing code using this approach is tedious. Each separate type of request needs repeated similar implementation:

- Unique action types need to be defined for the three different cases
- Each of those action types usually has a corresponding action creator function
- A thunk has to be written that dispatches the correct actions in the right sequence

`createAsyncThunk` abstracts this pattern by generating the action types and action creators, and generating a thunk that dispatches those actions automatically. You provide a callback function that makes the async call and returns a Promise with the result.

It's also easy to make mistakes with error handling when writing thunk logic yourself. In this case, the `try` block will actually catch errors from _both_ a failed request, _and_ any errors while dispatching. Handling this correctly would require restructuring the logic to separate those. `createAsyncThunk` already handles errors correctly for you internally.

</DetailedExplanation>

<br />

### Typing Redux Thunks

#### Typing Handwritten Thunks

If you're writing a thunk by hand, you can declare explicitly type the thunk arguments as `(dispatch: AppDispatch, getState: () => RootState)`. Since this is common, you can also define a reusable `AppThunk` type and use that instead:

```ts title="app/store.ts"
// highlight-next-line
import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'

// omit actual store setup

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
export type RootState = ReturnType<typeof store.getState>
// highlight-start
// Export a reusable type for handwritten thunks
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
// highlight-end
```

Then you can use that to describe the thunk functions you're writing:

```ts title="Example typed thunk"
// highlight-start
// Use `AppThunk` as the return type, since we return a thunk function
const logAndAdd = (amount: number): AppThunk => {
  // highlight-end
  return (dispatch, getState) => {
    const stateBefore = getState()
    console.log(`Counter before: ${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`Counter after: ${stateAfter.counter}`)
  }
}
```

#### Typing `createAsyncThunk`

For `createAsyncThunk` specifically: if your payload function accepts an argument, **provide a type for that argument, like `async (userId: string)`**. You do not need to provide a return type by default - TS will infer the return type automatically.

If you need to access `dispatch` or `getState` inside of `createAsyncThunk`, RTK provides a way to define a "pre-typed" version that has the correct `dispatch` and `getState`types built in by calling `createAsyncThunk.withTypes()`, equivalent to how we defined pre-typed versions of `useSelector` and `useDispatch`. We'll create a new `src/app/withTypes` files, and export it from there:

```ts title="app/withTypes.ts"
import { createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState, AppDispatch } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()
```

:::info Typing Thunks

For more details on defining thunks with TypeScript, see:

- [Type Checking Redux Thunks](../../usage/UsageWithTypescript.md#type-checking-redux-thunks)

:::

## Loading Posts

So far, our `postsSlice` has used some hardcoded sample data as its initial state. We're going to switch that to start with an empty array of posts instead, and then fetch a list of posts from the server.

In order to do that, we're going to have to change the structure of the state in our `postsSlice`, so that we can keep track of the current state of the API request.

### Loading State for Requests

When we make an API call, we can view its progress as a small state machine that can be in one of four possible states:

- The request hasn't started yet
- The request is in progress
- The request succeeded, and we now have the data we need
- The request failed, and there's probably an error message

We _could_ track that information using some booleans, like `isLoading: true`, but it's better to track these states as a single union value. A good pattern for this is to have a state section that looks like this (using TypeScript string union type notation):

```ts
{
  // Multiple possible status string union values
  status: 'idle' | 'pending' | 'succeeded' | 'failed',
  error: string | null
}
```

These fields would exist alongside whatever actual data is being stored. These specific string state names aren't required - feel free to use other names if you want, like `'loading'` instead of `'pending'`, or `'completed'` instead of `'succeeded'`.

We can use this information to decide what to show in our UI as the request progresses, and also add logic in our reducers to prevent cases like loading data twice.

Let's update our `postsSlice` to use this pattern to track loading state for a "fetch posts" request. We'll switch our state from being an array of posts by itself, to look like `{posts, status, error}`. We'll also remove the old sample post entries from our initial state, and add a couple new selectors for the loading and error fields:

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid } from '@reduxjs/toolkit'

// omit reactions and other types

// highlight-start
interface PostsState {
  posts: Post[]
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null
}
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        // highlight-next-line
        state.posts.push(action.payload)
      },
      prepare(title: string, content: string, userId: string) {
        // omit prepare logic
      }
    },
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>
    ) {
      const { postId, reaction } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(userLoggedOut, state => {
      // highlight-start
      // Clear out the list of posts whenever the user logs out
      return initialState
      // highlight-end
    })
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start

export const selectAllPosts = (state: RootState) => state.posts.posts

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.posts.find(post => post.id === postId)

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error
// highlight-end
```

As part of this change, we also need to change any uses of `state` as an array to be `state.posts` instead, because the array is now one level deeper.

Yes, this _does_ mean that we now have a nested object path that looks like `state.posts.posts`, which is somewhat repetitive and silly :) We _could_ change the nested array name to be `items` or `data` or something if we wanted to avoid that, but we'll leave it as-is for now.

### Fetching Data with `createAsyncThunk`

Redux Toolkit's `createAsyncThunk` API generates thunks that automatically dispatch those "start/success/failure" actions for you.

Let's start by adding a thunk that will make an HTTP request to retrieve a list of posts. We'll import the `client` utility from the `src/api` folder, and use that to make a request to `'/fakeApi/posts'`.

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
// highlight-next-line
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

// omit other imports and types

// highlight-start
export const fetchPosts = createAppAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get<Post[]>('/fakeApi/posts')
  return response.data
})
// highlight-end

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null
}
```

`createAsyncThunk` accepts two arguments:

- A string that will be used as the prefix for the generated action types
- A "payload creator" callback function that should return a Promise containing some data, or a rejected Promise with an error

The payload creator will usually make an HTTP request of some kind, and can either return the Promise from the HTTP request directly, or extract some data from the API response and return that. We typically write this using the JS `async/await` syntax, which lets us write functions that use promises while using standard `try/catch` logic instead of `somePromise.then()` chains.

In this case, we pass in `'posts/fetchPosts'` as the action type prefix.

In this case, the payload creation callback for `fetchPosts` doesn't need any arguments, and all it needs to do is wait for the API call to return a response. The response object looks like `{data: []}`, and we want our dispatched Redux action to have a payload that is _just_ the array of posts. So, we extract `response.data`, and return that from the callback.

If we try calling `dispatch(fetchPosts())`, the `fetchPosts` thunk will first dispatch an action type of `'posts/fetchPosts/pending'`:

![`createAsyncThunk`: posts pending action](/img/tutorials/essentials/devtools-posts-pending.png)

We can listen for this action in our reducer and mark the request status as `'pending'`.

Once the Promise resolves, the `fetchPosts` thunk takes the `response.data` array we returned from the callback, and dispatches a `'posts/fetchPosts/fulfilled'` action containing the posts array as `action.payload`:

![`createAsyncThunk`: posts pending action](/img/tutorials/essentials/devtools-posts-fulfilled.png)

### Reducers and Loading Actions

Next up, we need to handle both these actions in our reducers. This requires a bit deeper look at the `createSlice` API we've been using.

We've already seen that `createSlice` will generate an action creator for every reducer function we define in the `reducers` field, and that the generated action types include the name of the slice, like:

```js
console.log(
  postUpdated({ id: '123', title: 'First Post', content: 'Some text here' })
)
/*
{
  type: 'posts/postUpdated',
  payload: {
    id: '123',
    title: 'First Post',
    content: 'Some text here'
  }
}
*/
```

We've also seen that we can use [the `extraReducers` field in `createSlice` to respond to actions that were defined outside of the slice](./part-4-using-data.md##using-extrareducers-to-handle-other-actions).

In this case, we need to listen for the "pending" and "fulfilled" action types dispatched by our `fetchPosts` thunk. Those action creators are attached to our actual `fetchPost` function, and we can pass those to `extraReducers` to listen for those actions:

```ts title="features/posts/postsSlice.ts"
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get<Post[]>('/fakeApi/posts')
  return response.data
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // omit existing reducers here
  },

  extraReducers: builder => {
    builder
      .addCase(userLoggedOut, state => {
        // Clear out the list of posts whenever the user logs out
        return initialState
      })
      // highlight-start
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        state.posts.push(...action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unknown Error'
      })
    // highlight-end
  }
})
```

We'll handle all three action types that could be dispatched by the thunk, based on the Promise we returned:

- When the request starts, we'll set the `status` to `'pending'`
- If the request succeeds, we mark the `status` as `'succeeded'`, and add the fetched posts to `state.posts`
- If the request fails, we'll mark the `status` as `'failed'`, and save any error message into the state so we can display it

### Dispatching Thunks from Components

Now that we have the `fetchPosts` thunk written and the slice updated to handle those actions, let's update our `<PostsList>` component to actually kick off the data fetch for us.

We'll import the `fetchPosts` thunk into the component. Like all of our other action creators, we have to dispatch it, so we'll also need to add the `useAppDispatch` hook. Since we want to fetch this data when `<PostsList>` mounts, we need to import the React `useEffect` hook, and dispatch the action.

It's important that we only try to fetch the list of posts once. If we do it every time the `<PostsList>` component renders, or is re-created because we've switched between views, we might end up fetching the posts several times. We can use the `posts.status` value to help decide if we need to actually start fetching, by selecting that into the component and only starting the fetch if the status is `'idle'`, meaning it hasn't started yet.

```ts title="features/posts/PostsList.tsx"
// highlight-next-line
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

// highlight-next-line
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { TimeAgo } from '@/components/TimeAgo'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
// highlight-next-line
import { fetchPosts, selectAllPosts, selectPostsStatus } from './postsSlice'

export const PostsList = () => {
  // highlight-start
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postStatus = useAppSelector(selectPostsStatus)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])
  // highlight-end

  // omit rendering logic
}
```

And with that, we should now see a fresh list of posts showing up after we log in to our app!

![List of fetched posts](/img/tutorials/essentials/posts-fetched.png)

#### Avoiding Duplicate Fetches

The good news is we've successfully fetched those post objects from our mock server API.

Unfortunately, we've got a problem. Right now our posts list is showing duplicates of each post:

![Duplicate post items](/img/tutorials/essentials/posts-duplicates.png)

In fact, if we look at the Redux DevTools, we can see _two_ sets of `'pending'` and `'fulfilled'` actions were dispatched:

![Duplicate fetchPosts actions](/img/tutorials/essentials/devtools-posts-duplicate.png)

Why is that? Didn't we just add a check for `postStatus === 'idle'`? Shouldn't that be enough to make sure we only dispatch the thunk once?

Well, yes... and no :)

The actual logic here in the `useEffect` is correct. The issue is that right now we're looking at a development build of our application, and [in development, React will run all `useEffect` hooks twice on mount when inside of its `<StrictMode>` component](https://react.dev/reference/react/StrictMode) in order to make some kinds of bugs happen more obviously.

In this case, what happened is:

- The `<PostsList>` component mounted
- The `useEffect` hook ran for the first time. The `postStatus` value is `'idle'`, so it dispatches the `fetchPosts` thunk.
- `fetchPosts` immediately dispatches its `fetchPosts.pending` action, so the Redux store _did_ update the status to `'pending'` right away...
- **but React runs the `useEffect` _again_ without re-rendering the component, so the effect still thinks that `postStatus` is `'idle'` and dispatches `fetchPosts` a second time**
- Both thunks finish fetching their data and dispatch the `fetchPosts.fulfilled` action; consequently, the `fulfilled` reducer runs twice, resulting in a duplicate set of posts being added to the state

So, how can we fix this?

One option would be to remove the `<StrictMode>` tag from our app. But, the React team recommends using it, and it _is_ helpful for catching other issues.

We could write some complicated logic with the `useRef` hook to track if this component is _actually_ rendering for the first time, and use that to only dispatch `fetchPosts` once. But, that's kind of ugly.

The last option would be to use the actual `state.posts.status` value from the Redux state to check if there's already a request in progress, and have the thunk itself bail out if that's the case. Fortunately, `createAsyncThunk` gives us a way to do this.

#### Checking Async Thunk Conditions

`createAsyncThunk` accepts an optional `condition` callback we can use to do that check. If provided, it runs at the start of the thunk call, and it will cancel the entire thunk if `condition` returns `false.`

In this case, we know that we want to avoid running the thunk if the `state.posts.status` field is not `'idle'`. We already have a `selectPostsStatus` selector that we can use here, so we can add the `condition` option and check that value:

```ts title="features/posts/postsSlice.ts
export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  // highlight-start
  {
    condition(arg, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())
      if (postsStatus !== 'idle') {
        return false
      }
    }
  }
  // highlight-end
)
```

Now when we reload the page and look at the `<PostsList>`, we should only see one set of posts, with no duplicates, and we should only see one set of dispatched actions in the Redux DevTools.

**You don't _need_ to add `condition` to all thunks**, but there may be times it's useful to ensure only one request gets made at a time.

:::tip

Note that [RTK Query will manage this for you!](./part-7-rtk-query-basics.md) It deduplicates requests across _all_ components, so that each request only happens once, and you don't have to worry about doing this yourself.

:::

### Displaying Loading State

Our `<PostsList>` component is already checking for any updates to the posts that are stored in Redux, and rerendering itself any time that list changes. So, if we refresh the page, we should see a random set of posts from our fake API show up on screen. But, it seems like there's some lag - the `<PostsList>` is empty at first, and after a couple seconds the posts are displayed.

A real API call will probably take some time to return a response, so it's usually a good idea to show some kind of "loading..." indicator in the UI so the user knows we're waiting for data.

We can update our `<PostsList>` to show a different bit of UI based on the `state.posts.status` value: a spinner if we're loading, an error message if it failed, or the actual posts list if we have the data.

While we're at it, this is probably a good time to extract a `<PostExcerpt>` component to encapsulate the rendering for one item in the list as well.

The result might look like this:

```tsx title="features/posts/PostsList.tsx"
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useAppSelector, useAppDispatch } from '@/app/hooks'

// highlight-next-line
import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
import {
  Post,
  selectAllPosts,
  selectPostsError,
  fetchPosts
} from './postsSlice'

interface PostExcerptProps {
  post: Post
}

function PostExcerpt({ post }: PostExcerptProps) {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  )
}

export const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postStatus = useAppSelector(selectPostsStatus)
  // highlight-next-line
  const postsError = useAppSelector(selectPostsError)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  // highlight-start
  let content: React.ReactNode

  if (postStatus === 'pending') {
    content = <Spinner text="Loading..." />
  } else if (postStatus === 'succeeded') {
    // Sort posts in reverse chronological order by datetime string
    const orderedPosts = posts
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))

    content = orderedPosts.map(post => (
      <PostExcerpt key={post.id} post={post} />
    ))
  } else if (postStatus === 'rejected') {
    content = <div>{postsError}</div>
  }
  // highlight-end

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
```

You might notice that the API calls are taking a while to complete, and that the loading spinner is staying on screen for a couple seconds. Our mock API server is configured to add a 2-second delay to all responses, specifically to help visualize times when there's a loading spinner visible. If you want to change this behavior, you can open up `api/server.ts`, and alter this line:

```ts title="api/server.ts"
// Add an extra delay to all endpoints, so loading spinners show up.
const ARTIFICIAL_DELAY_MS = 2000
```

Feel free to turn that on and off as we go if you want the API calls to complete faster.

### Optional: Defining Thunks Inside of `createSlice`

Right now, our `fetchPosts` thunk is defined in the `postsSlice.ts` file, but _outside_ of the `createSlice()` call.

There's an optional way to define thunks _inside_ of `createSlice`, which requires changing how the `reducers` field is defined. See this explanation for details if you want to try it:

<DetailedExplanation title="Defining Thunks in createSlice">

We've seen that the standard way to write the `createSlice.reducers` field is as an object, where the keys become the action names, and the values are reducers. We also saw that the values can be [an object with the `{reducer, prepare}` functions](./part-4-using-data.md#preparing-action-payloads) for creating an action object with the values we want.

Alternately, the `reducers` field can be a callback function that receives a `create` object. This is somewhat similar to what we saw with `extraReducers`, but with a different set of methods for creating reducers and actions:

- `create.reducer<PayloadType>(caseReducer)`: defines a case reducer
- `create.preparedReducer(prepare, caseReducer)`: defines a reducer with a prepare callback

Then, return an object like before with the reducer names as the fields, but call the `create` methods to make each reducer. Here's what the `postsSlice` would look like converted to this syntax:

```ts
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  // highlight-start
  reducers: create => {
    return {
      postAdded: create.preparedReducer(
        (title: string, content: string, userId: string) => {
          return {
            payload: {
              id: nanoid(),
              date: new Date().toISOString(),
              title,
              content,
              user: userId,
              reactions: initialReactions
            }
          }
        },
        (state, action) => {
          state.posts.push(action.payload)
        }
      ),
      postUpdated: create.reducer<PostUpdate>((state, action) => {
        const { id, title, content } = action.payload
        const existingPost = state.posts.find(post => post.id === id)
        if (existingPost) {
          existingPost.title = title
          existingPost.content = content
        }
      }),
      reactionAdded: create.reducer<{ postId: string; reaction: ReactionName }>(
        (state, action) => {
          const { postId, reaction } = action.payload
          const existingPost = state.posts.find(post => post.id === postId)
          if (existingPost) {
            existingPost.reactions[reaction]++
          }
        }
      )
    }
  },
  // highlight-end
  extraReducers: builder => {
    // same as before
  }
})
```

Writing `reducers` as a callback opens the door for extending the capabilities of `createSlice`. In particular, it's possible to make a special version of `createSlice` that has the ability to use `createAsyncThunk` baked in.

First, import `buildCreateSlice` and `asyncThunkCreator`, then call `buildCreateSlice` like this:

```ts
import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit'

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator }
})
```

That gives you a version of `createSlice` with the ability to write thunks inside.

Finally, we can use that `createAppSlice` method to define our `postsSlice` with the `fetchPosts` thunk inside. When we do that, a couple other things change:

- We can't pass in the `RootState` generic directly, so we have to do `getState() as RootState` to cast it
- We can pass in all of the reducers that handle the thunk actions as part of the options to `create.asyncThunk()`, and remove those from the `extraReducers` field:

```ts
const postsSlice = createAppSlice({
  name: 'posts',
  initialState,
  reducers: create => {
    return {
      // omit the other reducers
      // highlight-start
      fetchPosts: create.asyncThunk(
        // Payload creator function to fetch the data
        async () => {
          const response = await client.get<Post[]>('/fakeApi/posts')
          return response.data
        },
        {
          // Options for `createAsyncThunk`
          options: {
            condition(arg, thunkApi) {
              const { posts } = thunkApi.getState() as RootState
              if (posts.status !== 'idle') {
                return false
              }
            }
          },
          // The case reducers to handle the dispatched actions.
          // Each of these is optional, but must use these names.
          pending: (state, action) => {
            state.status = 'pending'
          },
          fulfilled: (state, action) => {
            state.status = 'succeeded'
            // Add any fetched posts to the array
            state.posts.push(...action.payload)
          },
          rejected: (state, action) => {
            state.status = 'rejected'
            state.error = action.error.message ?? 'Unknown Error'
          }
        }
      )
      // highlight-end
    }
  },
  extraReducers: builder => {
    builder.addCase(userLoggedOut, state => {
      // Clear out the list of posts whenever the user logs out
      return initialState
    })
    // highlight-next-line
    // The thunk handlers have been removed here
  }
})
```

Remember, **the `create` callback syntax is optional!** The only time you _have_ to use it is if you really want to write thunks inside of `createSlice`. That said, it does remove the need to use the `PayloadAction` type, and cuts down on `extraReducers` as well.

</DetailedExplanation>

## Loading Users

We're now fetching and displaying our list of posts. But, if we look at the posts, there's a problem: they all now say "Unknown author" as the authors:

![Unknown post authors](/img/tutorials/essentials/posts-unknownAuthor.png)

This is because the post entries are being randomly generated by the fake API server, which also randomly generates a set of fake users every time we reload the page. We need to update our users slice to fetch those users when the application starts.

Like last time, we'll create another async thunk to get the users from the API and return them, then handle the `fulfilled` action in the `extraReducers` slice field. We'll skip worrying about loading state for now:

```ts title="features/users/usersSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// highlight-next-line
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

interface User {
  id: string
  name: string
}

// highlight-start
export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: User[] = []
// highlight-end

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  // highlight-start
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload
    })
  }
  // highlight-end
})

export default usersSlice.reducer

// omit selectors
```

You may have noticed that this time the case reducer isn't using the `state` variable at all. Instead, we're returning the `action.payload` directly. **Immer lets us update state in two ways: either _mutating_ the existing state value, or _returning_ a new result**. If we return a new value, that will replace the existing state completely with whatever we return. (Note that if you want to manually return a new value, it's up to you to write any immutable update logic that might be needed.)

The initial state was an empty array, and we probably could have done `state.push(...action.payload)` to mutate it. But, in our case we really want to replace the list of users with whatever the server returned, and this avoids any chance of accidentally duplicating the list of users in state.

:::info

To learn more about how state updates with Immer work, see the ["Writing Reducers with Immer" guide in the RTK docs](https://redux-toolkit.js.org/usage/immer-reducers#immer-usage-patterns).

:::

We only need to fetch the list of users once, and we want to do it right when the application starts. We can do that in our `main.tsx` file, and directly dispatch the `fetchUsers` thunk because we have the `store` right there:

```tsx title="main.tsx"
// omit other imports

import store from './app/store'
// highlight-next-line
import { fetchUsers } from './features/users/usersSlice'

import { worker } from './api/server'

async function start() {
  // Start our mock API server
  await worker.start({ onUnhandledRequest: 'bypass' })

  // highlight-next-line
  store.dispatch(fetchUsers())

  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

start()
```

Notice that this is a valid way to fetch data on startup. This actually starts the fetching process _before_ we start rendering our React components, so the data should be available sooner. (Note that this principle can be applied by using [React Router data loaders](https://reactrouter.com/en/main/route/loader) as well.)

Now, each of the posts should be showing a username again, and we should also have that same list of users shown in the "Author" dropdown in our `<AddPostForm>`.

## Adding New Posts

We have one more step for this section. When we add a new post from the `<AddPostForm>`, that post is only getting added to the Redux store inside our app. We need to actually make an API call that will create the new post entry in our fake API server instead, so that it's "saved". (Since this is a fake API, the new post won't persist if we reload the page, but if we had a real backend server it would be available next time we reload.)

### Sending Data with Thunks

We can use `createAsyncThunk` to help with sending data, not just fetching it. We'll create a thunk that accepts the values from our `<AddPostForm>` as an argument, and makes an HTTP POST call to the fake API to save the data.

In the process, we're going to change how we work with the new post object in our reducers. Currently, our `postsSlice` is creating a new post object in the `prepare` callback for `postAdded`, and generating a new unique ID for that post. In most apps that save data to a server, the server will take care of generating unique IDs and filling out any extra fields, and will usually return the completed data in its response. So, we can send a request body like `{ title, content, user: userId }` to the server, and then take the complete post object it sends back and add it to our `postsSlice` state. We'll also extract a `NewPost` type to represent the object that gets passed into the thunk.

```ts title="features/posts/postsSlice.ts"
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
// highlight-next-line
type NewPost = Pick<Post, 'title' | 'content' | 'user'>

// highlight-start
export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost: NewPost) => {
    // We send the initial data to the fake API server
    const response = await client.post<Post>('/fakeApi/posts', initialPost)
    // The response includes the complete post object, including unique ID
    return response.data
  }
)
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-next-line
    // The existing `postAdded` reducer and prepare callback were deleted
    reactionAdded(state, action) {}, // omit logic
    postUpdated(state, action) {} // omit logic
  },
  extraReducers(builder) {
    builder
      // omit the cases for `fetchPosts` and `userLoggedOut`
      // highlight-start
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.posts.push(action.payload)
      })
    // highlight-end
  }
})

// highlight-start
// Remove `postAdded`
export const { postUpdated, reactionAdded } = postsSlice.actions
// highlight-end
```

### Checking Thunk Results in Components

Finally, we'll update `<AddPostForm>` to dispatch the `addNewPost` thunk instead of the old `postAdded` action. Since this is another API call to the server, it will take some time and _could_ fail. The `addNewPost()` thunk will automatically dispatch its `pending/fulfilled/rejected` actions to the Redux store, which we're already handling.

We _could_ track the request status in `postsSlice` using a second loading union type if we wanted to. But, for this example let's keep the loading state tracking limited to the component, to show what else is possible.

It would be good if we can at least disable the "Save Post" button while we're waiting for the request, so the user can't accidentally try to save a post twice. If the request fails, we might also want to show an error message here in the form, or perhaps just log it to the console.

We can have our component logic wait for the async thunk to finish, and check the result when it's done:

```tsx title="features/posts/AddPostForm.tsx"
// highlight-next-line
import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { selectCurrentUsername } from '@/features/auth/authSlice'

// highlight-next-line
import { addNewPost } from './postsSlice'

// omit field types

export const AddPostForm = () => {
  // highlight-start
  const [addRequestStatus, setAddRequestStatus] = useState<'idle' | 'pending'>(
    'idle'
  )
  // highlight-end

  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectCurrentUsername)!

  // highlight-next-line
  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    // highlight-start
    const form = e.currentTarget

    try {
      setAddRequestStatus('pending')
      await dispatch(addNewPost({ title, content, user: userId })).unwrap()

      form.reset()
    } catch (err) {
      console.error('Failed to save the post: ', err)
    } finally {
      setAddRequestStatus('idle')
    }
    // highlight-end
  }

  // omit rendering logic
}
```

We can add a loading status as a React `useState` hook, similar to how we're tracking loading state in `postsSlice` for fetching posts. In this case, we just want to know if the request is in progress or not.

When we call `dispatch(addNewPost())`, the async thunk returns a Promise from `dispatch`. We can `await` that promise here to know when the thunk has finished its request. But, we don't yet know if that request succeeded or failed.

`createAsyncThunk` handles any errors internally, so that we don't see any messages about "rejected Promises" in our logs. It then returns the final action it dispatched: either the `fulfilled` action if it succeeded, or the `rejected` action if it failed. That means that **`await dispatch(someAsyncThunk())` _always_ "succeeds", and the result is the action object itself**.

However, it's common to want to write logic that looks at the success or failure of the actual request that was made. **Redux Toolkit adds a `.unwrap()` function to the returned Promise**, which will return a new Promise that either has the actual `action.payload` value from a `fulfilled` action, or throws an error if it's the `rejected` action. This lets us handle success and failure in the component using normal `try/catch` logic. So, we'll clear out the input fields to reset the form if the post was successfully created, and log the error to the console if it failed.

If you want to see what happens when the `addNewPost` API call fails, try creating a new post where the "Content" field only has the word "error" (without quotes). The server will see that and send back a failed response, so you should see a message logged to the console.

## What You've Learned

Async logic and data fetching are always a complex topic. As you've seen, Redux Toolkit includes some tools to automate the typical Redux data fetching patterns.

Here's what our app looks like now that we're fetching data from that fake API:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-3-postRequests?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

As a reminder, here's what we covered in this section:

:::tip Summary

- **Redux uses plugins called "middleware" to enable async logic**
  - The standard async middleware is called `redux-thunk`, which is included in Redux Toolkit
  - Thunk functions receive `dispatch` and `getState` as arguments, and can use those as part of async logic
- **You can dispatch additional actions to help track the loading status of an API call**
  - The typical pattern is dispatching a "pending" action before the call, then either a "success" containing the data or a "failure" action containing the error
  - Loading state should usually be stored as a union of string literals, like `'idle' | 'pending' | 'succeeded' | 'rejected'`
- **Redux Toolkit has a `createAsyncThunk` API that dispatches these actions for you**
  - `createAsyncThunk` accepts a "payload creator" callback that should return a Promise, and generates `pending/fulfilled/rejected` action types automatically
  - Generated action creators like `fetchPosts` dispatch those actions based on the Promise you return
  - You can listen for these action types in `createSlice` using the `extraReducers` field, and update the state in reducers based on those actions.
  - `createAsyncThunk` has a `condition` option that can be used to cancel a request based on the Redux state
  - Thunks can return promises. For `createAsyncThunk` specifically, you can `await dispatch(someThunk()).unwrap()` to handle the request success or failure at the component level.

:::

## What's Next?

We've got one more set of topics to cover the core Redux Toolkit APIs and usage patterns. In [Part 6: Performance and Normalizing Data](./part-6-performance-normalization.md), we'll look at how Redux usage affects React performance, and some ways we can optimize our application for improved performance.
