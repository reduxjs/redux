---
id: quick-start-part-5
title: 'Redux Quick Start, Part 5, Performance and Normalizing Data'
sidebar_label: 'Performance and Normalizing Data'
hide_title: true
description: The official Quick Start tutorial for Redux - the fastest way to learn and start using Redux today!
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Quick Start, Part 5: Performance and Normalizing Data

:::tip What You'll Learn

- How to create memoized selector functions with `createSelector`
- Patterns for optimizing component rendering performance
- How to use `createEntityAdapter` to store and update normalized data

:::

:::info Prerequisites

- Completion of the previous sections of this tutorial

:::

## Introduction

In [Part 4 of this tutorial](./quick-start-part-4.md), we saw how write async thunks to fetch data from a server API, patterns for handling async request loading state, and use of selector functions for encapsulating lookups of data from the Redux state.

In this final section, we'll look at optimized patterns for ensuring good performance in our application, and techniques for automatically handling common updates of data in the store.

So far, most of our functionality has been centered around the `posts` feature. We're going to add a couple new sections of the app. After those are added, we'll look at some specific details of how we've built things, and talk about some weaknesses with what we've built so far and how we can improve the implementation.

## Adding User Pages

We're fetching a list of users from our fake API, and we can choose a user as the author when we add a new post. But, a social media app needs the ability to look at the page for a specific user and see all the posts they've made. Let's add a page to show the list of all users, and another to show all posts by a specific user.

We'll start by adding a new `<UsersList>` component. It follows the usual pattern of reading some data from the store with `useSelector`, and mapping over the array to show a list of users with links to their individual pages:

```jsx title="features/users/UsersList.js"
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectAllUsers } from './usersSlice'

export const UsersList = () => {
  const users = useSelector(selectAllUsers)

  const renderedUsers = users.map(user => (
    <li key={user.id}>
      <Link to={`/users/${user.id}`}>{user.name}</Link>
    </li>
  ))

  return (
    <section>
      <h2>Users</h2>

      <ul>{renderedUsers}</ul>
    </section>
  )
}
```

We don't yet have a `selectAllUsers` selector, so we'll need to add that to `usersSlice.js` along with a `selectUserById` selector:

```js title="features/users/usersSlice.js"
export default usersSlice.reducer

// highlight-start
export const selectAllUsers = state => state.users

export const selectUserById = (state, userId) =>
  state.users.find(user => user.id === userId)
// highlight-end
```

And we'll add a `<UserPage>`, which is similar to our `<SinglePostPage>` in taking a `userId` parameter from the router:

```jsx title="features/users/UserPage.js"
import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { selectUserById } from '../users/usersSlice'
import { selectAllPosts } from '../posts/postsSlice'

export const UserPage = ({ match }) => {
  const { userId } = match.params

  const user = useSelector(state => selectUserById(state, userId))

  const postsForUser = useSelector(state => {
    const allPosts = selectAllPosts(state)
    return allPosts.filter(post => post.user === userId)
  })

  const postTitles = postsForUser.map(post => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ))

  return (
    <section>
      <h2>{user.name}</h2>

      <ul>{postTitles}</ul>
    </section>
  )
}
```

As we've seen before, we can take data from one `useSelector` call, or from props, and use that to to help decide what to read from the store in another `useSelector` call.

Add routes for these components in `<App>`:

```jsx title="App.js"
          <Route exact path="/posts/:postId" component={SinglePostPage} />
          <Route exact path="/editPost/:postId" component={EditPostForm} />
          // highlight-start
          <Route exact path="/users" component={UsersList} />
          <Route exact path="/users/:userId" component={UserPage} />
          // highlight-end
          <Redirect to="/" />
```

And add another tab in `<Navbar>` that links to `/users` so that we can click and go to `<UsersList>`.

## Adding Notifications

No social media app would be complete without some notifications popping up to tell us that someone has sent a message, left a comment, or reacted to one of our posts.

In a real application, our app client would be in constant communication with the backend server, and the server would push an update to the client every time something happens. Since this is a small example app, we're going to mimic that process by adding a button to actually fetch some notification entries from our fake API. We also don't have any other _real_ users sending messages or reacting to posts, so the fake API will just create some random notification entries every time we make a request. (Remember, the goal here is to see how to use Redux itself.)

### Notifications Slice

Since this is a new part of our app, the first step is to create a new slice for our notifications, and an async thunk to fetch some notification entries from the API:

```js title="features/notifications/notificationsSlice.js"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { client } from '../../api/client'

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { getState }) => {
    const allNotifications = selectAllNotifications(getState())
    const [latestNotification] = allNotifications.slice(-1)
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.notifications
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {},
  extraReducers: {
    [fetchNotifications.fulfilled]: (state, action) => {
      state.push(...action.payload)
      // Sort with newest last
      state.sort((a, b) => b.date.localeCompare(a.date))
    }
  }
})

export default notificationsSlice.reducer

export const selectAllNotifications = state => state.notifications
```

As with the other slices, import `notificationsReducer` into `store.js` and add it to the `configureStore()` call.

We've written an async thunk called `fetchNotifications`, which will retrieve a list of new notifications from the server. As part of that, we want to use the creation timestamp of the most recent notification as part of our request, so that the server knows it should only send back notifications that are actually new.

We know that we will be getting back an array of notifications, so we can pass them as separate arguments to `state.push()`, and the array will add each item. We also want to make sure that they're sorted so that the most recent notification is last in the array, just in case the server were to send them out of order. (As a reminder, `array.sort()` always mutates the existing array - this is only safe because we're using `createSlice` and Immer inside.)

### Thunk Arguments

If you look at our `fetchNotifications` thunk, it has something new that we haven't seen before. Let's talk about thunk arguments for a minute.

We've already seen that we can pass an argument into a thunk action creator when we dispatch it, like `dispatch(addPost(newPost))`. For `createAsyncThunk` specifically, you can only pass in one argument, and whatever we pass in becomes the first argument of the payload creation callback.

The second argument to our payload creator is a `thunkAPI` object containing several useful functions and pieces of information:

- `dispatch` and `getState`: the actual `dispatch` and `getState` methods from our Redux store. You can use these inside the thunk to dispatch more actions, or get the latest Redux store state (such as reading an updated value after another action is dispatched).
- `extra`: the "extra argument" that can be passed into the thunk middleware when creating the store. This is typically some kind of API wrapper, such as a set of functions that know how to make API calls to your application's server and return data, so that your thunks don't have to have all the URLs and query logic directly inside.
- `requestId`: a unique random ID value for this thunk call. Useful for tracking status of an individual request.
- `signal`: An `AbortController.signal` function that can be used to cancel an in-progress request.
- `rejectWithValue`: a utility that helps customize the contents of a `rejected` action if the thunk receives an error.

(If you're writing a thunk by hand instead of using `createAsyncThunk, the thunk function will get`(dispatch, getState)` as separate arguments, instead of putting them together in one object.)

:::info

For more details on these arguments and how to handle canceling thunks and requests, see [the `createAsyncThunk` API reference page](https://redux-toolkit.js.org/api/createAsyncThunk).

:::

In this case, we know that the list of notifications is in our Redux store state, and that the latest notification should be last in the array. We can destructure the `getState` function out of the `thunkAPI` object, call it to read the state value, and use the `selectAllNotifications` selector to give us just the array of notifications. Then, to get the last item in the array, we can use `allNotifications.slice(-1)` to create a new array with just the last item, and destructure that. (It's a bit tricky, but also nicer to read than doing `allNotifications[allNotifications.length - 1]`.)

### Adding the Notifications List

With that slice created, we can add a `<NotificationsList>` component:

```jsx title="features/notifications/NotificationsList.js"
import React from 'react'
import { useSelector } from 'react-redux'
import { formatDistanceToNow, parseISO } from 'date-fns'

import { selectAllUsers } from '../users/usersSlice'

import { selectAllNotifications } from './notificationsSlice'

export const NotificationsList = () => {
  const notifications = useSelector(selectAllNotifications)
  const users = useSelector(selectAllUsers)

  const renderedNotifications = notifications.map(notification => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user = users.find(user => user.id === notification.user) || {
      name: 'Unknown User'
    }

    return (
      <div key={notification.id} className="notification">
        <div>
          <b>{user.name}</b> {notification.message}
        </div>
        <div title={notification.date}>
          <i>{timeAgo} ago</i>
        </div>
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
```

Once again, we're reading a list of items from the Redux state, mapping over them, and rendering content for each item.

We also need to update the `<Navbar>` to add a "Notifications" tab, and a new button to fetch some notifications:

```jsx title="app/Navbar.js"
import React from 'react'
// highlight-next-line
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

// highlight-next-line
import { fetchNotifications } from '../features/notifications/notificationsSlice'

export const Navbar = () => {
  // highlight-start
  const dispatch = useDispatch()

  const fetchNewNotifications = () => {
    dispatch(fetchNotifications())
  }
  // highlight-end

  return (
    <nav>
      <section>
        <h1>Redux Quick Start Example</h1>

        <div className="navContent">
          <div className="navLinks">
            <Link to="/">Posts</Link>
            <Link to="/users">Users</Link>
            // highlight-next-line
            <Link to="/notifications">Notifications</Link>
          </div>
          // highlight-start
          <button className="button" onClick={fetchNewNotifications}>
            Refresh Notifications
          </button>
          // highlight-end
        </div>
      </section>
    </nav>
  )
}
```

Here's what the "Notifications" tab looks like so far:

![Initial Notifications tab](/img/tutorials/quickstart-notifications-initial.png)

### Showing New Notifications

Each time we click "Refresh Notifications", a few more notification entries will be added to our list. In a real app, those could be coming from the server while we're looking at other parts of the UI. We can do something similar by clicking "Refresh Notifications" while we're looking at the `<PostsList>` or `<UserPage>`. But, right now we have no idea how many notifications just arrived, and if we keep clicking the button, there could be many notifications we haven't read yet. Let's add some logic to keep track of which notifications have been read and which of them are "new". That will let us show the count of "Unread" notifications as a badge on our "Notifications" tab in the navbar, and display new notifications in a different color.

Our fake API is already sending back the notification entries with `isNew` and `read` fields, so we can use those in our code.

First, we'll update `notificationsSlice` to have a reducer that marks all notifications as read, and some logic to handle marking existing notifications as "not new":

```js title="features/notifications/notificationsSlice.js"
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: [],
  reducers: {
    // highlight-start
    allNotificationsRead(state, action) {
      state.forEach(notification => {
        notification.read = true
      })
    }
    // highlight-end
  },
  extraReducers: {
    [fetchNotifications.fulfilled]: (state, action) => {
      // highlight-start
      state.forEach(notification => {
        // Any notifications we've read are no longer new
        notification.isNew = !notification.read
      })
      // highlight-end
      state.push(...action.payload)
      // Sort with newest last
      state.sort((a, b) => b.date.localeCompare(a.date))
    }
  }
})

// highlight-next-line
export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer
```

We want to mark these notifications as read whenever our `<NotificationsList>` component renders, either because we clicked on the tab to view the notifications, or because we already have it open and we just received some additional notifications. We can do this by dispatching `allNotificationsRead` in a `useEffect` hook. We also want to add an additional classname to any notification list entries in the page, to highlight them:

```js title="features/notifications/NotificationsList.js"
import React, { useEffect } from 'react'
// highlight-next-line
import { useSelector, useDispatch } from 'react-redux'
import { formatDistanceToNow, parseISO } from 'date-fns'
// highlight-next-line
import classnames from 'classnames'

import { selectAllUsers } from '../users/usersSlice'

// highlight-start
import {
  selectAllNotifications,
  allNotificationsRead
} from './notificationsSlice'
// highlight-end

export const NotificationsList = () => {
  // highlight-next-line
  const dispatch = useDispatch()
  const notifications = useSelector(selectAllNotifications)
  const users = useSelector(selectAllUsers)

  // highlight-start
  useEffect(() => {
    dispatch(allNotificationsRead())
  })
  // highlight-end

  const renderedNotifications = notifications.map(notification => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user = users.find(user => user.id === notification.user) || {
      name: 'Unknown User'
    }

    // highlight-start
    const notificationClassname = classnames('notification', {
      new: notification.isNew
    })

    return (
      <div key={notification.id} className={notificationClassname}>
        // highlight-end
        <div>
          <b>{user.name}</b> {notification.message}
        </div>
        <div title={notification.date}>
          <i>{timeAgo} ago</i>
        </div>
      </div>
    )
  })

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  )
}
```

This works, but actually has a slightly surprising bit of behavior. Any time there are new notifications (either because we've just switched to this tab, or we've fetched some new notifications from the API), you'll actually see _two_ `"notifications/allNotificationsRead"` actions dispatched. Why is that?

Let's say we have fetched some notifications while looking at the `<PostsList>`, and then click the "Notifications" tab. The `<NotificationsList>` component will mount, and the `useEffect` callback will run after that first render and dispatch `allNotificationsRead`. Our `notificationsSlice` will handle that by updating the notification entries in the store. This creates a new `state.notifications` array containing the immutably-updated entries, which forces our component to render again because it sees a new array returned from the `useSelector`, and the `useEffect` hook runs again and dispatches `allNotificationsRead` a second time. The reducer runs again, but this time no data changes, so the component doesn't re-render.

There's a couple ways we could potentially avoid that second dispatch, like splitting the logic to dispatch once when the component mounts, and only dispatch again if the size of the notifications array changes. But, this isn't actually hurting anything, so we can leave it alone.

This does actually show that it's possible to dispatch an action and not have _any_ state changes happen at all. Remember, it's always up to your reducers to decide _if_ any state actually needs to be updated, and "nothing needs to happen" is a valid decision for a reducer to make.

Here's how the notifications tab looks now that we've got the "new/read" behavior working:

![New notifications](/img/tutorials/quickstart-notifications-new.png)

## What You've Learned

Congratulations, you've completed the Quick Start tutorial! Let's see what the final app looks like in action:

<!--

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/markerikson/redux-quickstart-example-app/tree/checkpoint-4-entitySlices/?fontsize=14&hidenavigation=1&theme=dark"
  title="redux-quick-start-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

-->

As a reminder, here's what we covered in this section:

:::tip

:::

## What's Next?

The concepts we've covered in this tutorial should be enough to get you started building your own applications using React and Redux. Now's a great time to try working on a project yourself to solidify these concepts and see how they work in practice. If you're not sure what kind of a project to build, see [this list of app project ideas](https://github.com/florinpop17/app-ideas) for some inspiration.

The Quick Start tutorial focused on "how to use Redux correctly", rather than "how it works" or "why it works this way". In particular, Redux Toolkit is a higher-level set of abstractions and utilities, and it's helpful to understand what the abstractions in RTK are actually doing for you. Reading through the [Basic Tutorial](../../basics/README.md) and [Advanced Tutorial](../../advanced/README.md) will help you understand how to write Redux code "by hand", and why we recommend Redux Toolkit as the default way to write Redux logic.

:::info

While the concepts in the "Basic" and "Advanced" tutorials are still valid, those pages are some of the oldest parts of our docs. We'll be updating those tutorials soon to improve the explanations and show some patterns that are simpler and easier to use. Keep an eye out for those updates. We'll also be reorganizing our docs to make it easier to find information.

:::

The [Recipes](../../recipes/README.md) section has information on a number of important concepts, like [how to structure your reducers](../../recipes/structuring-reducers/StructuringReducers.md), and [our Style Guide page](../../style-guide/style-guide) has important information on our recommended patterns and best practices.

If you'd like to know more about _why_ Redux exists, what problems it tries to solve, and how it's meant to be used, see Redux maintainer Mark Erikson's posts on [The Tao of Redux, Part 1: Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) and [The Tao of Redux, Part 2: Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/).

If you're looking for help with Redux questions, come join [the `#redux` channel in the Reactiflux server on Discord](https://www.reactiflux.com).

Thanks for reading through this tutorial, and we hope you enjoy building applications with Redux!
