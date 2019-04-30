---
id: updating-normalized-data
title: Updating Normalized Data
sidebar_label: Updating Normalized Data
hide_title: true
---

# Managing Normalized Data

As mentioned in [Normalizing State Shape](./NormalizingStateShape.md), the Normalizr library is frequently used to transform nested response data into a normalized shape suitable for integration into the store. However, that doesn't address the issue of executing further updates to that normalized data as it's being used elsewhere in the application. There are a variety of different approaches that you can use, based on your own preference. We'll use the example of adding a new Comment to a Post.

## Standard Approaches

### Simple Merging

One approach is to merge the contents of the action into the existing state. In this case, we need to do a deep recursive merge, not just a shallow copy. The Lodash `merge` function can handle this for us:

```js
import merge from 'lodash/merge'

function commentsById(state = {}, action) {
  switch (action.type) {
    default: {
      if (action.entities && action.entities.comments) {
        return merge({}, state, action.entities.comments.byId)
      }
      return state
    }
  }
}
```

This requires the least amount of work on the reducer side, but does require that the action creator potentially do a fair amount of work to organize the data into the correct shape before the action is dispatched. It also doesn't handle trying to delete an item.

### Slice Reducer Composition

If we have a nested tree of slice reducers, each slice reducer will need to know how to respond to this action appropriately. We will need to include all the relevant data in the action. We need to update the correct Post object with the comment's ID, create a new Comment object using that ID as a key, and include the Comment's ID in the list of all Comment IDs. Here's how the pieces for this might fit together:

```js
// actions.js
function addComment(postId, commentText) {
  // Generate a unique ID for this comment
  const commentId = generateId('comment')

  return {
    type: 'ADD_COMMENT',
    payload: {
      postId,
      commentId,
      commentText
    }
  }
}

// reducers/posts.js
function addComment(state, action) {
  const { payload } = action
  const { postId, commentId } = payload

  // Look up the correct post, to simplify the rest of the code
  const post = state[postId]

  return {
    ...state,
    // Update our Post object with a new "comments" array
    [postId]: {
      ...post,
      comments: post.comments.concat(commentId)
    }
  }
}

function postsById(state = {}, action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addComment(state, action)
    default:
      return state
  }
}

function allPosts(state = [], action) {
  // omitted - no work to be done for this example
}

const postsReducer = combineReducers({
  byId: postsById,
  allIds: allPosts
})

// reducers/comments.js
function addCommentEntry(state, action) {
  const { payload } = action
  const { commentId, commentText } = payload

  // Create our new Comment object
  const comment = { id: commentId, text: commentText }

  // Insert the new Comment object into the updated lookup table
  return {
    ...state,
    [commentId]: comment
  }
}

function commentsById(state = {}, action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addCommentEntry(state, action)
    default:
      return state
  }
}

function addCommentId(state, action) {
  const { payload } = action
  const { commentId } = payload
  // Just append the new Comment's ID to the list of all IDs
  return state.concat(commentId)
}

function allComments(state = [], action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addCommentId(state, action)
    default:
      return state
  }
}

const commentsReducer = combineReducers({
  byId: commentsById,
  allIds: allComments
})
```

The example is a bit long, because it's showing how all the different slice reducers and case reducers fit together. Note the delegation involved here. The `postsById` slice reducer delegates the work for this case to `addComment`, which inserts the new Comment's ID into the correct Post item. Meanwhile, both the `commentsById` and `allComments` slice reducers have their own case reducers, which update the Comments lookup table and list of all Comment IDs appropriately.

## Other Approaches

### Task-Based Updates

Since reducers are just functions, there's an infinite number of ways to split up this logic. While using slice reducers is the most common, it's also possible to organize behavior in a more task-oriented structure. Because this will often involve more nested updates, you may want to use an immutable update utility library like [dot-prop-immutable](https://github.com/debitoor/dot-prop-immutable) or [object-path-immutable](https://github.com/mariocasciaro/object-path-immutable) to simplify the update statements. Here's an example of what that might look like:

```js
import posts from "./postsReducer";
import comments from "./commentsReducer";
import dotProp from "dot-prop-immutable";
import {combineReducers} from "redux";
import reduceReducers from "reduce-reducers";

const combinedReducer = combineReducers({
    posts,
    comments
});


function addComment(state, action) {
    const {payload} = action;
    const {postId, commentId, commentText} = payload;

    // State here is the entire combined state
    const updatedWithPostState = dotProp.set(
        state,
        `posts.byId.${postId}.comments`,
        comments => comments.concat(commentId)
    );

    const updatedWithCommentsTable = dotProp.set(
        updatedWithPostState,
        `comments.byId.${commentId}`,
        {id : commentId, text : commentText}
    );

    const updatedWithCommentsList = dotProp.set(
        updatedWithCommentsTable,
        `comments.allIds`,
        allIds => allIds.concat(commentId);
    );

    return updatedWithCommentsList;
}

const featureReducers = createReducer({}, {
    ADD_COMMENT : addComment,
};

const rootReducer = reduceReducers(
    combinedReducer,
    featureReducers
);
```

This approach makes it very clear what's happening for the `"ADD_COMMENTS"` case, but it does require nested updating logic, and some specific knowledge of the state tree shape. Depending on how you want to compose your reducer logic, this may or may not be desired.

### Redux-ORM

The [Redux-ORM](https://github.com/redux-orm/redux-orm) library provides a very useful abstraction layer for managing normalized data in a Redux store. It allows you to declare Model classes and define relations between them. It can then generate the empty "tables" for your data types, act as a specialized selector tool for looking up the data, and perform immutable updates on that data.

There's a couple ways Redux-ORM can be used to perform updates. First, the Redux-ORM docs suggest defining reducer functions on each Model subclass, then including the auto-generated combined reducer function into your store:

```js
// models.js
import { Model, fk, attr, ORM } from 'redux-orm'

export class Post extends Model {
  static get fields() {
    return {
      id: attr(),
      name: attr()
    }
  }

  static reducer(action, Post, session) {
    switch (action.type) {
      case 'CREATE_POST': {
        Post.create(action.payload)
        break
      }
    }
  }
}
Post.modelName = 'Post'

export class Comment extends Model {
  static get fields() {
    return {
      id: attr(),
      text: attr(),
      // Define a foreign key relation - one Post can have many Comments
      postId: fk({
        to: 'Post', // must be the same as Post.modelName
        as: 'post', // name for accessor (comment.post)
        relatedName: 'comments' // name for backward accessor (post.comments)
      })
    }
  }

  static reducer(action, Comment, session) {
    switch (action.type) {
      case 'ADD_COMMENT': {
        Comment.create(action.payload)
        break
      }
    }
  }
}
Comment.modelName = 'Comment'

// Create an ORM instance and hook up the Post and Comment models
export const orm = new ORM()
orm.register(Post, Comment)

// main.js
import { createStore, combineReducers } from 'redux'
import { createReducer } from 'redux-orm'
import { orm } from './models'

const rootReducer = combineReducers({
  // Insert the auto-generated Redux-ORM reducer.  This will
  // initialize our model "tables", and hook up the reducer
  // logic we defined on each Model subclass
  entities: createReducer(orm)
})

// Dispatch an action to create a Post instance
store.dispatch({
  type: 'CREATE_POST',
  payload: {
    id: 1,
    name: 'Test Post Please Ignore'
  }
})

// Dispatch an action to create a Comment instance as a child of that Post
store.dispatch({
  type: 'ADD_COMMENT',
  payload: {
    id: 123,
    text: 'This is a comment',
    postId: 1
  }
})
```

The Redux-ORM library maintains relationships between models for you. Updates are by default applied immutably, simplifying the update process.

Another variation on this is to use Redux-ORM as an abstraction layer within a single case reducer:

```js
import { orm } from './models'

// Assume this case reducer is being used in our "entities" slice reducer,
// and we do not have reducers defined on our Redux-ORM Model subclasses
function addComment(entitiesState, action) {
  // Start an immutable session
  const session = orm.session(entitiesState)

  session.Comment.create(action.payload)

  // The internal state reference has now changed
  return session.state
}
```

By using the session interface you can now use relationship accessors to directly access referenced models:

```js
const session = orm.session(store.getState().entities)
const comment = session.Comment.first() // Comment instance
const { post } = comment // Post instance
post.comments.filter(c => c.text === 'This is a comment').count() // 1
```

Overall, Redux-ORM provides a very useful set of abstractions for defining relations between data types, creating the "tables" in our state, retrieving and denormalizing relational data, and applying immutable updates to relational data.
