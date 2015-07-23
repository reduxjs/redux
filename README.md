redux
=========================

[![build status](https://img.shields.io/travis/gaearon/redux/master.svg?style=flat-square)](https://travis-ci.org/gaearon/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)

Redux implements predictable state management for JavaScript apps.  
It evolves the ideas of [Flux](https://facebook.github.io/flux), but avoids its complexity by taking cues from [Elm](elm-lang.org/guide/architecture).

Redux works for client-side, universal, and native apps.  
You can use Redux together with [React](https://facebook.github.io/react/) or any other view library.  
It is tiny (2kB) and has no dependencies.

### Installation

```
npm install --save redux
```

You might also want to install the bindings for your view library of choice, for example:

```
npm install --save react-redux
```

### Documentation

* [Basics](docs/Basics) cover the core ideas of Redux and its differences from other libraries.
* [Recipes](docs/Recipes) are full of practical solutions to the problems you’ll encounter building an app.
* [Reference](docs/Reference) provides the glossary and the complete API documentation.
* [Resources](docs/Resources) is a curated list of the utilities, tools, and examples created by the community.

### Testimonials

>[“Love what you’re doing with Redux”](https://twitter.com/jingc/status/616608251463909376)  
>Jing Chen, creator of Flux

>[“I asked for comments on Redux in FB's internal JS discussion group, and it was universally praised. Really awesome work.”](https://twitter.com/fisherwebdev/status/616286955693682688)  
>Bill Fisher, creator of Flux

>[“It's cool that you are inventing a better Flux by not doing Flux at all.”](https://twitter.com/andrestaltz/status/616271392930201604)  
>André Staltz, creator of Cycle

### Developer Experience

I wrote Redux while working on my React Europe talk called [“Hot Reloading with Time Travel”](https://www.youtube.com/watch?v=xsSnOQynTHs). My goal was to create a state management library with minimal API but completely predictable behavior, so it is possible to implement [logging](docs/Recipes/Logging.md), [hot reloading](docs/Recipes/Hot Reloading.md), [time travel](docs/Recipes/Time Travel.md), [universal apps](docs/Recipes/Universal Apps.md), [recording and replaying](docs/Recipes/Recording and Replaying.md), without any buy-in from the developer.

### The Gist

The whole state of your app is stored in an object tree inside a single *store*.  
The only way to mutate the state is to emit an *action*, an object describing what happened.  
To specify how the state tree is transformed by the actions, you write pure *reducers*.

[Learn more!](docs/Basics/Core Ideas.md)

#### A Counter

Let’s start with an example where we increment and decrement a single counter.

```js
import { createStore } from 'redux';

/**
 * This is a reducer, a pure function with (state, action) => state signature.
 * It describes how an action transforms the state into the next state.
 *
 * In this example, we use a `switch` statement and strings, but you can use a helper that
 * follows a different convention (such as function maps) that makes sense for your project.
 */
function counter(state = 0, action) {
  switch (action.type) {
  case 'INCREMENT':
    return state + 1;
  case 'DECREMENT':
    return state - 1;
  default:
    return state;
  }
}

// Create a Redux store that holds the state of your app.
let store = createStore(counter);

// You can read the current state of your store at any time.
console.log(store.getState());
// 0

// You can subscribe to the updates manually, or use bindings to your view layer.
store.subscribe(() =>
  console.log(store.getState())
);

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
store.dispatch({ type: 'INCREMENT' });
// 1
store.dispatch({ type: 'INCREMENT' });
// 2
store.dispatch({ type: 'DECREMENT' });
// 0
```

Instead of mutating the state directly, you specify the mutations you want to happen with plain objects called *actions*. A special function called a *reducer* specifies how each action transforms the internal state.

This might seem like an overkill for a counter app, but the beauty of this pattern is in how well it scales to large and complex apps. It also enables very powerful developer tools, because it is possible to trace every mutation to the action that caused it. You can also record user sessions and reproduce them just by replaying every action.

#### Two Counters

Let’s say we now need to manage two counters separately. You don't need to throw away your `counter` function or create a second store! Remember, in Redux there is just a single store managing your whole application.

Instead, we will create another function called `twoCounters` that *calls* your `counter` function and delegates its subtree to it. This is similar to how, in a React application, you would have a single root component that is described in terms of child components. Functional composition is a powerful tool!

```js
/**
 * It turns out that reducers, being pure functions, are easy to compose.
 * In fact, all state of your app can be described as a single reducer calling other reducers.
 * We will delegate managing the counters to the `counter` function defined in the previous example.
 * This function doesn't know *how* to update the counter—just that there are two counters!
 */
function twoCounters(state = {}, action) {
  switch (action.counterName) {
  case 'first':
    return {
      first: counter(state.first, action),
      second: state.second
    };
  case 'second':
    return {
      first: state.first,
      second: counter(state.second, action)
    };
  default:
    return {
      first: counter(state.first, action),
      second: counter(state.second, action)
    };
  }
}

// Don’t forget there is only a single store in a Redux app.
// It holds the complete state tree of your app.
// We changed `createStore` call to use `twoCounters` as the reducer instead of `counter`.
let store = createStore(twoCounters);

// This time, the store’s state will contain the values of both counters!
console.log(store.getState());
// { first: 0, second: 0 }

// You may subscribe to the updates manually, or use bindings to your view layer.
// It is possible to subscribe to updates of any granularity by comparing references.
// You can use a special library to compute and memoize derived data.
store.subscribe(() => {
  console.log(store.getState())
});

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
store.dispatch({ type: 'INCREMENT' });
// { first: 1, second: 1}
store.dispatch({ type: 'INCREMENT', counterName: 'first' });
// { first: 2, second: 1 }
store.dispatch({ type: 'DECREMENT', counterName: 'second' });
// { first: 2, second: 0 }

// Bonus: pure functions are easy to test without mocking!
expect(twoCounters({
  first: 5,
  second: 10
}, {
  type: 'INCREMENT',
  counterName: 'first'
})).toEqual({
  first: 6,
  second: 10
});
```

#### Next Steps

You’ll probably want to connect Redux to the view layer of your choice. Check out [Getting Started](docs/Basics/Getting Started.md) for a more realistic app walkthrough with a suggest file structure, or head straight to [Connecting UI](docs/Recipes/Connecting UI.md) where you can find instructions on connecting the UI library of your choice to Redux.

### License

MIT
