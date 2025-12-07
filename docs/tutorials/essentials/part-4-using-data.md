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
- Using selectors to look up state values
- Writing more complex update logic in reducers
- How to think about Redux actions

:::

:::info Prerequisites

- Understanding the [Redux data flow and React-Redux APIs from Part 3](./part-3-data-flow.md)
- Familiarity with [the React Router `<Link>` and `<Route>` components for page routing](https://reactrouter.com/start/library/routing)

:::

## Introduction

In [Part 3: Basic Redux Data Flow](./part-3-data-flow.md), we saw how to start from an empty Redux+React project setup, add a new slice of state, and create React components that can read data from the Redux store and dispatch actions to update that data. We also looked at how data flows through the application, with components dispatching actions, reducers processing actions and returning new state, and components reading the new state and rerendering the UI. We also saw how to create "pre-typed" versions of the `useSelector` and `useDispatch` hooks that have the correct store types applied automatically.

Now that you know the core steps to write Redux logic, we're going to use those same steps to add some new features to our social media feed that will make it more useful: viewing a single post, editing existing posts, showing post author details, post timestamps, reaction buttons, and auth.

:::info

As a reminder, the code examples focus on the key concepts and changes for each section. See the CodeSandbox projects and the [`tutorial-steps-ts` branch in the project repo](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts) for the complete changes in the application.

:::

## Showing Single Posts

Since we have the ability to add new posts to the Redux store, we can add some more features that use the post data in different ways.

Currently, our post entries are being shown in the main feed page, but if the text is too long, we only show an excerpt of the content. It would be helpful to have the ability to view a single post entry on its own page.

### Creating a Single Post Page

First, we need to add a new `SinglePostPage` component to our `posts` feature folder. We'll use React Router to show this component when the page URL looks like `/posts/123`, where the `123` part should be the ID of the post we want to show.

```tsx title="features/posts/SinglePostPage.tsx"
import { useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector(state =>
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

When we set up the route to render this component, we're going to tell it to parse the second part of the URL as a variable named `postId`, and we can read that value from the `useParams` hook.

Once we have that `postId` value, we can use it inside a selector function to find the right post object from the Redux store. We know that `state.posts` should be an array of all post objects, so we can use the `Array.find()` function to loop through the array and return the post entry with the ID we're looking for.

It's important to note that **the component will re-render any time the value returned from `useAppSelector` changes to a new reference**. Components should always try to select the smallest possible amount of data they need from the store, which will help ensure that it only renders when it actually needs to.

It's possible that we might not have a matching post entry in the store - maybe the user tried to type in the URL directly, or we don't have the right data loaded. If that happens, the `find()` function will return `undefined` instead of an actual post object. Our component needs to check for that and handle it by showing a "Post not found!" message in the page.

Assuming we do have the right post object in the store, `useAppSelector` will return that, and we can use it to render the title and content of the post in the page.

You might notice that this looks fairly similar to the logic we have in the body of our `<PostsList>` component, where we loop over the whole `posts` array to show post excerpts on the main feed. We _could_ try to extract a `Post` component that could be used in both places, but there are already some differences in how we're showing a post excerpt and the whole post. It's usually better to keep writing things separately for a while even if there's some duplication, and then we can decide later if the different sections of code are similar enough that we can really extract a reusable component.

### Adding the Single Post Route

Now that we have a `<SinglePostPage>` component, we can define a route to show it, and add links to each post in the front page feed.

While we're at it, it's also worth extracting the "main page" content into a separate `<PostsMainPage>` component as well, just for readability.

We'll import `PostsMainPage` and `SinglePostPage` in `App.tsx`, and add the route:

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
// highlight-start
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
// highlight-end

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          // highlight-start
          <Route path="/" element={<PostsMainPage />}></Route>
          <Route path="/posts/:postId" element={<SinglePostPage />} />
          // highlight-end
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

Then, in `<PostsList>`, we'll update the list rendering logic to include a `<Link>` that routes to that specific post:

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export const PostsList = () => {
  const posts = useAppSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>
        // highlight-next-line
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
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

And since we can now click through to a different page, it would also be helpful to have a link back to the main posts page in the `<Navbar>` component as well:

```tsx title="app/Navbar.tsx"
// highlight-next-line
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>

        <div className="navContent">
          <div className="navLinks">
            // highlight-next-line
            <Link to="/">Posts</Link>
          </div>
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

:::tip

Redux itself doesn't care what name you use for these reducer functions - it'll run the same if it's named `postAdded`, `addPost`, `POST_ADDED`, or `someRandomName`.

That said, **we encourage naming reducers as past-tense "this happened" names like `postAdded`, because we're describing "an event that occurred in the application"**.

:::

In order to update a post object, we need to know:

- The ID of the post being updated, so that we can find the right post object in the state
- The new `title` and `content` fields that the user typed in

Redux action objects are required to have a `type` field, which is normally a descriptive string, and may also contain other fields with more information about what happened. By convention, we normally put the additional info in a field called `action.payload`, but it's up to us to decide what the `payload` field contains - it could be a string, a number, an object, an array, or something else. In this case, since we have three pieces of information we need, let's plan on having the `payload` field be an object with the three fields inside of it. That means the action object will look like `{type: 'posts/postUpdated', payload: {id, title, content}}`.

By default, the action creators generated by `createSlice` expect you to pass in one argument, and that value will be put into the action object as `action.payload`. So, we can pass an object containing those fields as the argument to the `postUpdated` action creator. As with `postAdded`, this is an entire `Post` object, so we declare that the reducer argument is `action: PayloadAction<Post>`.

We also know that the reducer is responsible for determining how the state should actually be updated when an action is dispatched. Given that, we should have the reducer find the right post object based on the ID, and specifically update the `title` and `content` fields in that post.

Finally, we'll need to export the action creator function that `createSlice` generated for us, so that the UI can dispatch the new `postUpdated` action when the user saves the post.

Given all those requirements, here's how our `postsSlice` definition should look after we're done:

```ts title="features/posts/postsSlice.ts"
// highlight-next-line
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// omit state types

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action: PayloadAction<Post>) {
      state.push(action.payload)
    },
    // highlight-start
    postUpdated(state, action: PayloadAction<Post>) {
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

Our new `<EditPostForm>` component will look similar to both the the `<AddPostForm>` and `<SinglePostPage>`, but the logic needs to be a bit different. We need to retrieve the right `post` object from the store based on the `postId` in the URL, then use that to initialize the input fields in the component so the user can make changes. We'll save the changed title and content values back to the store when the user submits the form. We'll also use React Router's `useNavigate` hook to switch over to the single post page and show that post after they save the changes.

```tsx title="features/posts/EditPostForm.tsx"
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { postUpdated } from './postsSlice'

// omit form element types

export const EditPostForm = () => {
  const { postId } = useParams()

  const post = useAppSelector(state =>
    state.posts.find(post => post.id === postId)
  )

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  const onSavePostClicked = (e: React.FormEvent<EditPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    if (title && content) {
      dispatch(postUpdated({ id: post.id, title, content }))
      navigate(`/posts/${postId}`)
    }
  }

  return (
    <section>
      <h2>Edit Post</h2>
      <form onSubmit={onSavePostClicked}>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          defaultValue={post.title}
          required
        />
        <label htmlFor="postContent">Content:</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue={post.content}
          required
        />

        <button>Save Post</button>
      </form>
    </section>
  )
}
```

Note that the Redux-specific code here is relatively minimal. Once again, we read a value from the Redux store via `useAppSelector`, and then dispatch an action via `useAppDispatch` when the user interacts with the UI.

Like with `SinglePostPage`, we'll need to import it into `App.tsx` and add a route that will render this component with the `postId` as a route parameter.

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
// highlight-next-line
import { EditPostForm } from './features/posts/EditPostForm'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<PostsMainPage />}></Route>
          <Route path="/posts/:postId" element={<SinglePostPage />} />
          // highlight-next-line
          <Route path="/editPost/:postId" element={<EditPostForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

We should also add a new link to our `SinglePostPage` that will route to `EditPostForm`, like:

```tsx title="features/post/SinglePostPage.tsx"
// highlight-next-line
import { Link, useParams } from 'react-router-dom'

export const SinglePostPage = () => {

        // omit other contents

        <p className="post-content">{post.content}</p>
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

```ts
// hand-written action creator
function postAdded(title: string, content: string) {
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

```ts title="features/posts/postsSlice.ts"
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      prepare(title: string, content: string) {
        return {
          payload: { id: nanoid(), title, content }
        }
      }
    }
    // highlight-end
    // other reducers here
  }
})
```

Now our component doesn't have to worry about what the payload object looks like - the action creator will take care of putting it together the right way. So, we can update the component so that it passes in `title` and `content` as arguments when it dispatches `postAdded`:

```ts title="features/posts/AddPostForm.tsx"
const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
  // Prevent server submission
  e.preventDefault()

  const { elements } = e.currentTarget
  const title = elements.postTitle.value
  const content = elements.postContent.value

  // highlight-start
  // Now we can pass these in as separate arguments,
  // and the ID will be generated automatically
  dispatch(postAdded(title, content))
  // highlight-end

  e.currentTarget.reset()
}
```

## Reading Data With Selectors

We now have a couple different components that are looking up a post by ID, and repeating the `state.posts.find()` call. This is duplicate code, and it's always worth _considering_ if we should de-duplicate things. It's also fragile - as we'll see in later sections, we are eventually going to start changing the posts slice state structure. When we do that, we'll have to find each place that we reference `state.posts` and update the logic accordingly. TypeScript will help catch broken code that no longer matches the expected state type by throwing errors at compile time, but it would be nice if we didn't have to keep rewriting our components every time we made a change to the data format in our reducers, and didn't have to repeat logic in the components.

One way to avoid this is to **define reusable selector functions in the slice files**, and have the components use those selectors to extract the data they need instead of repeating the selector logic in each component. That way, if we do change our state structure again, we only need to update the code in the slice file.

### Defining Selector Functions

You've already been writing selector functions every time we called `useAppSelector`, such as `useAppSelector( state => state.posts )`. In that case, the selector is being defined inline. Since it's just a function, we could also write it as:

```ts
const selectPosts = (state: RootState) => state.posts
const posts = useAppSelector(selectPosts)
```

Selectors are typically written as standalone individual functions in a slice file. They normally accept the entire Redux `RootState` as the first argument, and may also accept other arguments as well.

### Extracting Posts Selectors

The `<PostsList>` component needs to read a list of all the posts, and the `<SinglePostPage>` and `<EditPostForm>` components need to look up a single post by its ID. Let's export two small selector functions from `postsSlice.ts` to cover those cases:

```ts title="features/posts/postsSlice.ts"
import type { RootState } from '@/app/store'

const postsSlice = createSlice(/* omit slice code*/)

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start
export const selectAllPosts = (state: RootState) => state.posts

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.find(post => post.id === postId)
// highlight-end
```

Note that the `state` parameter for these selector functions is the root Redux state object, as it was for the inlined anonymous selectors we wrote directly inside of `useAppSelector`.

We can then use them in the components:

```tsx title="features/posts/PostsList.tsx"
// omit imports
// highlight-next-line
import { selectAllPosts } from './postsSlice'

export const PostsList = () => {
  // highlight-next-line
  const posts = useAppSelector(selectAllPosts)
  // omit component contents
}
```

```tsx title="features/posts/SinglePostPage.tsx"
// omit imports
// highlight-next-line
import { selectPostById } from './postsSlice'

export const SinglePostPage = () => {
  const { postId } = useParams()

  // highlight-next-line
  const post = useAppSelector(state => selectPostById(state, postId!))
  // omit component logic
}
```

```ts title="features/posts/EditPostForm.tsx"
// omit imports
// highlight-next-line
import { postUpdated, selectPostById } from './postsSlice'

export const EditPostForm = () => {
  const { postId } = useParams()

  // highlight-next-line
  const post = useAppSelector(state => selectPostById(state, postId!))
  // omit component logic
}
```

Note that the `postId` we get from `useParams()` is typed as `string | undefined`, but `selectPostById` expects a valid `string` as the argument. We can use the TS `!` operator to tell the TS compiler this value will not be `undefined` at this point in the code. (This can be dangerous, but we can make the assumption because we know the routing setup only shows `<EditPostForm>` if there's a post ID in the URL.)

We'll continue this pattern of writing selectors in slices as we go forward, rather than writing them inline inside of `useAppSelector` in components. Remember, this isn't required, but it's a good pattern to follow!

### Using Selectors Effectively

It's often a good idea to encapsulate data lookups by writing reusable selectors. Ideally, components don't even have to know where in the Redux `state` a value lives - they just use a selector from the slice to access the data.

You can also create "memoized" selectors that can help improve performance by optimizing rerenders and skipping unnecessary recalculations, which we'll look at in a later part of this tutorial.

But, like any abstraction, it's not something you should do _all_ the time, everywhere. Writing selectors means more code to understand and maintain. **Don't feel like you need to write selectors for every single field of your state**. Try starting without any selectors, and add some later when you find yourself looking up the same values in many parts of your application code.

### Optional: Defining Selectors Inside of `createSlice`

We've seen that we can write selectors as standalone functions in slice files. In some cases, you can shorten this a bit by defining selectors directly inside `createSlice` itself.

<DetailedExplanation title="Defining Selectors inside createSlice" >

We've already seen that `createSlice` requires the `name`, `initialState`, and `reducers` fields, and also accepts an optional `extraReducers` field.

If you want to define selectors directly inside of `createSlice`, you can pass in an additional `selectors` field. The `selectors` field should be an object similar to `reducers`, where the keys will be the selector function names, and the values are the selector functions to be generated.

**Note that unlike writing a standalone selector function, the `state` argument to these selectors will be just the _slice state_, and _not_ the entire `RootState`!**.

Here's what it might look like to convert the posts slice selectors to be defined inside of `createSlice`:

```ts
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /* omit reducer logic */
  },
  // highlight-start
  selectors: {
    // Note that these selectors are given just the `PostsState`
    // as an argument, not the entire `RootState`
    selectAllPosts: postsState => postsState,
    selectPostById: (postsState, postId: string) => {
      return postsState.find(post => post.id === postId)
    }
  }
  // highlight-end
})

// highlight-start
export const { selectAllPosts, selectPostById } = postsSlice.selectors
// highlight-end

export default postsSlice.reducer

// highlight-start
// We've replaced these standalone selectors:
// export const selectAllPosts = (state: RootState) => state.posts

// export const selectPostById = (state: RootState, postId: string) =>
//   state.posts.find(post => post.id === postId)

// highlight-end
```

There _are_ still times you'll need to write selectors as standalone functions outside of `createSlice`. This is especially true if you're calling other selectors that need the entire `RootState` as their argument, in order to make sure the types match up correctly.

</DetailedExplanation>

## Users and Posts

So far, we only have one slice of state. The logic is defined in `postsSlice.ts`, the data is stored in `state.posts`, and all of our components have been related to the posts feature. Real applications will probably have many different slices of state, and several different "feature folders" for the Redux logic and React components.

You can't have a "social media" app if there aren't any other people involved! Let's add the ability to keep track of a list of users in our app, and update the post-related functionality to make use of that data.

### Adding a Users Slice

Since the concept of "users" is different than the concept of "posts", we want to keep the code and data for the users separated from the code and data for posts. We'll add a new `features/users` folder, and put a `usersSlice` file in there. Like with the posts slice, for now we'll add some initial entries so that we have data to work with.

```ts title="features/users/usersSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

interface User {
  id: string
  name: string
}

const initialState: User[] = [
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

export const selectAllUsers = (state: RootState) => state.users

export const selectUserById = (state: RootState, userId: string | null) =>
  state.users.find(user => user.id === userId)
```

For now, we don't need to actually update the data, so we'll leave the `reducers` field as an empty object. (We'll come back to this in a later section.)

As before, we'll import the `usersReducer` into our store file and add it to the store setup:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '@/features/posts/postsSlice'
// highlight-next-line
import usersReducer from '@/features/users/usersSlice'

export default configureStore({
  reducer: {
    posts: postsReducer,
    // highlight-next-line
    users: usersReducer
  }
})
```

Now, the root state looks like `{posts, users}`, matching the object we passed in as the `reducer` argument.

### Adding Authors for Posts

Every post in our app was written by one of our users, and every time we add a new post, we should keep track of which user wrote that post. This will need changes for both the Redux state and the `<AddPostForm>` component.

First, we need to update the existing `Post` data type to include a `user: string` field that contains the user ID that created the post. We'll also update the existing post entries in `initialState` to have a `post.user` field with one of the example user IDs.

Then, we need to update our existing reducers accordingly. The `postAdded` prepare callback needs to accept a user ID as an argument, and include that in the action. Also, we _don't_ want to include the `user` field when we update a post - the only things we need are the `id` of the post that changed, and the new `title` and `content` fields for the updated text. We'll define a `PostUpdate` type that contains just those three fields from `Post`, and use that as the payload for `postUpdated` instead.

```ts title="features/posts/postsSlice.ts"
export interface Post {
  id: string
  title: string
  content: string
  user: string
}

// highlight-start
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!', user: '0' },
  { id: '2', title: 'Second Post', content: 'More text', user: '2' }
]
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      // highlight-next-line
      prepare(title: string, content: string, userId: string) {
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
    },
    // highlight-next-line
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
  }
})
```

Now, in our `<AddPostForm>`, we can read the list of users from the store with `useSelector` and show them as a dropdown. We'll then take the ID of the selected user and pass that to the `postAdded` action creator. While we're at it, we can add a bit of validation logic to our form so that the user can only click the "Save Post" button if the title and content inputs have some actual text in them:

```tsx title="features/posts/AddPostForm.tsx"
// highlight-next-line
import { selectAllUsers } from '@/features/users/usersSlice'

// omit other imports and form types

const AddPostForm = () => {
  const dispatch = useAppDispatch()
  // highlight-next-line
  const users = useAppSelector(selectAllUsers)

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value
    // highlight-next-line
    const userId = elements.postAuthor.value

    // highlight-next-line
    dispatch(postAdded(title, content, userId))

    e.currentTarget.reset()
  }

  // highlight-start
  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))
  // highlight-end

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />
        // highlight-start
        <label htmlFor="postAuthor">Author:</label>
        <select id="postAuthor" name="postAuthor" required>
          <option value=""></option>
          {usersOptions}
        </select>
        // highlight-end
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

Now, we need a way to show the name of the post's author inside of our post list items and `<SinglePostPage>`. Since we want to show this same kind of info in more than one place, we can make a `PostAuthor` component that takes a user ID as a prop, looks up the right user object, and formats the user's name:

```tsx title="features/posts/PostAuthor.tsx"
import { useAppSelector } from '@/app/hooks'

import { selectUserById } from '@/features/users/usersSlice'

interface PostAuthorProps {
  userId: string
}

export const PostAuthor = ({ userId }: PostAuthorProps) => {
  const author = useAppSelector(state => selectUserById(state, userId))

  return <span>by {author?.name ?? 'Unknown author'}</span>
}
```

Notice that we're following the same pattern in each of our components as we go. Any component that needs to read data from the Redux store can use the `useAppSelector` hook, and extract the specific pieces of data that it needs. Also, many components can access the same data in the Redux store at the same time.

We can now import the `PostAuthor` component into both `PostsList.tsx` and `SinglePostPage.tsx`, and render it as `<PostAuthor userId={post.user} />`. Every time we add a post entry, the selected user's name should show up inside of the rendered post.

## More Post Features

At this point, we can create and edit posts. Let's add some additional logic to make our posts feed more useful.

### Storing Dates for Posts

Social media feeds are typically sorted by when the post was created, and show us the post creation time as a relative description like "5 hours ago". In order to do that, we need to start tracking a `date` field for our post entries.

Like with the `post.user` field, we'll update our `postAdded` prepare callback to make sure that `post.date` is always included when the action is dispatched. However, it's not another parameter that will be passed in. We want to always use the exact timestamp from when the action is dispatched, so we'll let the prepare callback handle that itself.

:::caution

**Redux actions and state should only contain plain JS values like objects, arrays, and primitives. Don't put class instances, functions, `Date/Map/Set` instances, or other non-serializable values into Redux!**.

:::

Since we can't just put a `Date` class instance into the Redux store, we'll track the `post.date` value as a timestamp string. We'll add it to the initial state values (using `date-fns` to subtract a few minutes from the current date and time), and also add it to each new post in the prepare callback

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid } from '@reduxjs/toolkit'
// highlight-next-line
import { sub } from 'date-fns'

const initialState: Post[] = [
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

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      prepare(title: string, content: string, userId: string) {
        return {
          payload: {
            id: nanoid(),
            // highlight-next-line
            date: new Date().toISOString(),
            title,
            content,
            user: userId
          }
        }
      }
    }
    // omit `postUpdated
  }
})
```

Like with post authors, we need to show the relative timestamp description in both our `<PostsList>` and `<SinglePostPage>` components. We'll add a `<TimeAgo>` component to handle formatting a timestamp string as a relative description. Libraries like `date-fns` have some useful utility functions for parsing and formatting dates, which we can use here:

```tsx title="components/TimeAgo.tsx"
import { parseISO, formatDistanceToNow } from 'date-fns'

interface TimeAgoProps {
  timestamp: string
}

export const TimeAgo = ({ timestamp }: TimeAgoProps) => {
  let timeAgo = ''
  if (timestamp) {
    const date = parseISO(timestamp)
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} ago`
  }

  return (
    <time dateTime={timestamp} title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </time>
  )
}
```

### Sorting the Posts List

Our `<PostsList>` is currently showing all the posts in the same order the posts are kept in the Redux store. Our example has the oldest post first, and any time we add a new post, it gets added to the end of the posts array. That means the newest post is always at the bottom of the page.

Typically, social media feeds show the newest posts first, and you scroll down to see older posts. Even though the data is being kept oldest-first in the store, we can reorder the data in our `<PostsList>` component so that the newest post is first. In theory, since we know that the `state.posts` array is already sorted, we _could_ just reverse the list. But, it's better to go ahead and sort it ourselves just to be sure.

Since `array.sort()` mutates the existing array, we need to make a copy of `state.posts` and sort that copy. We know that our `post.date` fields are being kept as date timestamp strings, and we can directly compare those to sort the posts in the right order:

```tsx title="features/posts/PostsList.tsx"
// Sort posts in reverse chronological order by datetime string
// highlight-start
const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

const renderedPosts = orderedPosts.map(post => {
  // highlight-end
  return (
    // omit rendering logic
  )
})
```

### Post Reaction Buttons

Right now, our posts are kind of boring. We need to make them more exciting, and what better way to do that than letting our friends add reaction emoji to our posts? 🎉

We'll add a row of emoji reaction buttons at the bottom of each post in `<PostsList>` and `<SinglePostPage>`. Every time a user clicks one of the reaction buttons, we'll need to update a matching counter field for that post in the Redux store. Since the reaction counter data is in the Redux store, switching between different parts of the app should consistently show the same values in any component that uses that data.

#### Tracking Reactions Data in Posts

We don't yet have a `post.reactions` field in our data, so we'll need to update the `initialState` post objects and our `postAdded` prepare callback function to make sure that every post has that data inside, like `reactions: {thumbsUp: 0, tada: 0, heart: 0, rocket: 0, eyes: 0}`.

Then, we can define a new reducer that will handle updating the reaction count for a post when a user clicks the reaction button.

Like with editing posts, we need to know the ID of the post, and which reaction button the user clicked on. We'll have our `action.payload` be an object that looks like `{id, reaction}`. The reducer can then find the right post object, and update the correct reactions field.

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

// highlight-start
export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions
// highlight-end

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  // highlight-next-line
  reactions: Reactions
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

// highlight-start
const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0
}
// highlight-end

const initialState: Post[] = [
  // omit initial state
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // omit other reducers
    // highlight-start
    reactionAdded(
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>
    ) {
      const { postId, reaction } = action.payload
      const existingPost = state.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
    // highlight-end
  }
})

// highlight-next-line
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions
```

As we've seen already, **`createSlice` lets us write "mutating" logic in our reducers**. If we weren't using `createSlice` and the Immer library, the line `existingPost.reactions[reaction]++` would indeed mutate the existing `post.reactions` object, and this would probably cause bugs elsewhere in our app because we didn't follow the rules of reducers. But, since we _are_ using `createSlice`, we can write this more complex update logic in a simpler way, and let Immer do the work of turning this code into a safe immutable update.

Notice that **our action object just contains the minimum amount of information needed to describe what happened**. We know which post we need to update, and which reaction name was clicked on. We _could_ have calculated the new reaction counter value and put that in the action, but **it's always better to keep the action objects as small as possible, and do the state update calculations in the reducer**. This also means that **reducers can contain as much logic as necessary to calculate the new state**. In fact, **state update logic _should_ go in a reducer!**. This helps avoid issues with duplicating logic in different components, or cases where the UI layer might not have the latest data to work with.

:::info

When using Immer, you can either "mutate" an existing state object, or return a new state value yourself, but _not_ both at the same time. See the Immer docs guides on [Pitfalls](https://immerjs.github.io/immer/pitfalls) and [Returning New Data](https://immerjs.github.io/immer/return) for more details.

:::

#### Showing Reaction Buttons

Like with post authors and timestamps, we want to use this everywhere we show posts, so we'll create a `<ReactionButtons>` component that takes a `post` as a prop. When the user clicks a button, we'll dispatch the `reactionAdded` action with the name of that reaction emoji.

```tsx title="features/posts/ReactionButtons.tsx"
import { useAppDispatch } from '@/app/hooks'

import type { Post, ReactionName } from './postsSlice'
import { reactionAdded } from './postsSlice'

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

interface ReactionButtonsProps {
  post: Post
}

export const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  const dispatch = useAppDispatch()

  const reactionButtons = Object.entries(reactionEmoji).map(
    ([stringName, emoji]) => {
      // Ensure TS knows this is a _specific_ string type
      const reaction = stringName as ReactionName
      return (
        <button
          key={reaction}
          type="button"
          className="muted-button reaction-button"
          onClick={() => dispatch(reactionAdded({ postId: post.id, reaction }))}
        >
          {emoji} {post.reactions[reaction]}
        </button>
      )
    }
  )

  return <div>{reactionButtons}</div>
}
```

Now, every time we click a reaction button, the counter for that reaction should increment. If we browse around to different parts of the app, we should see the correct counter values displayed any time we look at this post, even if we click a reaction button in the `<PostsList>` and then look at the post by itself on the `<SinglePostPage>`. This is because each component is reading the same post data from the Redux store.

## Adding User Login

We've got one more feature to add in this section.

Right now, we just select which user is writing each post in the `<AddPostForm>`. To add a bit more realism, we ought to have the user log in to the application, so that we already know who is writing the posts (and be useful for other features later).

Since this is a small example app, **we aren't going to implement any _real_ authentication checks (and the point here is to learn how to use Redux features, not how to actually implement real auth)**. Instead, we'll just show a list of user names and let the actual user select one of them.

For this example, we'll just add an `auth` slice that tracks `state.auth.username` so we know who the user is. Then, we can use that information whenever they add a post to automatically add the right user ID to the post.

### Adding an Auth Slice

The first step is to create the `authSlice` and add it to the store. This is the same pattern we've seen already - define the initial state, write the slice with a couple of reducers to handle updates for login and logout, and add the slice reducer to the store.

In this case, our auth state is really just the current logged-in username, and we'll reset it to `null` if they log out.

```ts title="features/auth/authSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  username: string | null
}

const initialState: AuthState = {
  // Note: a real app would probably have more complex auth state,
  // but for this example we'll keep things simple
  username: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn(state, action: PayloadAction<string>) {
      state.username = action.payload
    },
    userLoggedOut(state) {
      state.username = null
    }
  }
})

export const { userLoggedIn, userLoggedOut } = authSlice.actions

export const selectCurrentUsername = (state: RootState) => state.auth.username

export default authSlice.reducer
```

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// highlight-next-line
import authReducer from '@/features/auth/authSlice'
import postsReducer from '@/features/posts/postsSlice'
import usersReducer from '@/features/users/usersSlice'

export const store = configureStore({
  reducer: {
    // highlight-next-line
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer
  }
})
```

### Adding the Login Page

Currently, the app's main screen is the `<Posts>` component with the posts list and add post form. We're going to change that behavior. Instead, we want the user to first see a login screen, and only be able to see the posts page after they've logged in.

First, we'll create a `<LoginPage>` component. This will read the list of users from the store, show them in a dropdown, and dispatch the `userLoggedIn` action when the form is submitted. We'll also navigate to the `/posts` route so that we can see the `<PostsMainPage>` after login:

```tsx title="features/auth/LoginPage.tsx"
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'

import { userLoggedIn } from './authSlice'

interface LoginPageFormFields extends HTMLFormControlsCollection {
  username: HTMLSelectElement
}
interface LoginPageFormElements extends HTMLFormElement {
  readonly elements: LoginPageFormFields
}

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<LoginPageFormElements>) => {
    e.preventDefault()

    const username = e.currentTarget.elements.username.value
    dispatch(userLoggedIn(username))
    navigate('/posts')
  }

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
      <h2>Welcome to Tweeter!</h2>
      <h3>Please log in:</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">User:</label>
        <select id="username" name="username" required>
          <option value=""></option>
          {usersOptions}
        </select>
        <button>Log In</button>
      </form>
    </section>
  )
}
```

Next, we need to update the routing in the `<App>` component. It needs to show `<LoginPage>` for the root `/` route, and also redirect any unauthorized access to other pages so that the user goes back to the login screen instead.

One common way to do this is to add a "protected route" component that accepts some React components as `children`, does an authorization check, and only shows the child components if the user is authorized. We can add a `<ProtectedRoute>` component that reads our `state.auth.username` value and uses that for the auth check, then wrap the entire posts-related section of the routing setup in that `<ProtectedRoute>`:

```tsx title="App.tsx"
// highlight-next-line
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom'

// highlight-next-line
import { useAppSelector } from './app/hooks'
import { Navbar } from './components/Navbar'
// highlight-next-line
import { LoginPage } from './features/auth/LoginPage'
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
import { EditPostForm } from './features/posts/EditPostForm'

// highlight-next-line
import { selectCurrentUsername } from './features/auth/authSlice'

// highlight-start
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const username = useAppSelector(selectCurrentUsername)

  if (!username) {
    return <Navigate to="/" replace />
  }

  return children
}
// highlight-end

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          // highlight-start
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/posts" element={<PostsMainPage />} />
                  <Route path="/posts/:postId" element={<SinglePostPage />} />
                  <Route path="/editPost/:postId" element={<EditPostForm />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          // highlight-end
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

We should now see both sides of the auth behavior working:

- If the user tries to access `/posts` without having logged in, the `<ProtectedRoute>` component will redirect back to `/` and show the `<LoginPage>`
- When the user logs in, we dispatch `userLoggedIn()` to update the Redux state, and then force a navigation to `/posts`, and this time `<ProtectedRoute>` will display the posts page.

### Updating the UI with the Current User

Since we now know who is logged in while using the app, we can show the user's actual name in the navbar. We should also give them a way to log out as well, by adding a "Log Out" button.

We need to get the current user object from the store so we can read `user.name` for display. We can do that by first getting the current username from the auth slice, then using that to look up the right user object. This seems like a thing we might want to do in a few places, so this is a good time to write it as a reusable `selectCurrentUser` selector. We can put that in `usersSlice.ts`, but have it import and rely on the `selectCurrentUsername` from `authSlice.ts`:

```ts title="features/users/usersSlice.ts"
// highlight-next-line
import { selectCurrentUsername } from '@/features/auth/authSlice'

// omit the rest of the slice and selectors

// highlight-start
export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state)
  return selectUserById(state, currentUsername)
}
// highlight-end
```

It's often useful to compose selectors together and use one selector inside of another. In this case, we can use both `selectCurrentUsername` and `selectUserById` together.

As with the other features we've built, we'll select the relevant state (the current user object) from the store, display the values, and dispatch the `userLoggedOut()` action when they click the "Log Out" button:

```tsx title="components/Navbar.tsx"
import { Link } from 'react-router-dom'

// highlight-start
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { userLoggedOut } from '@/features/auth/authSlice'
import { selectCurrentUser } from '@/features/users/usersSlice'

import { UserIcon } from './UserIcon'
// highlight-end

export const Navbar = () => {
  // highlight-start
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const isLoggedIn = !!user

  let navContent: React.ReactNode = null

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(userLoggedOut())
    }

    navContent = (
      <div className="navContent">
        <div className="navLinks">
          <Link to="/posts">Posts</Link>
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
  }
  // highlight-end

  return (
    <nav>
      <section>
        <h1>Redux Essentials Example</h1>
        {navContent}
      </section>
    </nav>
  )
}
```

While we're at it, we should also switch the `<AddPostForm>` to use the logged-in username from state, instead of showing a user selection dropdown. This can be done by removing all references to the `postAuthor` input field, and adding a `useAppSelector` to read the user ID from the `authSlice`:

```tsx title="features/posts/AddPostForm.tsx"
export const AddPostForm = () => {
  const dispatch = useAppDispatch()
  // highlight-next-line
  const userId = useAppSelector(selectCurrentUsername)!

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value
    // highlight-next-line
    // Removed the `postAuthor` field everywhere in the component

    dispatch(postAdded(title, content, userId))

    e.currentTarget.reset()
  }
```

Finally, it also doesn't make sense to allow the current user to edit posts defined by _other_ users. We can update the `<SinglePostPage>` to only show an "Edit Post" button if the post author ID matches the current user ID:

```tsx title="features/posts/SinglePostPage.tsx"
// highlight-next-line
import { selectCurrentUsername } from '@/features/auth/authSlice'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector(state => selectPostById(state, postId!))
  // highlight-next-line
  const currentUsername = useAppSelector(selectCurrentUsername)!

  if (!post) {
    return (
      <section>
        <h2>Post not found!</h2>
      </section>
    )
  }

  // highlight-next-line
  const canEdit = currentUsername === post.user

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        // highlight-start
        {canEdit && (
          <Link to={`/editPost/${post.id}`} className="button">
            Edit Post
          </Link>
        )}
        // highlight-end
      </article>
    </section>
  )
}
```

## Clearing Other State on Logout

There's one more piece of the auth handling that we need to look at. Right now, if we log in as user A, create a new post, log out, and then log back in as user B, we'll see both the initial example posts and the new post.

This is "correct", in that Redux is working as intended for the code we've written so far. We updated the posts lists state in the Redux store, and we haven't refreshed the page, so the same JS data is still in memory. But in terms of app behavior, it's kind of confusing, and probably even a breach of privacy. What if user B and user A aren't connected to each other? What if multiple people are sharing the same computer? They shouldn't be able to see each other's data when they log in.

Given that, it would be good if we can clear out the existing posts state when the current user logs out.

### Handling Actions in Multiple Slices

So far, every time we've wanted to make another state update, we've defined a new Redux case reducer, exported the generated action creator, and dispatched that action from a component. We _could_ do that here. But, we'd end up dispatching two separate Redux actions back-to-back, like:

```ts
dispatch(userLoggedOut())
// highlight-start
// This seems like it's duplicate behavior
dispatch(clearUserData())
// highlight-end
```

Every time we dispatch an action, the whole Redux store update process has to happen - running the reducer, notifying subscribed UI components, and re-rendering updated components. That's fine, that's how Redux and React work, but dispatching two actions in a row is usually a sign that we need to rethink how we're defining our logic.

We've already got the `userLoggedOut()` action being dispatched, but that's an action that was exported from the `auth` slice. It would be nice if we could just listen for that in the `posts` slice too.

We mentioned earlier that it helps if we think about the action as **"an event that occurred in the app"**, rather than "a command to set a value". This is a good example of that in practice. We don't _need_ a separate action for `clearUserData`, because there's only one event that occurred - "the user logged out". We just need a way to handle the one `userLoggedOut` action in multiple places, so that we can apply all the relevant state updates at the same time.

### Using `extraReducers` to Handle Other Actions

Happily, we can! `createSlice` accepts an option called **`extraReducers`**, which can be used to have the slice listen for actions that were defined elsewhere in the app. Any time those other actions are dispatched, this slice can update its own state as well. That means **_many_ different slice reducers can _all_ respond to the same dispatched action, and each slice can update its own state if needed!**

The `extraReducers` field is a function that receives a parameter named `builder`. The `builder` object has three methods attached, each of which lets the slice listen for other actions and do its own state updates:

- `builder.addCase(actionCreator, caseReducer)`: listens for one specific action type
- `builder.addMatcher(matcherFunction, caseReducer)`: listens for any one of multiple action types, using [a Redux Toolkit "matcher" function](https://redux-toolkit.js.org/api/matching-utilities) for comparing action objects
- `builder.addDefaultCase(caseReducer)`: adds a case reducer that runs if nothing else in this slice matched the action (equivalent to a `default` case inside of a `switch`).

You can chain these together, like `builder.addCase().addCase().addMatcher().addDefaultCase()`. If multiple matchers match the action, they will run in the order they were defined.

Given that, we can import the `userLoggedOut` action from `authSlice.ts` into `postsSlice.ts`, listen for that action inside of `postsSlice.extraReducers`, and return an empty posts array to reset the posts list on logout:

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

// highlight-next-line
import { userLoggedOut } from '@/features/auth/authSlice'

// omit initial state and types

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      // omit postAdded and other case reducers
  },
  // highlight-start
  extraReducers: (builder) => {
    // Pass the action creator to `builder.addCase()`
    builder.addCase(userLoggedOut, (state) => {
      // Clear out the list of posts whenever the user logs out
      return []
    })
  },
  // highlight-end
})
```

We call `builder.addCase(userLoggedOut, caseReducer)`. Inside of that reducer, we _could_ write a "mutating" state update, same as any of the other case reducers inside of a `createSlice` call. But, since we want to _replace_ the existing state entirely, the simplest thing is to just return an empty array for the new posts state.

Now, if we click the "Log Out" button, then log in as another user, the "Posts" page should be empty. That's great! We've successfully cleared out the posts state on logout.

:::tip What's the Difference between `reducers` and `extraReducers`?

The `reducers` and `extraReducers` fields inside of `createSlice` serve different purposes:

- The `reducers` field is normally an object. For every case reducer defined in the `reducers` object, `createSlice` will automatically generate an action creator with the same name, as well as an action type string to show in the Redux DevTools. **Use `reducers` to define new actions as part of the slice**.
- `extraReducers` accepts a function with a `builder` parameter, and the `builder.addCase()` and `builder.addMatcher()` methods are used to handle other action types, _without_ defining new actions. **Use `extraReducers` to handle actions that were defined _outside_ of the slice.**

:::

## What You've Learned

And that's it for this section! We've done a lot of work. We can now view and edit individual posts, see authors for each post, add emoji reactions, and track the current user as they log in and log out.

Here's what our app looks like after all these changes:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-2-authHandling?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
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
- **You can write reusable "selector" functions to encapsulate reading values from the Redux state**
  - Selectors are functions that get the Redux `state` as an argument, and return some data
- **Actions should be thought of as describing "events that happened", and many reducers can respond to the same dispatched action**
  - Apps should normally only dispatch one action at a time
  - Case reducer names (and actions) should typically be named past-tense, like `postAdded`
  - Many slice reducers can each do their own state updates in response to the same action
  - `createSlice.extraReducers` lets slices listen for actions that were defined outside of the slice
  - State values can be reset by returning a new value from the case reducer as a replacement, instead of mutating the existing state

:::

## What's Next?

By now you should be comfortable working with data in the Redux store and React components. So far we've just used data that was in the initial state or added by the user. In [Part 5: Async Logic and Data Fetching](./part-5-async-logic.md), we'll see how to work with data that comes from a server API.
