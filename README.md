redux
=========================

[![build status](https://img.shields.io/travis/gaearon/redux/master.svg?style=flat-square)](https://travis-ci.org/gaearon/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)

Redux implements predictable state management for JavaScript apps.  
It evolves the ideas of [Flux](https://facebook.github.io/flux), but avoids its complexity by taking cues from [Elm](elm-lang.org/guide/architecture).

Redux works both for client-side, universal, and native apps.  
You can use Redux together with [React](https://facebook.github.io/react/) or any other view library.  
It is tiny (2kB) and has no dependencies.

## Installation

```
npm install --save redux
```

You might also want to install the bindings for your view library of choice, for example:

```
npm install --save react-redux
```

## Documentation

* [Basics](docs/Basics)
* [Recipes](docs/Recipes)
* [Reference](docs/Reference)
* [Resources](docs/Resources)

## Testimonials

>[“Love what you’re doing with Redux”](https://twitter.com/jingc/status/616608251463909376)  
>Jing Chen, creator of Flux

>[“I asked for comments on Redux in FB's internal JS discussion group, and it was universally praised. Really awesome work.”](https://twitter.com/fisherwebdev/status/616286955693682688)  
>Bill Fisher, creator of Flux

>[“It's cool that you are inventing a better Flux by not doing Flux at all.”](https://twitter.com/andrestaltz/status/616271392930201604)  
>André Staltz, creator of Cycle

## Developer Experience

I wrote Redux while working on my React Europe talk called [“Hot Reloading with Time Travel”](https://www.youtube.com/watch?v=xsSnOQynTHs). My goal was to create a state management library with minimal API but completely predictable behavior, so it is possible to implement [logging](docs/Recipes/Logging.md), [hot reloading](docs/Recipes/Hot Reloading.md), [time travel](docs/Recipes/Time Travel.md), [universal apps](docs/Recipes/Universal Apps.md), [recording and replaying](docs/Recipes/Recording and Replaying.md), without any buy-in from the developer.

## The Gist

The whole state of your app is stored in an object tree inside a single *store*.  
The only way to mutate the state is to emit an *action*, an object describing what happened.  
To specify how the state tree is transformed by the actions, you write pure *reducers*.

[Learn more!](docs/Basics/Core Ideas.md)

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
    return 0;
  }
}

/**
 * It turns out that reducers, being pure functions, are easy to compose.
 * In fact, all state of your app can be described as a single reducer calling other reducers.
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

// There is only a single store in a Redux app.
// It holds the complete state tree of your app.
let store = createStore(twoCounters);

console.log(store.getState());
// { first: 0, second: 0 }

// You can subscribe to the updates manually, or using the bindings for your view library.
// It is possible to subscribe to updates of any granularity by comparing references.
// You can also use an efficient selector library that memoizes derived data for even better performance.

store.subscribe(() => console.log(store.getState()));

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.

store.dispatch({ type: 'INCREMENT' });
// { first: 1, second: 1}

store.dispatch({ type: 'INCREMENT', counterName: 'first' });
// { first: 2, second: 1 }

store.dispatch({ type: 'DECREMENT', counterName: 'second' });
// { first: 2, second: 0 }

// Pure functions are easy to test without mocking!
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

## License

MIT
