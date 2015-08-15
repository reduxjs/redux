# Async Actions

In the [previous section](Middleware.md), we explored how Redux middleware can intercept, delay or transform actions before they reach the reducer. There are a variety of use cases for middleware; logging and crash reporting being great examples. However, the most common use case for middleware is expressing asynchronous API calls.

In the [basics guide](../basics/README.md), we built a simple todo application. It was fully synchronous. Every time an action was dispatched, the state was updated immediately.

In this guide, we will build a different, asynchronous application. It will use the Reddit API to show the current headlines for a select subreddit. How does asynchronicity fit into Redux flow?

## Actions

Even if you call an asynchronous API, you need to dispatch actions to change the stored data, and they will be processed by reducers synchronously. Usually, for any API request you’ll want to dispatch at least three different kinds of actions:

* **An action informing the reducers that the request began.**

  The reducers may handle this action by toggling an `isFetching` flag in the state. This way the UI knows it’s time to show a spinner.

* **An action informing the reducers that the request finished successfully.**

  The reducers may handle this action by merging the new data into the state they manage and resetting `isFetching`. The UI would hide the spinner, and display the fetched data.

* **An action informing the reducers that the request failed.**

  The reducers may handle this action by resetting `isFetching`. Maybe, some reducers will also want to store the error message so the UI can display it.

You may use a dedicated `status` field in your actions:

```js
{ type: 'FETCH_POSTS' }
{ type: 'FETCH_POSTS', status: 'error', error: 'Oops' }
{ type: 'FETCH_POSTS', status: 'success', response: { ... } }
```

Or you can define separate types for them:

```js
{ type: 'FETCH_POSTS_REQUEST' }
{ type: 'FETCH_POSTS_FAILURE', error: 'Oops' }
{ type: 'FETCH_POSTS_SUCCESS', response: { ... } }
```

Choosing whether to use a single action type with flags, or multiple action types, is up to you. It’s a convention you need to decide with your team. Multiple types leave less room for a mistake, but this is not an issue if you generate action creators and reducers with a helper library like [redux-actions](https://github.com/acdlite/redux-actions).

Whatever convention you choose, stick with it throughout the application.  
We’ll use separate types in this tutorial.

## Synchronous Action Creators

Let’s start by defining several synchronous action types and action creators for them. In our app, the user can select a reddit to display:

```js
export const SELECT_REDDIT = 'SELECT_REDDIT';

export function selectReddit(reddit) {
  return {
    type: SELECT_REDDIT,
    reddit
  };
}
```

They can also press a “refresh” button to update it:

```js
export const INVALIDATE_REDDIT = 'INVALIDATE_REDDIT';

export function invalidateReddit(reddit) {
  return {
    type: INVALIDATE_REDDIT,
    reddit
  };
}
```

These were the actions governed by the user interaction. We will also have another kind of action, governed by the network requests. We will see how to dispatch them later, but for now, we just want to define them.

When it’s time to fetch the posts for some reddit, we will dispatch a `REQUEST_POSTS` action:

```js
export const REQUEST_POSTS = 'REQUEST_POSTS';

export function requestPosts(reddit) {
  return {
    type: REQUEST_POSTS,
    reddit
  };
}
```

It is important for it to be separate from `SELECT_REDDIT` or `INVALIDATE_REDDIT`. While they may occur one after another, as the app grows more complex, you might want to fetch some data independently of the user action (for example, to prefetch the most popular reddits, or to refresh stale data once in a while). You may also want to fetch in response to a route change, so it’s not wise to couple fetching to some particular UI event early on.

Finally, when the network request comes through, we will dispatch `RECEIVE_POSTS`:

```js
export const RECEIVE_POSTS = 'RECEIVE_POSTS';

export function receivePosts(reddit, json) {
  return {
    type: RECEIVE_POSTS,
    reddit: reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}
```

This is all we need to know for now. The particular mechanism to dispatch these actions together with network requests will be discussed later.

>##### Note on Error Handling

>In a real app, you’d also want to dispatch an action on request failure. We won’t implement error handling in this tutorial, but the [real world example](../introduction/Examples.html#real-world) shows one of the possible approaches.

## Designing the State Shape

Just like in the basic tutorial, you’ll need to [design the shape of your application’s state](../basics/Reducers.md#designing-the-state-shape) before rushing into the implementation. With asynchronous code, there is more state to take care of, so we need to think it through.

This part is often confusing to beginners, because it is not immediately clear what information describes the state of an asynchronous application, and how to organize it in a single tree.

We’ll start with the most common use case: lists. Web applications often show lists of things. For example, a list of posts, or a list of friends. You’ll need to figure out what sorts of lists your app can show. You want to store them separately in the state, because this way you can cache them and only fetch again if necessary.

Here’s what the state shape for our “Reddit headlines” app might look like:

```js
{
  selectedReddit: 'frontend',
  postsByReddit: {
    frontend: {
      isFetching: true,
      didInvalidate: false,
      items: []
    },
    reactjs: {
      isFetching: false,
      didInvalidate: false,
      lastUpdated: 1439478405547,
      items: [{
        id: 42,
        title: 'Confusion about Flux and Relay'
      }, {
        id: 500,
        title: 'Creating a Simple Application Using React JS and Flux Architecture'
      }]
    }
  }
}
```

There are a few important bits here:

* We store each subreddit’s information separately so we can cache every subreddit. When the user switches between them the second time, the update will be instant, and we won’t need to refetch unless we want to. Don’t worry about all these items being in memory: unless you’re dealing with tens of thousands of items, and your user rarely closes the tab, you won’t need any sort of cleanup.

* For every list of items, you’ll want to store `isFetching` to show a spinner, `didInvalidate` so you can later toggle it when the data is stale, `lastUpdated` so you know when it was fetched the last time, and the `items` themselves. In a real app, you’ll also want to store pagination state like `fetchedPageCount` and `nextPageUrl`.

>##### Note on Nested Entities

>In this example, we store the received items together with the pagination information. However, this approach won’t work well if you have nested entities referencing each other, or if you let the user edit items. Imagine the user wants to edit a fetched post, but this post is duplicated in several places in the state tree. This would be really painful to implement.

>If you have nested entities, or if you let users edit received entities, you should keep them separately in the state as if it was a database. In pagination information, you would only refer to them by their IDs. This lets you always keep them up to date. The [real world example](../introduction/Examples.html#real-world) shows this approach, together with [normalizr](https://github.com/gaearon/normalizr) to normalize the nested API responses. With this approach, your state might look like this:

>```js
> {
>   selectedReddit: 'frontend',
>   entities: {
>     users: {
>       2: {
>         id: 2,
>         name: 'Andrew'
>       }
>     },
>     posts: {
>       42: {
>         id: 42,
>         title: 'Confusion about Flux and Relay',
>         author: 2
>       },
>       100: {
>         id: 100,
>         title: 'Creating a Simple Application Using React JS and Flux Architecture',
>         author: 2
>       }
>     }
>   },
>   postsByReddit: {
>     frontend: {
>       isFetching: true,
>       didInvalidate: false,
>       items: []
>     },
>     reactjs: {
>       isFetching: false,
>       didInvalidate: false,
>       lastUpdated: 1439478405547,
>       items: [42, 100]
>     }
>   }
> }
>```

>In this guide, we won’t normalize entities, but it’s something you should consider for a more dynamic application.

## Handling Actions

Before going into the details of dispatching actions together with network requests, we will write the reducers for the actions we defined above.

>##### Note on Reducer Composition

> Here, we assume that you understand reducer composition with [`combineReducers()`](../api/combineReducers.md), as described in the [Splitting Reducers](../basics/Reducers.md#splitting-reducers) section on the [basics guide](../basics/README.md). If you don’t, please [read it first](../basics/Reducers.md#splitting-reducers).

#### `reducers.js`

```js
import { combineReducers } from 'redux';
import {
  SELECT_REDDIT, INVALIDATE_REDDIT,
  REQUEST_POSTS, RECEIVE_POSTS
} from '../actions';

function selectedReddit(state = 'reactjs', action) {
  switch (action.type) {
  case SELECT_REDDIT:
    return action.reddit;
  default:
    return state;
  }
}

function posts(state = {
  isFetching: false,
  didInvalidate: false,
  items: []
}, action) {
  switch (action.type) {
  case INVALIDATE_REDDIT:
    return Object.assign({}, state, {
      didInvalidate: true
    });
  case REQUEST_POSTS:
    return Object.assign({}, state, {
      isFetching: true,
      didInvalidate: false
    });
  case RECEIVE_POSTS:
    return Object.assign({}, state, {
      isFetching: false,
      didInvalidate: false,
      items: action.posts,
      lastUpdated: action.receivedAt
    });
  default:
    return state;
  }
}

function postsByReddit(state = { }, action) {
  switch (action.type) {
  case INVALIDATE_REDDIT:
  case RECEIVE_POSTS:
  case REQUEST_POSTS:
    return Object.assign({}, state, {
      [action.reddit]: posts(state[action.reddit], action)
    });
  default:
    return state;
  }
}

const rootReducer = combineReducers({
  postsByReddit,
  selectedReddit
});

export default rootReducer;
```

In this code, there are two interesting parts:

* We use ES6 computed property syntax so we can update `state[action.reddit]` with `Object.assign()` in a terse way. This:

    ```js
    return Object.assign({}, state, {
      [action.reddit]: posts(state[action.reddit], action)
    });
    ```
  is equivalent to this:

  ```js
    let nextState = {};
    nextState[action.reddit] = posts(state[action.reddit], action);
    return Object.assign({}, state, nextState);
  ```
* We extracted `posts(state, action)` that manages the state of a specific post list. This is just [reducer composition](../basics/Reducers.md#splitting-reducers)! It is our choice how to split the reducer into smaller reducers, and in this case, we’re delegating updating items inside an object to a `posts` reducer. The [real world example](../introduction/Examples.html#real-world) goes even further, showing how to create a reducer factory for parameterized pagination reducers.

Remember that reducers are just functions, so you can use functional composition and higher-order functions as much as you feel comfortable.

## Async Action Creators

Finally, how do we use the synchronous action creators we [defined earlier](#synchronous-action-creators) together with network requests? Surely, we can do this manually:

```js
import fetch from 'isomorphic-fetch';
import { createStore } from 'redux';
import { selectReddit, requestPosts, receivePosts } from './actions';
import rootReducer from './reducers';

const store = createStore(rootReducer);

store.dispatch(selectReddit('reactjs'));

store.dispatch(requestPosts('reactjs'));
fetch(`http://www.reddit.com/r/${reddit}.json`)
  .then(req => req.json())
  .then(json =>
    store.dispatch(receivePosts(reddit, json))
  )
  .then(() => {
    console.log(store.getState());
  });
```

We can do the same from our components. However, it quickly gets tedious. Usually you want some kind of common logic before performing a request, such as looking up something in the state, and maybe deciding not to fetch because the data is cached.

Clearly, actions can’t express control flow. The best tool for control flow is a function. A function can have an `if` statement, or an early `return`. If a function has access to a `dispatch` method, it can call it many times, potentially asynchronously. Does this ring a bell?

In the [previous section](Middleware.md), we explored the most common extension mechanism for Redux: the middleware. Middleware lets you inject custom logic between the initial `dispatch()` call and the time the action reaches a reducer.

What if we wrote a middleware that lets us **return functions from action creators**? By the way, functions that return functions are traditionally called “thunks”, so we’ll call it “thunk middleware”. It could look like this:

```js
const thunkMiddleware = store => next => action => {
  if (typeof action !== 'function') {
    // Normal action, pass it on
    return next(action);
  }

  // Woah, somebody tried to dispatch a function!
  // We will invoke it immediately and give `store.dispatch`
  // to it. This will invert control and let it dispatch
  // many times. We will also pass `getState` to it so it
  // can peek into the current state and make decisions based on it.

  const result = action(store.dispatch, store.getState);

  // Whatever the user returned from that function, we'll return too,
  // so it becomes `dispatch()` returns value. This is convenient
  // in case user wants to return a Promise to wait for.

  return result;
};
```

If this doesn’t make sense, you need to go back to the [middleware introduction](Middleware.md). This lets us rewrite our example so that `fetchPosts()` is just another action creator, but it returns a function:

#### `actions.js`

```js
export const REQUEST_POSTS = 'REQUEST_POSTS';
function requestPosts(reddit) {
  return {
    type: REQUEST_POSTS,
    reddit
  };
}

export const RECEIVE_POSTS = 'RECEIVE_POSTS'
function receivePosts(reddit, json) {
  return {
    type: RECEIVE_POSTS,
    reddit: reddit,
    posts: json.data.children.map(child => child.data),
    receivedAt: Date.now()
  };
}

export function fetchPosts(reddit) {
  // thunk middleware knows how to handle functions
  return function (dispatch) {
    dispatch(requestPosts(reddit));

    // Return a promise to wait for
    // (this is not required by thunk middleware, but it is convenient for us)
    return fetch(`http://www.reddit.com/r/${reddit}.json`)
      .then(req => req.json())
      .then(json =>
        // We can dispatch many times!
        dispatch(receivePosts(reddit, json))
      );
  };
}
```

#### `index.js`

```js
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { selectReddit, fetchPosts } from './actions';
import rootReducer from './reducers';

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware, // lets us dispatch() functions
  loggerMiddleware // neat middleware that logs actions
)(createStore);

const store = createStoreWithMiddleware(rootReducer);

store.dispatch(selectReddit('reactjs'));
store.dispatch(fetchPosts('reactjs')).then(() =>
  console.log(store.getState());
);
```

The nice thing about thunks is that they can dispatch results of each other:

#### `actions.js`

```js
function fetchPosts(reddit) {
  return dispatch => {
    dispatch(requestPosts(reddit));
    return fetch(`http://www.reddit.com/r/${reddit}.json`)
      .then(req => req.json())
      .then(json => dispatch(receivePosts(reddit, json)));
  };
}

function shouldFetchPosts(state, reddit) {
  const posts = state.postsByReddit[reddit];
  if (!posts) {
    return true;
  } else if (posts.isFetching) {
    return false;
  } else {
    return posts.didInvalidate;
  }
}

export function fetchPostsIfNeeded(reddit) {
  return (dispatch, getState) => {
    if (shouldFetchPosts(getState(), reddit)) {
      // Dispatch a thunk from thunk!
      return dispatch(fetchPosts(reddit));
    } else {
      // Let the calling code know there's nothing to wait for.
      return Promise.resolve();
    }
  };
}
```

This lets us write more sophisticated async control flow gradually, while the consuming code can stay pretty much the same:

#### `index.js`

```js
store.dispatch(fetchPostsIfNeeded('reactjs')).then(() =>
  console.log(store.getState());
);
```

>##### Note about Server Rendering

>Async action creators are especially convenient for server rendering. You can create a store, dispatch a single async action creator that dispatches other async action creators to fetch data for a whole section of your app, and only render after the Promise it returns, completes. Then your store will already be hydrated with the state you need before rendering.

[Thunk middleware](https://github.com/gaearon/redux-thunk) isn’t the only way to orchestrate asynchronous actions in Redux. You can use [redux-promise](https://github.com/acdlite/redux-promise) or [redux-promise-middleware](https://github.com/pburtchaell/redux-promise-middleware) to dispatch Promises instead of functions. You can dispatch Observables with [redux-rx](https://github.com/acdlite/redux-rx). You can even write a custom middleware to describe calls to your API, like the [real world example](../introduction/Examples.html#real-world) does. It is up to you to try a few options, choose a convention you like, and follow it, whether with, or without the middleware.

## Connecting to UI

Dispatching async actions is no different from dispatching synchronous actions, so we won’t discuss this in detail. See [Usage with React](../basics/UsageWithReact.md) for an introduction into using Redux from React components. See [Example: Reddit API](ExampleRedditAPI.md) for the complete source code discussed in this example.

## Next Steps

Read [Async Flow](AsyncFlow.md) to recap how async actions fit into the Redux flow.
