---
id: part-6-performance-normalization
title: 'Redux Essentials, Part 6: Performance, Normalizing Data, and Reactive Logic'
sidebar_label: 'Performance, Normalizing Data, and Reactive Logic'
description: 'The official Redux Essentials tutorial: learn how to improve app performance and structure data correctly'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip What You'll Learn

- How to create memoized selector functions with `createSelector`
- Patterns for optimizing component rendering performance
- How to use `createEntityAdapter` to store and update normalized data
- How to use `createListenerMiddleware` for reactive logic

:::

:::info Prerequisites

- Completion of [Part 5](./part-5-async-logic.md) to understand data fetching flow

:::

## Introduction

In [Part 5: Async Logic and Data Fetching](./part-5-async-logic.md), we saw how to write async thunks to fetch data from a server API, patterns for handling async request loading state, and use of selector functions for encapsulating lookups of data from the Redux state.

In this section, we'll look at optimized patterns for ensuring good performance in our application, and techniques for automatically handling common updates of data in the store. We'll also look at how to write reactive logic that responds to dispatched actions.

So far, most of our functionality has been centered around the `posts` feature. We're going to add a couple new sections of the app. After those are added, we'll look at some specific details of how we've built things, and talk about some weaknesses with what we've built so far and how we can improve the implementation.

## Adding More User Features

### Adding User Pages

We're fetching a list of users from our fake API, and we can choose a user as the author when we add a new post. But, a social media app needs the ability to look at the page for a specific user and see all the posts they've made. Let's add a page to show the list of all users, and another to show all posts by a specific user.

We'll start by adding a new `<UsersList>` component. It follows the usual pattern of reading some data from the store with `useSelector`, and mapping over the array to show a list of users with links to their individual pages:

```tsx title="features/users/UsersList.tsx"
import { Link } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'

import { selectAllUsers } from './usersSlice'

export const UsersList = () => {
  const users = useAppSelector(selectAllUsers)

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

And we'll add a `<UserPage>`, which is similar to our `<SinglePostPage>` in taking a `userId` parameter from the router:

```tsx title="features/users/UserPage.ts"
import { Link, useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'
import { selectAllPosts } from '@/features/posts/postsSlice'

import { selectUserById } from './usersSlice'

export const UserPage = () => {
  const { userId } = useParams()

  const user = useAppSelector(state => selectUserById(state, userId!))

  const postsForUser = useAppSelector(state => {
    const allPosts = selectAllPosts(state)
    // ⁉️ This seems sketchy! See more details below
    return allPosts.filter(post => post.user === userId)
  })

  if (!user) {
    return (
      <section>
        <h2>User not found!</h2>
      </section>
    )
  }

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

Note that we already have the `selectAllUsers` and `selectUserById` selectors available in our `usersSlice`, so we can just import and use those in the components.

As we've seen before, we can take data from one `useSelector` call, or from props, and use that to help decide what to read from the store in another `useSelector` call.

As usual, we will add routes for these components in `<App>`:

```tsx title="App.tsx"
          <Route exact path="/posts/:postId" component={SinglePostPage} />
          <Route exact path="/editPost/:postId" component={EditPostForm} />
          // highlight-start
          <Route exact path="/users" component={UsersList} />
          <Route exact path="/users/:userId" component={UserPage} />
          // highlight-end
          <Redirect to="/" />
```

We'll also add another tab in `<Navbar>` that links to `/users` so that we can click and go to `<UsersList>`:

```tsx title="app/Navbar.tsx"
export const Navbar = () => {
  // omit other logic

  navContent = (
    <div className="navContent">
      <div className="navLinks">
        <Link to="/posts">Posts</Link>
        // highlight-next-line
        <Link to="/users">Users</Link>
      </div>
      <div className="userDetails">
        <UserIcon size={32} />
        {user.name}
        <button className="button small" onClick={onLogoutClicked}>
          Log Out
        </button>
      </div>
    </div>
  )

  // omit other rendering
}
```

Now we can actually browse to each user's page and see a list of just their posts.

### Sending Login Requests to the Server

Right now our `<LoginPage>` and `authSlice` are just dispatching client-side Redux actions to track the current username. In practice, we really need to send a login request to the server. Like we've done with posts and users, we'll convert the login and logout handling to async thunks instead.

```ts title="features/auth/authSlice.ts"
// highlight-next-line
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

// highlight-next-line
import { client } from '@/api/client'

interface AuthState {
  username: string | null
}

// highlight-start
export const login = createAsyncThunk(
  'auth/login',
  async (username: string) => {
    await client.post('/fakeApi/login', { username })
    return username
  }
)

export const logout = createAsyncThunk('auth/logout', async () => {
  await client.post('/fakeApi/logout', {})
})
// highlight-end

const initialState: AuthState = {
  // Note: a real app would probably have more complex auth state,
  // but for this example we'll keep things simple
  username: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // highlight-start
  // Remove the reducer definitions
  reducers: {},
  extraReducers: builder => {
    // and handle the thunk actions instead
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.username = action.payload
      })
      .addCase(logout.fulfilled, state => {
        state.username = null
      })
  }
  // highlight-end
})

// highlight-next-line
// Removed the exported actions

export default authSlice.reducer
```

Along with that, we'll update `<Navbar>` and `<LoginPage>` to import and dispatch the new thunks instead of the previous action creators.

Since the `userLoggedOut` action creator was being used by the `postsSlice`, we can update that to listen to `logout.fulfilled` instead:

```ts title="features/posts/postsSlice.ts"
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { client } from '@/api/client'

import type { RootState } from '@/app/store'

// highlight-start
// Import this thunk instead
import { logout } from '@/features/auth/authSlice'
// highlight-end

// omit types and setup

const postsSlice = createSlice({
  name,
  initialState,
  reducers: {
    /* omitted */
  },
  extraReducers: builder => {
    builder
      // highlight-start
      // switch to handle the thunk fulfilled action
      .addCase(logout.fulfilled, state => {
        // highlight-end
        // Clear out the list of posts whenever the user logs out
        return initialState
      })
    // omit other cases
  }
})
```

## Adding Notifications

No social media app would be complete without some notifications popping up to tell us that someone has sent a message, left a comment, or reacted to one of our posts.

In a real application, our app client would be in constant communication with the backend server, and the server would push an update to the client every time something happens. Since this is a small example app, we're going to mimic that process by adding a button to actually fetch some notification entries from our fake API. We also don't have any other _real_ users sending messages or reacting to posts, so the fake API will just create some random notification entries every time we make a request. (Remember, the goal here is to see how to use Redux itself.)

### Notifications Slice

Since this is a new part of our app, the first step is to create a new slice for our notifications, and an async thunk to fetch some notification entries from the API. In order to create some realistic notifications, we'll include the timestamp of the latest notification we have in state. That will let our mock server generate notifications newer than that timestamp.

```ts title="features/notifications/notificationsSlice.ts"
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { client } from '@/api/client'

import type { RootState } from '@/app/store'

export interface Notification {
  id: string
  date: string
  message: string
  user: string
}

export const fetchNotifications = createAsyncThunk<
  Notification[],
  void,
  {
    state: RootState
  }
>('notifications/fetchNotifications', async (_unused, thunkApi) => {
  const allNotifications = selectAllNotifications(thunkApi.getState())
  const [latestNotification] = allNotifications
  const latestTimestamp = latestNotification ? latestNotification.date : ''
  const response = await client.get<Notification[]>(
    `/fakeApi/notifications?since=${latestTimestamp}`
  )
  return response.data
})

const initialState: Notification[] = []

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.push(...action.payload)
      // Sort with newest first
      state.sort((a, b) => b.date.localeCompare(a.date))
    })
  }
})

export default notificationsSlice.reducer

export const selectAllNotifications = (state: RootState) => state.notifications
```

As with the other slices, import `notificationsReducer` into `store.ts` and add it to the `configureStore()` call.

We've written an async thunk called `fetchNotifications`, which will retrieve a list of new notifications from the server. As part of that, we want to use the creation timestamp of the most recent notification as part of our request, so that the server knows it should only send back notifications that are actually new.

We know that we will be getting back an array of notifications, so we can pass them as separate arguments to `state.push()`, and the array will add each item. We also want to make sure that they're sorted so that the most recent notification is first in the array, just in case the server were to send them out of order. (As a reminder, `array.sort()` always mutates the existing array - this is only safe because we're using `createSlice` and Immer inside.)

### Thunk Arguments

If you look at our `fetchNotifications` thunk, it has something new that we haven't seen before. Let's talk about thunk arguments for a minute.

We've already seen that we can pass an argument into a thunk action creator when we dispatch it, like `dispatch(addPost(newPost))`. For `createAsyncThunk` specifically, you can only pass in one argument, and whatever we pass in becomes the first argument of the payload creation callback. If we don't actually pass anything in, then that argument becomes `undefined`.

The second argument to our payload creator is a `thunkAPI` object containing several useful functions and pieces of information:

- `dispatch` and `getState`: the actual `dispatch` and `getState` methods from our Redux store. You can use these inside the thunk to dispatch more actions, or get the latest Redux store state (such as reading an updated value after another action is dispatched).
- `extra`: the "extra argument" that can be passed into the thunk middleware when creating the store. This is typically some kind of API wrapper, such as a set of functions that know how to make API calls to your application's server and return data, so that your thunks don't have to have all the URLs and query logic directly inside.
- `requestId`: a unique random ID value for this thunk call. Useful for tracking status of an individual request.
- `signal`: An `AbortController.signal` function that can be used to cancel an in-progress request.
- `rejectWithValue`: a utility that helps customize the contents of a `rejected` action if the thunk receives an error.

(If you're writing a thunk by hand instead of using `createAsyncThunk`, the thunk function will get`(dispatch, getState)` as separate arguments, instead of putting them together in one object.)

:::info

For more details on these arguments and how to handle canceling thunks and requests, see [the `createAsyncThunk` API reference page](https://redux-toolkit.js.org/api/createAsyncThunk).

:::

In this case, we need access to the `thunkApi` argument, which is always the second argument. That means we need to provide _some_ variable name for the first argument, even though we don't pass anything in when we dispatch the thunk, and we don't need to use it inside the payload callback. So, we'll just give it a name of `_unused`.

From there, we know that the list of notifications is in our Redux store state, and that the latest notification should be first in the array. We can call `thunkApi.getState()` to read the state value, and use the `selectAllNotifications` selector to give us just the array of notifications. Since the array of notifications is sorted newest first, we can grab the latest one using array destructuring.

### Simplifying Thunk Types

We've now written two different thunks that needed to call `getState()`: `fetchNotifications`, which needs to access the latest notification entry, and `fetchPosts`, which is checking for an in-progress request. For both of them, we had to pass in the `{state: RootState}` TS generic type argument.

We _know_ that every use of `getState` in a thunk will need access to the `RootState` type. It would be nice if we didn't have to repeat that every time we wrote another async thunk that uses `getState`.

RTK provides a way to define a "pre-typed" version of `createAsyncThunk` that has the correct `dispatch` and `getState` types built in by calling `createAsyncThunk.withTypes()`, equivalent to how we defined pre-typed versions of `useSelector` and `useDispatch`. We'll create a new `src/app/withTypes` files, and export it from there:

```ts title="app/withTypes.ts"
import { createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState, AppDispatch } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()
```

Then we can use that to simplify the thunks we've already written for both notifications and posts:

```ts title="features/notifications/notificationsSlice.ts"
import { createSlice } from '@reduxjs/toolkit'

import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

// highlight-next-line
export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetchNotifications',
  async (_unused, thunkApi) => {
    const allNotifications = selectAllNotifications(thunkApi.getState())
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get<Notification[]>(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )
    return response.data
  }
)

// omit the rest of the file
```

```ts title="features/posts/postsSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

// omit other types

// highlight-next-line
export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  {
    condition(arg, thunkApi) {
      const { posts } = thunkApi.getState()
      if (posts.status !== 'idle') {
        return false
      }
    }
  }
)

// highlight-next-line
export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',
  async (initialPost: NewPost) => {
    const response = await client.post<Post>('/fakeApi/posts', initialPost)
    return response.data
  }
)
```

As a nice bonus, we were also able to remove the generic arguments for the return value and arguments, because TS can still infer those from the payload code we've written.

### Adding the Notifications List

Now that we've got the `notificationsSlice` created, we can add a `<NotificationsList>` component:

```tsx title="features/notifications/NotificationsList.tsx"
import React from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'

import { useAppSelector } from '@/app/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'

import { selectAllNotifications } from './notificationsSlice'

const UNKNOWN_USER = {
  name: 'Unknown User'
}

export const NotificationsList = () => {
  const notifications = useAppSelector(selectAllNotifications)
  const users = useAppSelector(selectAllUsers)

  const renderedNotifications = notifications.map(notification => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user =
      users.find(user => user.id === notification.user) ?? UNKNOWN_USER

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

```tsx title="app/Navbar.tsx"
import { Link } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { selectCurrentUsername, logout } from '@/features/auth/authSlice'
// highlight-next-line
import { fetchNotifications } from '@/features/notifications/notificationsSlice'
import { selectCurrentUser } from '@/features/users/usersSlice'

import { UserIcon } from './UserIcon'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const username = useAppSelector(selectCurrentUsername)
  const user = useAppSelector(selectCurrentUser)

  const isLoggedIn = !!username && !!user

  let navContent: React.ReactNode = null

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(logout())
    }

    // highlight-start
    const fetchNewNotifications = () => {
      dispatch(fetchNotifications())
    }
    // highlight-end

    navContent = (
      <div className="navContent">
        <div className="navLinks">
          <Link to="/posts">Posts</Link>
          <Link to="/users">Users</Link>
          // highlight-next-line
          <Link to="/notifications">Notifications</Link>
          <button className="button small" onClick={fetchNewNotifications}>
            Refresh Notifications
          </button>
        </div>
        {/* omitted */}
      </div>
    )
  }

  // omit other rendering
}
```

Lastly, we need to update `App.js` with the "Notifications" route so we can navigate to it:

```tsx title="App.tsx"
// omit imports
// highlight-next-line
import { NotificationsList } from './features/notifications/NotificationsList'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/posts" element={<PostsMainPage />} />
                  <Route path="/posts/:postId" element={<SinglePostPage />} />
                  <Route path="/editPost/:postId" element={<EditPostForm />} />
                  <Route path="/users" element={<UsersList />} />
                  <Route path="/users/:userId" element={<UserPage />} />
                  // highlight-start
                  <Route
                    path="/notifications"
                    element={<NotificationsList />}
                  />
                  // highlight-end
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}
```

Here's what the "Notifications" tab looks like so far:

![Initial Notifications tab](/img/tutorials/essentials/notifications-initial.png)

### Showing New Notifications

Each time we click "Refresh Notifications", a few more notification entries will be added to our list. In a real app, those could be coming from the server while we're looking at other parts of the UI. We can do something similar by clicking "Refresh Notifications" while we're looking at the `<PostsList>` or `<UserPage>`. But, right now we have no idea how many notifications just arrived, and if we keep clicking the button, there could be many notifications we haven't read yet. Let's add some logic to keep track of which notifications have been read and which of them are "new". That will let us show the count of "Unread" notifications as a badge on our "Notifications" tab in the navbar, and display new notifications in a different color.

#### Tracking Notification Status

The `Notification` objects that our fake API is sending back look like `{id, date, message, user}`. The idea of "new" or "unread" will only exist on the client. Given that, let's rework the `notificationsSlice` to support that.

First, we'll rename the existing `Notification` type to `ServerNotification`, create a new `ClientNotification` type that extends it to those two fields. Then, when we receive a new batch of notifications from the server, we'll always add those fields with default values.

Finally, we'll add a reducer that marks all notifications as read, and some logic to handle marking existing notifications as "not new":

```ts title="features/notifications/notificationsSlice.ts"
// omit imports

// highlight-start
export interface ServerNotification {
  id: string
  date: string
  message: string
  user: string
}

export interface ClientNotification extends ServerNotification {
  read: boolean
  isNew: boolean
}
// highlight-end

export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetchNotifications',
  async (_unused, thunkApi) => {
    const allNotifications = selectAllNotifications(thunkApi.getState())
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    // highlight-next-line
    const response = await client.get<ServerNotification[]>(
      `/fakeApi/notifications?since=${latestTimestamp}`
    )

    return response.data
  }
)

// highlight-next-line
const initialState: ClientNotification[] = []

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // highlight-start
    allNotificationsRead(state) {
      state.forEach(notification => {
        notification.read = true
      })
    }
    // highlight-end
  },
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      // highlight-start
      // Add client-side metadata for tracking new notifications
      const notificationsWithMetadata: ClientNotification[] =
        action.payload.map(notification => ({
          ...notification,
          read: false,
          isNew: true
        }))

      state.forEach(notification => {
        // Any notifications we've read are no longer new
        notification.isNew = !notification.read
      })
      // highlight-end

      state.push(...notificationsWithMetadata)
      // Sort with newest first
      state.sort((a, b) => b.date.localeCompare(a.date))
    })
  }
})

// highlight-next-line
export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer
```

#### Marking Notifications as Read

We want to mark these notifications as read whenever our `<NotificationsList>` component renders, either because we clicked on the tab to view the notifications, or because we already have it open and we just received some additional notifications. We can do this by dispatching `allNotificationsRead` any time this component re-renders. In order to avoid flashing of old data as this updates, we'll dispatch the action in a `useLayoutEffect` hook. We also want to add an additional classname to any notification list entries in the page, to highlight them:

```tsx title="features/notifications/NotificationsList.tsx"
// highlight-next-line
import React, { useLayoutEffect } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
// highlight-next-line
import classnames from 'classnames'

// highlight-next-line
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'

// highlight-start
import {
  allNotificationsRead,
  selectAllNotifications
} from './notificationsSlice'
// highlight-end

const UNKNOWN_USER = {
  name: 'Unknown User'
}

export const NotificationsList = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectAllNotifications)
  const users = useAppSelector(selectAllUsers)

  // highlight-start
  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
  })
  // highlight-end

  const renderedNotifications = notifications.map(notification => {
    const date = parseISO(notification.date)
    const timeAgo = formatDistanceToNow(date)
    const user =
      users.find(user => user.id === notification.user) ?? UNKNOWN_USER

    // highlight-start
    const notificationClassname = classnames('notification', {
      new: notification.isNew
    })
    // highlight-end

    return (
      // highlight-next-line
      <div key={notification.id} className={notificationClassname}>
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

Let's say we have fetched some notifications while looking at the `<PostsList>`, and then click the "Notifications" tab. The `<NotificationsList>` component will mount, and the `useLayoutEffect` callback will run after that first render and dispatch `allNotificationsRead`. Our `notificationsSlice` will handle that by updating the notification entries in the store. This creates a new `state.notifications` array containing the immutably-updated entries, which forces our component to render again because it sees a new array returned from the `useSelector`, and the `useLayoutEffect` hook runs again and dispatches `allNotificationsRead` a second time. The reducer runs again, but this time no data changes, so the component doesn't re-render.

There's a couple ways we could potentially avoid that second dispatch, like splitting the logic to dispatch once when the component mounts, and only dispatch again if the size of the notifications array changes. But, this isn't actually hurting anything, so we can leave it alone.

This does actually show that **it's possible to dispatch an action and not have _any_ state changes happen at all**. Remember, **it's always up to your reducers to decide _if_ any state actually needs to be updated, and "nothing needs to happen" is a valid decision for a reducer to make**.

Here's how the notifications tab looks now that we've got the "new/read" behavior working:

![New notifications](/img/tutorials/essentials/notifications-new.png)

#### Showing Unread Notifications

The last thing we need to do before we move on is to add the badge on our "Notifications" tab in the navbar. This will show us the count of "Unread" notifications when we are in other tabs:

```tsx title="app/Navbar.tsx"
// omit other imports

// highlight-next-line
import {
  fetchNotifications,
  selectAllNotifications
} from '@/features/notifications/notificationsSlice'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const username = useAppSelector(selectCurrentUsername)
  const user = useAppSelector(selectCurrentUser)

  // highlight-start
  const notifications = useAppSelector(selectAllNotifications)
  const numUnreadNotifications = notifications.filter(n => !n.read).length
  // highlight-end

  const isLoggedIn = !!username && !!user

  let navContent: React.ReactNode = null

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(logout())
    }

    const fetchNewNotifications = () => {
      dispatch(fetchNotifications())
    }

    // highlight-start
    let unreadNotificationsBadge: React.ReactNode | undefined

    if (numUnreadNotifications > 0) {
      unreadNotificationsBadge = (
        <span className="badge">{numUnreadNotifications}</span>
      )
    }
    // highlight-end

    navContent = (
      <div className="navContent">
        <div className="navLinks">
          <Link to="/posts">Posts</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">
            Notifications {unreadNotificationsBadge}
          </Link>
          <button className="button small" onClick={fetchNewNotifications}>
            Refresh Notifications
          </button>
        </div>
        // omit button
      </div>
    )
  }

  // omit other rendering
}
```

## Improving Render Performance

Our application is looking useful, but we've actually got a couple flaws in when and how our components re-render. Let's look at those problems, and talk about some ways to improve the performance.

### Investigating Render Behavior

We can use the React DevTools Profiler to view some graphs of what components re-render when state is updated. Try clicking over to the `<UserPage>` for a single user. Open up your browser's DevTools, and in the React "Profiler" tab, click the circle "Record" button in the upper-left. Then, click the "Refresh Notifications" button in our app, and stop the recording in the React DevTools Profiler. You should see a chart that looks like this:

![React DevTools Profiler render capture - <UserPage>](/img/tutorials/essentials/userpage-rerender.png)

We can see that the `<Navbar>` re-rendered, which makes sense because it had to show the updated "unread notifications" badge in the tab. But, why did our `<UserPage>` re-render?

If we inspect the last couple dispatched actions in the Redux DevTools, we can see that only the notifications state updated. Since the `<UserPage>` doesn't read any notifications, it shouldn't have re-rendered. Something must be wrong with the component.

If we look at `<UserPage>` carefully, there's a specific problem:

```tsx title="features/users/UserPage.tsx"
export const UserPage = () => {
  const { userId } = useParams()

  const user = useAppSelector(state => selectUserById(state, userId!))

  // highlight-start
  const postsForUser = useAppSelector(state => {
    const allPosts = selectAllPosts(state)
    // ❌ WRONG - this _always_ creates a new array reference!
    return allPosts.filter(post => post.user === userId)
  })
  // highlight-end

  // omit rendering logic
}
```

We know that `useSelector` will re-run every time an action is dispatched, and that it forces the component to re-render if we return a new reference value.

We're calling `filter()` inside of our `useSelector` hook, so that we only return the list of posts that belong to this user. Unfortunately, **this means that `useSelector` _always_ returns a new array reference, and so our component will re-render after _every_ action even if the posts data hasn't changed!**.

Now, realistically this isn't a meaningful perf issue in this particular example app. The `<UserPage>` component is small, and there's not many actions being dispatched in the app. However, this _can_ be a very major perf issue in real-world apps, with the impact varying based on app structure. Given that, extra components re-rendering when they didn't need to is a common mistake and something we should try to fix.

### Memoizing Selector Functions

What we really need is a way to only calculate the new filtered array if either `state.posts` or `userId` have changed. If they _haven't_ changed, we want to return the same filtered array reference as the last time.

This idea is called **"memoization"**. We want to save a previous set of inputs and the calculated result, and if the inputs are the same, return the previous result instead of recalculating it again.

So far, we've been writing selector functions by ourselves, and just so that we don't have to copy and paste the code for reading data from the store. It would be great if there was a way to make our selector functions memoized.

**[Reselect](https://github.com/reduxjs/reselect) is a library for creating memoized selector functions**, and was specifically designed to be used with Redux. It has a `createSelector` function that generates memoized selectors that will only recalculate results when the inputs change. Redux Toolkit [exports the `createSelector` function](https://redux-toolkit.js.org/api/createSelector), so we already have it available.

Let's make a new `selectPostsByUser` selector function, using Reselect, and use it here.

```ts title="features/posts/postsSlice.ts"
// highlight-next-line
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'

// omit slice logic

export const selectAllPosts = (state: RootState) => state.posts.posts

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.posts.find(post => post.id === postId)

// highlight-start
export const selectPostsByUser = createSelector(
  // Pass in one or more "input selectors"
  [
    // we can pass in an existing selector function that
    // reads something from the root `state` and returns it
    selectAllPosts,
    // and another function that extracts another argument
    // and returns that
    (state: RootState, userId: string) => userId
  ],
  // the output function gets those values as its arguments,
  // and will run when either input value changes
  (posts, userId) => posts.filter(post => post.user === userId)
)

// highlight-end
```

`createSelector` takes one or more "input selector" functions as argument, plus an "output function". When we call `selectPostsByUser(state, userId)`, `createSelector` will pass all of the arguments into each of our input selectors. Whatever those input selectors return becomes the arguments for the output selector. (We've already done something similar in `selectCurrentUser`, where we first call `const currentUsername = selectCurrentUsername(state)`.)

In this case, we know that we need the array of all posts and the user ID as the two arguments for our output selector. We can reuse our existing `selectAllPosts` selector to extract the posts array. Since the user ID is the second argument we're passing into `selectPostsByUser`, we can write a small selector that just returns `userId`.

Our output function then gets `posts` and `userId` as its arguments, and returns the filtered array of posts for just that user.

If we try calling `selectPostsByUser` multiple times, it will only re-run the output selector if either `posts` or `userId` has changed:

```ts Selector Calculation Examples
const state1 = getState()
// Output selector runs, because it's the first call
selectPostsByUser(state1, 'user1')
// Output selector does _not_ run, because the arguments haven't changed
selectPostsByUser(state1, 'user1')
// Output selector runs, because `userId` changed
selectPostsByUser(state1, 'user2')

dispatch(reactionAdded())
const state2 = getState()
// Output selector does not run, because `posts` and `userId` are the same
selectPostsByUser(state2, 'user2')

// Add some more posts
dispatch(addNewPost())
const state3 = getState()
// Output selector runs, because `posts` has changed
selectPostsByUser(state3, 'user2')
```

If we call this selector in `<UserPage>` and re-run the React profiler while fetching notifications, we should see that `<UserPage>` doesn't re-render this time:

```tsx title="features/users/UserPage.tsx"
export const UserPage = () => {
  const { userId } = useParams()

  const user = useAppSelector(state => selectUserById(state, userId!))

  // highlight-start
  const postsForUser = useAppSelector(state =>
    selectPostsByUser(state, userId!)
  )
  // highlight-end

  // omit rendering logic
}
```

Memoized selectors are a valuable tool for improving performance in a React+Redux application, because they can help us avoid unnecessary re-renders, and also avoid doing potentially complex or expensive calculations if the input data hasn't changed.

Note that **not all selectors in an application need to be memoized!** The rest of the selectors we've written are still just plain functions, and those work fine. **Selectors only need to be memoized if they create and return new object or array references, or if the calculation logic is "expensive"**.

:::info

For more details on why we use selector functions and how to write memoized selectors with Reselect, see:

- [Using Redux: Deriving Data with Selectors](../../usage/deriving-data-selectors.md)

:::

### Investigating the Posts List

If we go back to our `<PostsList>` and try clicking a reaction button on one of the posts while capturing a React profiler trace, we'll see that not only did the `<PostsList>` and the updated `<PostExcerpt>` instance render, _all_ of the `<PostExcerpt>` components rendered:

![React DevTools Profiler render capture - <PostsList>](/img/tutorials/essentials/postslist-rerender.png)

Why is that? None of the other posts changed, so why would they need to re-render?

[**React's default behavior is that when a parent component renders, React will recursively render all child components inside of it!**](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/). The immutable update of one post object also created a new `posts` array. Our `<PostsList>` had to re-render because the `posts` array was a new reference, so after it rendered, React continued downwards and re-rendered all of the `<PostExcerpt>` components too.

This isn't a serious problem for our small example app, but in a larger real-world app, we might have some very long lists or very large component trees, and having all those extra components re-render might slow things down.

There's a few different ways we could optimize this behavior in `<PostsList>`.

First, we could wrap the `<PostExcerpt>` component in [`React.memo()`](https://react.dev/reference/react/memo), which will ensure that the component inside of it only re-renders if the props have actually changed. This will actually work quite well - try it out and see what happens:

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
let PostExcerpt = ({ post }) => {
  // omit logic
}

// highlight-next-line
PostExcerpt = React.memo(PostExcerpt)
```

Another option is to rewrite `<PostsList>` so that it only selects a list of post IDs from the store instead of the entire `posts` array, and rewrite `<PostExcerpt>` so that it receives a `postId` prop and calls `useSelector` to read the post object it needs. If `<PostsList>` gets the same list of IDs as before, it won't need to re-render, and so only our one changed `<PostExcerpt>` component should have to render.

Unfortunately, this gets tricky because we also need to have all our posts sorted by date and rendered in the right order. We could update our `postsSlice` to keep the array sorted at all times, so we don't have to sort it in the component, and use a memoized selector to extract just the list of post IDs. We could also [customize the comparison function that `useSelector` runs to check the results](https://react-redux.js.org/api/hooks#equality-comparisons-and-updates), like `useSelector(selectPostIds, shallowEqual)`, so that will skip re-rendering if the _contents_ of the IDs array haven't changed.

The last option is to find some way to have our reducer keep a separate array of IDs for all the posts, and only modify that array when posts are added or removed, and do the same rewrite of `<PostsList>` and `<PostExcerpt>`. This way, `<PostsList>` only needs to re-render when that IDs array changes.

Conveniently, Redux Toolkit has a `createEntityAdapter` function that will help us do just that.

## Normalizing Data

You've seen that a lot of our logic has been looking up items by their ID field. Since we've been storing our data in arrays, that means we have to loop over all the items in the array using `array.find()` until we find the item with the ID we're looking for.

Realistically, this doesn't take very long, but if we had arrays with hundreds or thousands of items inside, looking through the entire array to find one item becomes wasted effort. What we need is a way to look up a single item based on its ID, directly, without having to check all the other items. This process is known as "normalization".

### Normalized State Structure

"Normalized state" means that:

- We only have one copy of each particular piece of data in our state, so there's no duplication
- Data that has been normalized is kept in a lookup table, where the item IDs are the keys, and the items themselves are the values.
- There may also be an array of all of the IDs for a particular item type

JavaScript objects can be used as lookup tables, similar to "maps" or "dictionaries" in other languages. Here's what the normalized state for a group of `user` objects might look like:

```js
{
  users: {
    ids: ["user1", "user2", "user3"],
    entities: {
      "user1": {id: "user1", firstName, lastName},
      "user2": {id: "user2", firstName, lastName},
      "user3": {id: "user3", firstName, lastName},
    }
  }
}
```

This makes it easy to find a particular `user` object by its ID, without having to loop through all the other user objects in an array:

```js
const userId = 'user2'
const userObject = state.users.entities[userId]
```

:::info

For more details on why normalizing state is useful, see [Normalizing State Shape](../../usage/structuring-reducers/NormalizingStateShape.md) and the Redux Toolkit Usage Guide section on [Managing Normalized Data](https://redux-toolkit.js.org/usage/usage-guide#managing-normalized-data).

:::

### Managing Normalized State with `createEntityAdapter`

Redux Toolkit's [**`createEntityAdapter`**](https://redux-toolkit.js.org/api/createEntityAdapter) API provides a standardized way to store your data in a slice by taking a collection of items and putting them into the shape of `{ ids: [], entities: {} }`. Along with this predefined state shape, it generates a set of reducer functions and selectors that know how to work with that data.

This has several benefits:

- We don't have to write the code to manage the normalization ourselves
- `createEntityAdapter`'s pre-built reducer functions handle common cases like "add all these items", "update one item", or "remove multiple items"
- `createEntityAdapter` can keep the ID array in a sorted order based on the contents of the items, and will only update that array if items are added / removed or the sorting order changes.

`createEntityAdapter` accepts an options object that may include a `sortComparer` function, which will be used to keep the item IDs array in sorted order by comparing two items (and works the same way as `Array.sort()`).

It returns an object that contains [a set of generated reducer functions for adding, updating, and removing items from an entity state object](https://redux-toolkit.js.org/api/createEntityAdapter#crud-functions). These reducer functions can either be used as a case reducer for a specific action type, or as a "mutating" utility function within another reducer in `createSlice`.

The adapter object also has a `getSelectors` function. You can pass in a selector that returns this particular slice of state from the Redux root state, and it will generate selectors like `selectAll` and `selectById`.

Finally, the adapter object has a `getInitialState` function that generates an empty `{ids: [], entities: {}}` object. You can pass in more fields to `getInitialState`, and those will be merged in.

### Updating the Posts Slice

With that in mind, let's update our `postsSlice` to use `createEntityAdapter`:

```ts title="features/posts/postsSlice.ts"
import {
  // highlight-next-line
  createEntityAdapter
  // omit other imports
} from '@reduxjs/toolkit'

// highlight-start
const postsAdapter = createEntityAdapter<Post>({
  // Sort in descending date order
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
  error: null
})

// highlight-end

// omit thunks

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      // highlight-next-line
      const existingPost = state.entities[id]
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
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
  },
  extraReducers(builder) {
    builder
      // omit other cases
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // highlight-start
        // Save the fetched posts into state
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
    // highlight-end
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start
// Export the customized selectors for this adapter using `getSelectors`
export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds
  // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => state.posts)
// highlight-end

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state, userId) => userId],
  (posts, userId) => posts.filter(post => post.user === userId)
)
```

There's a lot going on there! Let's break it down.

First, we import `createEntityAdapter`, and call it to create our `postsAdapter` object. We know that we want to keep an array of all post IDs sorted with the newest post first, so we pass in a `sortComparer` function that will sort newer items to the front based on the `post.date` field.

`getInitialState()` returns an empty `{ids: [], entities: {}}` normalized state object. Our `postsSlice` needs to keep the `status` and `error` fields for loading state too, so we pass those in to `getInitialState()`.

Now that our posts are being kept as a lookup table in `state.entities`, we can change our `reactionAdded` and `postUpdated` reducers to directly look up the right posts by their IDs, instead of having to loop over the old `posts` array.

When we receive the `fetchPosts.fulfilled` action, we can use the `postsAdapter.setAll` function to add all of the incoming posts to the state, by passing in the draft `state` and the array of posts in `action.payload`.

When we receive the `addNewPost.fulfilled` action, we know we need to add that one new post object to our state. We can use the adapter functions as reducers directly, so we'll pass `postsAdapter.addOne` as the reducer function to handle that action.

Finally, we can replace the old hand-written `selectAllPosts` and `selectPostById` selector functions with the ones generated by `postsAdapter.getSelectors`. Since the selectors are called with the root Redux state object, they need to know where to find our posts data in the Redux state, so we pass in a small selector that returns `state.posts`. The generated selector functions are always called `selectAll` and `selectById`, so we can use destructuring syntax to rename them as we export them and match the old selector names. We'll also export `selectPostIds` the same way, since we want to read the list of sorted post IDs in our `<PostsList>` component.

### Optimizing the Posts List

Now that our posts slice is using `createEntityAdapter`, we can update `<PostsList>` to optimize its rendering behavior.

We'll update `<PostsList>` to read just the sorted array of post IDs, and pass `postId` to each `<PostExcerpt>`:

```tsx title="features/posts/PostsList.tsx"
// omit other imports

// highlight-start
import {
  selectAllPosts,
  fetchPosts,
  selectPostIds,
  selectPostById
} from './postsSlice'

let PostExcerpt = ({ postId }: { postId: string }) => {
  const post = useSelector(state => selectPostById(state, postId))
  // highlight-end
  // omit rendering logic
}

export const PostsList = () => {
  const dispatch = useDispatch()
  // highlight-next-line
  const orderedPostIds = useSelector(selectPostIds)

  // omit other selections and effects

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..." />
  } else if (postStatus === 'succeeded') {
    // highlight-start
    content = orderedPostIds.map(postId => (
      <PostExcerpt key={postId} postId={postId} />
    ))
    // highlight-end
  } else if (postStatus === 'error') {
    content = <div>{error}</div>
  }

  // omit other rendering
}
```

Now, if we try clicking a reaction button on one of the posts while capturing a React component performance profile, we should see that _only_ that one component re-rendered:

![React DevTools Profiler render capture - optimized <PostsList>](/img/tutorials/essentials/postslist-optimized.png)

### Converting the Users Slice

We can convert other slices to use `createEntityAdapter` as well.

The `usersSlice` is fairly small, so we've only got a few things to change:

```ts title="features/users/usersSlice.ts"
import {
  createSlice,
  createAsyncThunk,
  // highlight-next-line
  createEntityAdapter
} from '@reduxjs/toolkit'

import { client } from '@/api/client'

// highlight-start
const usersAdapter = createEntityAdapter<User>()

const initialState = usersAdapter.getInitialState()
// highlight-end

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.users
})

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    // highlight-next-line
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
  }
})

export default usersSlice.reducer

// highlight-start
export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state: RootState) => state.users)
// highlight-end
```

The only action we're handling here always replaces the entire list of users with the array we fetched from the server. We can use `usersAdapter.setAll` to implement that instead.

We were already exporting the `selectAllUsers` and `selectUserById` selectors we'd written by hand. We can replace those with the versions generated by `usersAdapter.getSelectors()`.

### Converting the Notifications Slice

Last but not least, we'll update `notificationsSlice` as well:

```ts title="features/notifications/notificationsSlice.ts"
// highlight-next-line
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { client } from '@/api/client'

// omit types and fetchNotifications thunk

// highlight-start
const notificationsAdapter = createEntityAdapter<ClientNotification>({
  // Sort with newest first
  sortComparer: (a, b) => b.date.localeCompare(a.date)
})

const initialState = notificationsAdapter.getInitialState()
// highlight-end

const notificationsSlice = createSlice({
  name: 'notifications',
  // highlight-next-line
  initialState,
  reducers: {
    allNotificationsRead(state) {
      // highlight-start
      Object.values(state.entities).forEach(notification => {
        notification.read = true
      })
      // highlight-end
    }
  },
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      // Add client-side metadata for tracking new notifications
      const notificationsWithMetadata: ClientNotification[] =
        action.payload.map(notification => ({
          ...notification,
          read: false,
          isNew: true
        }))

      // highlight-start
      Object.values(state.entities).forEach(notification => {
        // Any notifications we've read are no longer new
        notification.isNew = !notification.read
      })

      notificationsAdapter.upsertMany(state, notificationsWithMetadata)
      // highlight-end
    })
  }
})

export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer

// highlight-start
export const { selectAll: selectAllNotifications } =
  notificationsAdapter.getSelectors((state: RootState) => state.notifications)
// highlight-end
```

We again import `createEntityAdapter`, call it, and call `notificationsAdapter.getInitialState()` to help set up the slice.

Ironically, we do have a couple places in here where we need to loop over all notification objects and update them. Since those are no longer being kept in an array, we have to use `Object.values(state.entities)` to get an array of those notifications and loop over that. On the other hand, we can replace the previous fetch update logic with `notificationsAdapter.upsertMany`.

## Writing Reactive Logic

Thus far, all of our application behavior has been relatively imperative. The user does something (adding a post, fetching notifications), and we dispatch actions in either a click handler or a component `useEffect` hook in response. That includes the data fetching thunks like `fetchPosts` and `login`.

However, sometimes we need to write more logic that runs in response to things that happened in the app, such as certain actions being dispatched.

We've shown some loading indicators for things like fetching posts. It would be nice to have some kind of a visual confirmation for the user when they add a new post, like popping up a toast message.

We've already seen that we can have [many reducers respond to the same dispatched action](./part-4-using-data.md#handling-actions-in-multiple-slices). That works great for logic that is just "update more parts of the state", but what if we need to write logic that is async or has other side effects? We can't put that in the reducers - [reducers must be "pure" and must _not_ have any side effects](./part-2-app-structure.md#rules-of-reducers).

If we can't put this logic with side effects in reducers, where _can_ we put it?

The answer is inside of [Redux middleware, because middleware is designed to enable side effects](./part-5-async-logic.md#using-middleware-to-enable-async-logic).

### Reactive Logic with `createListenerMiddleware`

We've already used the thunk middleware for async logic that has to run "right now". However, thunks are just functions. We need a different kind of middleware that lets us say "when a specific action is dispatched, go run this additional logic in response".

**Redux Toolkit includes the [`createListenerMiddleware`](https://redux-toolkit.js.org/api/createListenerMiddleware) API to let us write logic that runs in response to specific actions being dispatched**. It lets us add "listener" entries that define what actions to look for, and an `effect` callback that will run whenever it matches against an action.

Conceptually, you can think of `createListenerMiddleware` as being similar to [React's `useEffect` hook](https://react.dev/learn/synchronizing-with-effects), except that they are defined as part of your Redux logic instead of inside a React component, and they run in response to dispatched actions and Redux state updates instead of as part of React's rendering lifecycle.

### Setting Up the Listener Middleware

We didn't have to specifically set up or define the thunk middleware, because Redux Toolkit's `configureStore` automatically adds the thunk middleware to the store setup. For the listener middleware, we'll have to do a bit of setup work to create it and add it to the store.

We'll create a new `app/listenerMiddleware.ts` file and create an instance of the listener middleware there. Similar to `createAsyncThunk`, we'll pass through the correct `dispatch` and `state` types so that we can safely access state fields and dispatch actions.

```ts title="app/listenerMiddleware.ts"
import { createListenerMiddleware, addListener } from '@reduxjs/toolkit'
import type { RootState, AppDispatch } from './store'

export const listenerMiddleware = createListenerMiddleware()

export const startAppListening = listenerMiddleware.startListening.withTypes<
  RootState,
  AppDispatch
>()
export type AppStartListening = typeof startAppListening

export const addAppListener = addListener.withTypes<RootState, AppDispatch>()
export type AppAddListener = typeof addAppListener
```

Like `createSlice`, `createListenerMiddleware` returns an object that contains multiple fields:

- `listenerMiddleware.middleware`: the actual Redux middleware instance that needs to be added to the store
- `listenerMiddleware.startListening`: adds a new listener entry to the middleware directly
- `listenerMiddleware.addListener`: an action creator that can be dispatched to add a listener entry from anywhere in the codebase that has access to `dispatch`, even if you didn't import the `listenerMiddleware` object

As with async thunks and hooks, we can use the `.withTypes()` methods to define pre-typed `startAppListening` and `addAppListener` functions with the right types built in.

Then, we need to add it to the store:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

import authReducer from '@/features/auth/authSlice'
import postsReducer from '@/features/posts/postsSlice'
import usersReducer from '@/features/users/usersSlice'
import notificationsReducer from '@/features/notifications/notificationsSlice'

// highlight-next-line
import { listenerMiddleware } from './listenerMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    notifications: notificationsReducer
  },
  // highlight-start
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware)
  // highlight-end
})
```

`configureStore` already adds the `redux-thunk` middleware to the store setup by default, along with some additional middleware in development that add safety checks. We want to preserve those, but also add the listener middleware as well.

Order can matter when setting up middleware, because they form a pipeline: `m1` -> `m2` -> `m3` -> `store.dispatch()`. In this case, the listener middleware needs to be at the _start_ of the pipeline, so that it can intercept some actions first and process them.

`getDefaultMiddleware()` returns an array of the configured middleware. Since it's an array, it already has a `.concat()` method that returns a copy with the new items at the _end_ of the array, but `configureStore` also adds an equivalent `.prepend()` method that makes a copy with the new items at the _start_ of the array.

So, we'll call `getDefaultMiddleware().prepend(listenerMiddleware.middleware)` to add this to the front of the list.

### Showing Toasts for New Posts

Now that we have the listener middleware configured, we can add a new listener entry that will show a toast message any time a new post successfully gets added.

We're going to use the `react-tiny-toast` library to manage showing toasts with the right appearance. It's already included in the project repo, so we don't have to install it.

We do need to import and render its `<ToastContainer>` component in our `<App>`:

```tsx title="App.tsx"
import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom'
// highlight-next-line
import { ToastContainer } from 'react-tiny-toast'

// omit other imports and ProtectedRoute definition

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>{/* omit routes content */}</Routes>
        // highlight-next-line
        <ToastContainer />
      </div>
    </Router>
  )
}
```

Now we can go add a listener that will watch for the `addNewPost.fulfilled` action, show a toast that says "Post Added", and remove it after a delay.

There's [multiple approaches we can use for defining listeners in our codebase](https://redux-toolkit.js.org/api/createListenerMiddleware#organizing-listeners-in-files). That said, it's usually a good practice to define listeners in whatever slice file seems most related to the logic we want to add. In this case, we want to show a toast when a post gets added, so let's add this listener in the `postsSlice` file:

```ts title="features/posts/postsSlice.ts"
import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { AppStartListening } from '@/app/listenerMiddleware'
import { createAppAsyncThunk } from '@/app/withTypes'

// omit types, initial state, slice definition, and selectors

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state: RootState, userId: string) => userId],
  (posts, userId) => posts.filter(post => post.user === userId)
)

// highlight-start
export const addPostsListeners = (startListening: AppStartListening) => {
  startAppListening({
    actionCreator: addNewPost.fulfilled,
    effect: async (action, listenerApi) => {
      const { toast } = await import('react-tiny-toast')

      const toastId = toast.show('New post added!', {
        variant: 'success',
        position: 'bottom-right',
        pause: true
      })

      await listenerApi.delay(5000)
      toast.remove(toastId)
    }
  })
}
// highlight-end
```

To add a listener, we need to call the `startAppListening` function that was defined in `app/listenerMiddleware.ts`. However, it's better if we _don't_ import `startAppListening` directly into the slice file, to help keep the import chains more consistent. Instead, we can export a function that accepts `startAppListening` as an argument. That way, the `app/listenerMiddleware.ts` file can import this function, similar to the way `app/store.ts` imports the slice reducers from each slice file.

To add a listener entry, call `startAppListening` and pass in an object with an `effect` callback function, and one of these options to define when the effect callback will run:

- `actionCreator: ActionCreator`: any RTK action creator function, like `reactionAdded` or `addNewPost.fulfilled`. This will run the effect when that one specific action is dispatched.
- `matcher: (action: UnknownAction) => boolean`: Any RTK ["matcher" function](https://redux-toolkit.js.org/api/matching-utilities), like `isAnyOf(reactionAdded, addNewPost.fulfilled)`. This will run the effect any time the matcher returns `true`.
- `predicate: (action: UnknownAction, currState: RootState, prevState: RootState) => boolean`: a more general matching function that has access to `currState` and `prevState`. This can be used to make any check you want against the action or state values, including seeing if a piece of state has changed (such as `currState.counter.value !== prevState.counter.value`)

In this case, we specifically want to show our toast any time the `addNewPost` thunk succeeds, so we'll specify the effect should run with `actionCreator: addNewPost.fulfilled`.

The `effect` callback itself is much like an async thunk. It gets the matched `action` as the first argument, and a `listenerApi` object as the second argument.

The `listenerApi` includes the usual `dispatch` and `getState` methods, but also [several other functions that can be used to implement complex async logic and workflows](https://redux-toolkit.js.org/api/createListenerMiddleware#listener-api). That includes methods like `condition()` to pause until some other action is dispatched or state value changes, `unsubscribe()/subscribe()` to change whether this listener entry is active, `fork()` to kick off a child task, and more.

In this case, we want to import the actual `react-tiny-toast` library dynamically, show the success toast, wait a few seconds, and then remove the toast.

And that works! Now when we add a new post, we should see a small green toast pop up in the lower right-hand corner of the page, and disappear after 5 seconds. This works because the listener middleware in the Redux store checks and runs the effect callback, even though we didn't specifically add any more logic to the React components themselves.

## What You've Learned

We've built a lot of new behavior in this section. Let's see what how the app looks with all those changes:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/checkpoint-4-entitySlices/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-essentials-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

Here's what we covered in this section:

:::tip Summary

- **Memoized selector functions can be used to optimize performance**
  - Redux Toolkit re-exports the `createSelector` function from Reselect, which generates memoized selectors
  - Memoized selectors will only recalculate the results if the input selectors return new values
  - Memoization can skip expensive calculations, and ensure the same result references are returned
- **There are multiple patterns you can use to optimize React component rendering with Redux**
  - Avoid creating new object/array references inside of `useSelector` - those will cause unnecessary re-renders
  - Memoized selector functions can be passed to `useSelector` to optimize rendering
  - `useSelector` can accept an alternate comparison function like `shallowEqual` instead of reference equality
  - Components can be wrapped in `React.memo()` to only re-render if their props change
  - List rendering can be optimized by having list parent components read just an array of item IDs, passing the IDs to list item children, and retrieving items by ID in the children
- **Normalized state structure is a recommended approach for storing items**
  - "Normalization" means no duplication of data, and keeping items stored in a lookup table by item ID
  - Normalized state shape usually looks like `{ids: [], entities: {}}`
- **Redux Toolkit's `createEntityAdapter` API helps manage normalized data in a slice**
  - Item IDs can be kept in sorted order by passing in a `sortComparer` option
  - The adapter object includes:
    - `adapter.getInitialState`, which can accept additional state fields like loading state
    - Prebuilt reducers for common cases, like `setAll`, `addMany`, `upsertOne`, and `removeMany`
    - `adapter.getSelectors`, which generates selectors like `selectAll` and `selectById`
- **Redux Toolkit's `createListenerMiddleware` API is used to run reactive logic in response to dispatched actions**
  - The listener middleware should be added to the store setup, with the right store types attached
  - Listeners are typically defined in slice files, but may be structured other ways as well
  - Listeners can match against individual actions, many actions, or use custom comparisons
  - Listener effect callbacks can contain any sync or async logic
  - The `listenerApi` object provides many methods for managing async workflows and behavior

:::

## What's Next?

**Redux Toolkit also includes a powerful data fetching and caching API called "RTK Query"**. RTK Query is an optional addon that can completely eliminate the need to write any data fetching logic yourself. In [Part 7: RTK Query Basics](./part-7-rtk-query-basics.md), you'll learn what RTK Query is, what problems it solves, and how to use it to fetch and use cached data in your application.
