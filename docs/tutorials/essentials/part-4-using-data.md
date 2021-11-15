---
id: part-4-using-data
title: 'Redux Essentials, Part 4: Using Redux Data'
sidebar_label: 'Using Redux Data'
description: 'The official Redux Essentials tutorial: learn how to work with complex Redux state in React components'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip What You'll Learn

- Using Redux data in multiple React components
- Organizing logic that dispatches actions
- Writing more complex update logic in reducers

:::

:::info Prerequisites

- Understanding the [Redux data flow and React-Redux APIs from Part 3](./part-3-data-flow.md)
- Familiarity with [the React Router `<Link>` and `<Route>` components for page routing](https://reacttraining.com/react-router/web/api)

:::

## Introduction

In [Part 3: Basic Redux Data Flow](./part-3-data-flow.md), we saw how to start from an empty Redux+React project setup, add a new slice of state, and create React components that can read data from the Redux store and dispatch actions to update that data. We also looked at how data flows through the application, with components dispatching actions, reducers processing actions and returning new state, and components reading the new state and rerendering the UI.

Now that you know the core steps to write Redux logic, we're going to use those same steps to add some new features to our social media feed that will make it more useful: viewing a single post, editing existing posts, showing post author details, post timestamps, and reaction buttons.

:::info

As a reminder, the code examples focus on the key concepts and changes for each section. See the CodeSandbox projects and the [`tutorial-steps` branch in the project repo](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps) for the complete changes in the application.

:::

## Showing Single Posts

Since we have the ability to add new posts to the Redux store, we can add some more features that use the post data in different ways.

Currently, our post entries are being shown in the main feed page, but if the text is too long, we only show an excerpt of the content. It would be helpful to have the ability to view a single post entry on its own page.

### Creating a Single Post Page

First, we need to add a new `SinglePostPage` component to our `posts` feature folder. We'll use React Router to show this component when the page URL looks like `/posts/123`, where the `123` part should be the ID of the post we want to show.

```jsx title="features/posts/SinglePostPage.js"
import React from 'react'
import { useSelector } from 'react-redux'

export const SinglePostPage = ({ match }) => {
  const { postId } = match.params

  const post = useSelector(state =>
    state.posts.find(post => post.id === postId)
  )

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
      </article>
    </section>
  )
}
```

React Router will pass in a `match` object as a prop that contains the URL information we're looking for. When we set up the route to render this component, we're going to tell it to parse the second part of the URL as a variable named `postId`, and we can read that value from `match.params`.

Once we have that `postId` value, we can use it inside a selector function to find the right post object from the Redux store. We know that `state.posts` should be an array of all post objects, so we can use the `Array.find()` function to loop through the array and return the post entry with the ID we're looking for.

It's important to note that **the component will re-render any time the value returned from `useSelector` changes to a new reference**. Components should always try to select the smallest possible amount of data they need from the store, which will help ensure that it only renders when it actually needs to.

It's possible that we might not have a matching post entry in the store - maybe the user tried to type in the URL directly, or we don't have the right data loaded. If that happens, the `find()` function will return `undefined` instead of an actual post object. Our component needs to check for that and handle it by showing a "Post not found!" message in the page.

Assuming we do have the right post object in the store, `useSelector` will return that, and we can use it to render the title and content of the post in the page.

You might notice that this looks fairly similar to the logic we have in the body of our `<PostsList>` component, where we loop over the whole `posts` array to show post excerpts on the main feed. We _could_ try to extract a `Post` component that could be used in both places, but there are already some differences in how we're showing a post excerpt and the whole post. It's usually better to keep writing things separately for a while even if there's some duplication, and then we can decide later if the different sections of code are similar enough that we can really extract a reusable component.

### Adding the Single Post Route

Now that we have a `<SinglePostPage>` component, we can define a route to show it, and add links to each post in the front page feed.

We'll import `SinglePostPage` in `App.js`, and add the route:

```jsx title="App.js"
import { PostsList } from './features/posts/PostsList'
import { AddPostForm } from './features/posts/AddPostForm'
// highlight-next-line
import { SinglePostPage } from './features/posts/SinglePostPage'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <React.Fragment>
                <AddPostForm />
                <PostsList />
              </React.Fragment>
            )}
          />
          // highlight-next-line
          <Route exact path="/posts/:postId" component={SinglePostPage} />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  )
}
```

Then, in `<PostsList>`, we'll update the list rendering logic to include a `<Link>` that routes to that specific post:

```jsx title="features/posts/PostsList.js"
import React from 'react'
import { useSelector } from 'react-redux'
// highlight-next-line
import { Link } from 'react-router-dom'

export const PostsList = () => {
  const posts = useSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      // highlight-start
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
      // highlight-end
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

And since we can now click through to a different page, it would also be helpful to have a link back to the main posts page in the `<Navbar>` component as well:

```jsx title="app/Navbar.js"
import React from 'react'

// highlight-next-line
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>

        <div className="navContent">
          // highlight-start
          <div className="navLinks">
            <Link to="/">Posts</Link>
          </div>
          // highlight-end
        </div>
      </section>
    </nav>
  )
}
```

## Editing Posts

As a user, it's really annoying to finish writing a post, save it, and realize you made a mistake somewhere. Having the ability to edit a post after we created it would be useful.

Let's add a new `<EditPostForm>` component that has the ability to take an existing post ID, read that post from the store, lets the user edit the title and post content, and then save the changes to update the post in the store.

### Updating Post Entries

First, we need to update our `postsSlice` to create a new reducer function and an action so that the store knows how to actually update posts.

Inside of the `createSlice()` call, we should add a new function into the `reducers` object. Remember that the name of this reducer should be a good description of what's happening, because we're going to see the reducer name show up as part of the action type string in the Redux DevTools whenever this action is dispatched. Our first reducer was called `postAdded`, so let's call this one `postUpdated`.

In order to update a post object, we need to know:

- The ID of the post being updated, so that we can find the right post object in the state
- The new `title` and `content` fields that the user typed in

Redux action objects are required to have a `type` field, which is normally a descriptive string, and may also contain other fields with more information about what happened. By convention, we normally put the additional info in a field called `action.payload`, but it's up to us to decide what the `payload` field contains - it could be a string, a number, an object, an array, or something else. In this case, since we have three pieces of information we need, let's plan on having the `payload` field be an object with the three fields inside of it. That means the action object will look like `{type: 'posts/postUpdated', payload: {id, title, content}}`.

By default, the action creators generated by `createSlice` expect you to pass in one argument, and that value will be put into the action object as `action.payload`. So, we can pass an object containing those fields as the argument to the `postUpdated` action creator.

We also know that the reducer is responsible for determining how the state should actually be updated when an action is dispatched. Given that, we should have the reducer find the right post object based on the ID, and specifically update the `title` and `content` fields in that post.

Finally, we'll need to export the action creator function that `createSlice` generated for us, so that the UI can dispatch the new `postUpdated` action when the user saves the post.

Given all those requirements, here's how our `postsSlice` definition should look after we're done:

```js title="features/posts/postsSlice.js"
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action) {
      state.push(action.payload)
    },
    // highlight-start
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
    // highlight-end
  }
})

// highlight-next-line
export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer
```

### Creating an Edit Post Form

Our new `<EditPostForm>` component will look similar to the `<AddPostForm>`, but the logic needs to be a bit different. We need to retrieve the right `post` object from the store, then use that to initialize the state fields in the component so the user can make changes. We'll save the changed title and content values back to the store after the user is done. We'll also use React Router's history API to switch over to the single post page and show that post.

```jsx title="features/posts/EditPostForm.js"
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { postUpdated } from './postsSlice'

export const EditPostForm = ({ match }) => {
  const { postId } = match.params

  const post = useSelector(state => state.posts.find(post => post.id == postId))

  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content)

  const dispatch = useDispatch()
  const history = useHistory()

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)

  const onSavePostClicked = () => {
    if (title && content) {
      dispatch(postUpdated({ id: postId, title, content }))
      history.push(`/posts/${postId}`)
    }
  }

  return (
    <section>
      <h2>Edit Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          placeholder="What's on your mind?"
          value={title}
          onChange={onTitleChanged}
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
      </form>
      <button type="button" onClick={onSavePostClicked}>
        Save Post
      </button>
    </section>
  )
}
```

Like with `SinglePostPage`, we'll need to import it into `App.js` and add a route that will render this component with the `postId` as a route parameter.

```jsx title="App.js"
import { PostsList } from './features/posts/PostsList'
import { AddPostForm } from './features/posts/AddPostForm'
import { SinglePostPage } from './features/posts/SinglePostPage'
// highlight-next-line
import { EditPostForm } from './features/posts/EditPostForm'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <React.Fragment>
                <AddPostForm />
                <PostsList />
              </React.Fragment>
            )}
          />
          <Route exact path="/posts/:postId" component={SinglePostPage} />
          // highlight-next-line
          <Route exact path="/editPost/:postId" component={EditPostForm} />
          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  )
}
```

We should also add a new link to our `SinglePostPage` that will route to `EditPostForm`, like:

```jsx title="features/post/SinglePostPage.js"
// highlight-next-line
import { Link } from 'react-router-dom'

export const SinglePostPage = ({ match }) => {

        // omit other contents

        <p  className="post-content">{post.content}</p>
        // highlight-start
        <Link to={`/editPost/${post.id}`} className="button">
          Edit Post
        </Link>
        // highlight-end
```

### Preparing Action Payloads

We just saw that the action creators from `createSlice` normally expect one argument, which becomes `action.payload`. This simplifies the most common usage pattern, but sometimes we need to do more work to prepare the contents of an action object. In the case of our `postAdded` action, we need to generate a unique ID for the new post, and we also need to make sure that the payload is an object that looks like `{id, title, content}`.

Right now, we're generating the ID and creating the payload object in our React component, and passing the payload object into `postAdded`. But, what if we needed to dispatch the same action from different components, or the logic for preparing the payload is complicated? We'd have to duplicate that logic every time we wanted to dispatch the action, and we're forcing the component to know exactly what the payload for this action should look like.

:::caution

If an action needs to contain a unique ID or some other random value, always generate that first and put it in the action object. **Reducers should never calculate random values**, because that makes the results unpredictable.

:::

If we were writing the `postAdded` action creator by hand, we could have put the setup logic inside of it ourselves:

```js
// hand-written action creator
function postAdded(title, content) {
  const id = nanoid()
  return {
    type: 'posts/postAdded',
    payload: { id, title, content }
  }
}
```

But, Redux Toolkit's `createSlice` is generating these action creators for us. That makes the code shorter because we don't have to write them ourselves, but we still need a way to customize the contents of `action.payload`.

Fortunately, `createSlice` lets us define a "prepare callback" function when we write a reducer. The "prepare callback" function can take multiple arguments, generate random values like unique IDs, and run whatever other synchronous logic is needed to decide what values go into the action object. It should then return an object with the `payload` field inside. (The return object may also contain a `meta` field, which can be used to add extra descriptive values to the action, and an `error` field, which should be a boolean indicating whether this action represents some kind of an error.)

Inside of the `reducers` field in `createSlice`, we can define one of the fields as an object that looks like `{reducer, prepare}`:

```js title="features/posts/postsSlice.js"
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(title, content) {
        return {
          payload: {
            id: nanoid(),
            title,
            content
          }
        }
      }
    }
    // highlight-end
    // other reducers here
  }
})
```

Now our component doesn't have to worry about what the payload object looks like - the action creator will take care of putting it together the right way. So, we can update the component so that it passes in `title` and `content` as arguments when it dispatches `postAdded`:

```jsx title="features/posts/AddPostForm.js"
const onSavePostClicked = () => {
  if (title && content) {
    // highlight-next-line
    dispatch(postAdded(title, content))
    setTitle('')
    setContent('')
  }
}
```

## Users and Posts

So far, we only have one slice of state. The logic is defined in `postsSlice.js`, the data is stored in `state.posts`, and all of our components have been related to the posts feature. Real applications will probably have many different slices of state, and several different "feature folders" for the Redux logic and React components.

You can't have a "social media" app if there aren't any other people involved. Let's add the ability to keep track of a list of users in our app, and update the post-related functionality to make use of that data.

### Adding a Users Slice

Since the concept of "users" is different than the concept of "posts", we want to keep the code and data for the users separated from the code and data for posts. We'll add a new `features/users` folder, and put a `usersSlice` file in there. Like with the posts slice, for now we'll add some initial entries so that we have data to work with.

```js title="features/users/usersSlice.js"
import { createSlice } from '@reduxjs/toolkit'

const initialState = [
  { id: '0', name: 'Tianna Jenkins' },
  { id: '1', name: 'Kevin Grant' },
  { id: '2', name: 'Madison Price' }
]

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {}
})

export default usersSlice.reducer
```

For now, we don't need to actually update the data, so we'll leave the `reducers` field as an empty object. (We'll come back to this in a later section.)

As before, we'll import the `usersReducer` into our store file and add it to the store setup:

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '../features/posts/postsSlice'
// highlight-next-line
import usersReducer from '../features/users/usersSlice'

export default configureStore({
  reducer: {
    posts: postsReducer,
    // highlight-next-line
    users: usersReducer
  }
})
```

### Adding Authors for Posts

Every post in our app was written by one of our users, and every time we add a new post, we should keep track of which user wrote that post. In a real app, we'd have some sort of a `state.currentUser` field that keeps track of the current logged-in user, and use that information whenever they add a post.

To keep things simpler for this example, we'll update our `<AddPostForm>` component so that we can select a user from a dropdown list, and we'll include that user's ID as part of the post. Once our post objects have a user ID in them, we can use that to look up the user's name and show it in each individual post in the UI.

First, we need to update our `postAdded` action creator to accept a user ID as an argument, and include that in the action. (We'll also update the existing post entries in `initialState` to have a `post.user` field with one of the example user IDs.)

```js title="features/posts/postsSlice.js"
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      // highlight-next-line
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            // highlight-next-line
            user: userId
          }
        }
      }
    }
    // other reducers
  }
})
```

Now, in our `<AddPostForm>`, we can read the list of users from the store with `useSelector` and show them as a dropdown. We'll then take the ID of the selected user and pass that to the `postAdded` action creator. While we're at it, we can add a bit of validation logic to our form so that the user can only click the "Save Post" button if the title and content inputs have some actual text in them:

```jsx title="features/posts/AddPostForm.js"
import React, { useState } from 'react'
// highlight-next-line
import { useDispatch, useSelector } from 'react-redux'

import { postAdded } from './postsSlice'

export const AddPostForm = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  // highlight-next-line
  const [userId, setUserId] = useState('')

  const dispatch = useDispatch()

  // highlight-next-line
  const users = useSelector(state => state.users)

  const onTitleChanged = e => setTitle(e.target.value)
  const onContentChanged = e => setContent(e.target.value)
  // highlight-next-line
  const onAuthorChanged = e => setUserId(e.target.value)

  const onSavePostClicked = () => {
    if (title && content) {
      // highlight-next-line
      dispatch(postAdded(title, content, userId))
      setTitle('')
      setContent('')
    }
  }

  // highlight-start
  const canSave = Boolean(title) && Boolean(content) && Boolean(userId)

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))
  // highlight-end

  return (
    <section>
      <h2>Add a New Post</h2>
      <form>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          placeholder="What's on your mind?"
          value={title}
          onChange={onTitleChanged}
        />
        // highlight-start
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          {usersOptions}
        </select>
        // highlight-end
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        // highlight-next-line
        <button type="button" onClick={onSavePostClicked} disabled={!canSave}>
          Save Post
        </button>
      </form>
    </section>
  )
}
```

Now, we need a way to show the name of the post's author inside of our post list items and `<SinglePostPage>`. Since we want to show this same kind of info in more than one place, we can make a `PostAuthor` component that takes a user ID as a prop, looks up the right user object, and formats the user's name:

```jsx title="features/posts/PostAuthor.js"
import React from 'react'
import { useSelector } from 'react-redux'

export const PostAuthor = ({ userId }) => {
  const author = useSelector(state =>
    state.users.find(user => user.id === userId)
  )

  return <span>by {author ? author.name : 'Unknown author'}</span>
}
```

Notice that we're following the same pattern in each of our components as we go. Any component that needs to read data from the Redux store can use the `useSelector` hook, and extract the specific pieces of data that it needs. Also, many components can access the same data in the Redux store at the same time.

We can now import the `PostAuthor` component into both `PostsList.js` and `SinglePostPage.js`, and render it as `<PostAuthor userId={post.user} />`, and every time we add a post entry, the selected user's name should show up inside of the rendered post.

## More Post Features

At this point, we can create and edit posts. Let's add some additional logic to make our posts feed more useful.

### Storing Dates for Posts

Social media feeds are typically sorted by when the post was created, and show us the post creation time as a relative description like "5 hours ago". In order to do that, we need to start tracking a `date` field for our post entries.

Like with the `post.user` field, we'll update our `postAdded` prepare callback to make sure that `post.date` is always included when the action is dispatched. However, it's not another parameter that will be passed in. We want to always use the exact timestamp from when the action is dispatched, so we'll let the prepare callback handle that itself.

:::caution

**Redux actions and state should only contain plain JS values like objects, arrays, and primitives. Don't put class instances, functions, or other non-serializable values into Redux!**.

:::

Since we can't just put a `Date` class instance into the Redux store, we'll track the `post.date` value as a timestamp string:

```js title="features/posts/postsSlice.js"
    postAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(title, content, userId) {
        return {
          payload: {
            id: nanoid(),
            // highlight-next-line
            date: new Date().toISOString(),
            title,
            content,
            user: userId,
          },
        }
      },
    },
```

Like with post authors, we need to show the relative timestamp description in both our `<PostsList>` and `<SinglePostPage>` components. We'll add a `<TimeAgo>` component to handle formatting a timestamp string as a relative description. Libraries like `date-fns` have some useful utility functions for parsing and formatting dates, which we can use here:

```jsx title="features/posts/TimeAgo.js"
import React from 'react'
import { parseISO, formatDistanceToNow } from 'date-fns'

export const TimeAgo = ({ timestamp }) => {
  let timeAgo = ''
  if (timestamp) {
    const date = parseISO(timestamp)
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} ago`
  }

  return (
    <span title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </span>
  )
}
```

### Sorting the Posts List

Our `<PostsList>` is currently showing all the posts in the same order the posts are kept in the Redux store. Our example has the oldest post first, and any time we add a new post, it gets added to the end of the posts array. That means the newest post is always at the bottom of the page.

Typically, social media feeds show the newest posts first, and you scroll down to see older posts. Even though the data is being kept oldest-first in the store, we can reorder the data in our `<PostsList>` component so that the newest post is first. In theory, since we know that the `state.posts` array is already sorted, we _could_ just reverse the list. But, it's better to go ahead and sort it ourselves just to be sure.

Since `array.sort()` mutates the existing array, we need to make a copy of `state.posts` and sort that copy. We know that our `post.date` fields are being kept as date timestamp strings, and we can directly compare those to sort the posts in the right order:

```jsx title="features/posts/PostsList.js"
// Sort posts in reverse chronological order by datetime string
//highlight-start
const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

const renderedPosts = orderedPosts.map(post => {
  //highlight-end
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <Link to={`/posts/${post.id}`} className="button muted-button">
        View Post
      </Link>
    </article>
  )
})
```

We also need to add the `date` field to `initialState` in `postsSlice.js`. We'll use `date-fns` here again to subtract minutes from the current date/time so they differ from each other.

```jsx title="features/posts/postsSlice.js"
import { createSlice, nanoid } from '@reduxjs/toolkit'
// highlight-next-line
import { sub } from 'date-fns'

const initialState = [
  {
    // omitted fields
    content: 'Hello!',
    // highlight-next-line
    date: sub(new Date(), { minutes: 10 }).toISOString()
  },
  {
    // omitted fields
    content: 'More text',
    // highlight-next-line
    date: sub(new Date(), { minutes: 5 }).toISOString()
  }
]
```

### Post Reaction Buttons

We have one more new feature to add for this section. Right now, our posts are kind of boring. We need to make them more exciting, and what better way to do that than letting our friends add reaction emoji to our posts?

We'll add a row of emoji reaction buttons at the bottom of each post in `<PostsList>` and `<SinglePostPage>`. Every time a user clicks one of the reaction buttons, we'll need to update a matching counter field for that post in the Redux store. Since the reaction counter data is in the Redux store, switching between different parts of the app should consistently show the same values in any component that uses that data.

Like with post authors and timestamps, we want to use this everywhere we show posts, so we'll create a `<ReactionButtons>` component that takes a `post` as a prop. We'll start by just showing the buttons inside, with the current reaction counts for each button:

```jsx title="features/posts/ReactionButtons.js"
import React from 'react'

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button key={name} type="button" className="muted-button reaction-button">
        {emoji} {post.reactions[name]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}
```

We don't yet have a `post.reactions` field in our data, so we'll need to update the `initialState` post objects and our `postAdded` prepare callback function to make sure that every post has that data inside, like `reactions: {thumbsUp: 0, hooray: 0}`.

Now, we can define a new reducer that will handle updating the reaction count for a post when a user clicks the reaction button.

Like with editing posts, we need to know the ID of the post, and which reaction button the user clicked on. We'll have our `action.payload` be an object that looks like `{id, reaction}`. The reducer can then find the right post object, and update the correct reactions field.

```js
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
    // highlight-end
    // other reducers
  }
})

// highlight-next-line
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions
```

As we've seen already, `createSlice` lets us write "mutating" logic in our reducers. If we weren't using `createSlice` and the Immer library, the line `existingPost.reactions[reaction]++` would indeed mutate the existing `post.reactions` object, and this would probably cause bugs elsewhere in our app because we didn't follow the rules of reducers. But, since we _are_ using `createSlice`, we can write this more complex update logic in a simpler way, and let Immer do the work of turning this code into a safe immutable update.

Notice that **our action object just contains the minimum amount of information needed to describe what happened**. We know which post we need to update, and which reaction name was clicked on. We _could_ have calculated the new reaction counter value and put that in the action, but **it's always better to keep the action objects as small as possible, and do the state update calculations in the reducer**. This also means that **reducers can contain as much logic as necessary to calculate the new state**.

:::info

When using Immer, you can either "mutate" an existing state object, or return a new state value yourself, but not both at the same time. See the Immer docs guides on [Pitfalls](https://immerjs.github.io/immer/pitfalls) and [Returning New Data](https://immerjs.github.io/immer/return) for more details.

:::

Our last step is to update the `<ReactionButtons>` component to dispatch the `reactionAdded` action when the user clicks a button:

```jsx title="features/posts/ReactionButtons.jsx"
import React from 'react'
// highlight-start
import { useDispatch } from 'react-redux'

import { reactionAdded } from './postsSlice'
// highlight-end

const reactionEmoji = {
  thumbsUp: '👍',
  hooray: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
  // highlight-next-line
  const dispatch = useDispatch()

  const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
    return (
      <button
        key={name}
        type="button"
        className="muted-button reaction-button"
        // highlight-start
        onClick={() =>
          dispatch(reactionAdded({ postId: post.id, reaction: name }))
        }
        // highlight-end
      >
        {emoji} {post.reactions[name]}
      </button>
    )
  })

  return <div>{reactionButtons}</div>
}
```

Now, every time we click a reaction button, the counter should increment. If we browse around to different parts of the app, we should see the correct counter values displayed any time we look at this post, even if we click a reaction button in the `<PostsList>` and then look at the post by itself on the `<SinglePostPage>`.

## What You've Learned

Here's what our app looks like after all these changes:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/checkpoint-2-reactionButtons/?fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-essentials-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

It's actually starting to look more useful and interesting!

We've covered a lot of information and concepts in this section. Let's recap the important things to remember:

:::tip Summary

- **Any React component can use data from the Redux store as needed**
  - Any component can read any data that is in the Redux store
  - Multiple components can read the same data, even at the same time
  - Components should extract the smallest amount of data they need to render themselves
  - Components can combine values from props, state, and the Redux store to determine what UI they need to render. They can read multiple pieces of data from the store, and reshape the data as needed for display.
  - Any component can dispatch actions to cause state updates
- **Redux action creators can prepare action objects with the right contents**
  - `createSlice` and `createAction` can accept a "prepare callback" that returns the action payload
  - Unique IDs and other random values should be put in the action, not calculated in the reducer
- **Reducers should contain the actual state update logic**
  - Reducers can contain whatever logic is needed to calculate the next state
  - Action objects should contain just enough info to describe what happened

:::

## What's Next?

By now you should be comfortable working with data in the Redux store and React components. So far we've just used data that was in the initial state or added by the user. In [Part 5: Async Logic and Data Fetching](./part-5-async-logic.md), we'll see how to work with data that comes from a server API.
