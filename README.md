# [Redux](http://rackt.github.io/redux)

Redux is a predictable state container for JavaScript apps.  

It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as [live code editing combined with a time traveling debugger](https://github.com/gaearon/redux-devtools).

You can use Redux together with [React](https://facebook.github.io/react/), or with any other view library.  
It is tiny (2kB) and has no dependencies.

[![build status](https://img.shields.io/travis/rackt/redux/master.svg?style=flat-square)](https://travis-ci.org/rackt/redux) 
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux) 
[![npm downloads](https://img.shields.io/npm/dm/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)


### Testimonials

>[“Love what you’re doing with Redux”](https://twitter.com/jingc/status/616608251463909376)  
>Jing Chen, creator of Flux

>[“I asked for comments on Redux in FB's internal JS discussion group, and it was universally praised. Really awesome work.”](https://twitter.com/fisherwebdev/status/616286955693682688)  
>Bill Fisher, creator of Flux

>[“It's cool that you are inventing a better Flux by not doing Flux at all.”](https://twitter.com/andrestaltz/status/616271392930201604)  
>André Staltz, creator of Cycle

### Developer Experience

I wrote Redux while working on my React Europe talk called [“Hot Reloading with Time Travel”](https://www.youtube.com/watch?v=xsSnOQynTHs). My goal was to create a state management library with minimal API but completely predictable behavior, so it is possible to implement logging, hot reloading, time travel, universal apps, record and replay, without any buy-in from the developer.

### Influences

Redux evolves the ideas of [Flux](https://facebook.github.io/flux), but avoids its complexity by taking cues from [Elm](https://github.com/evancz/elm-architecture-tutorial/).  
Whether you have used them or not, Redux takes a few minutes to get started with.

### Installation

To install the stable version:

```
npm install --save redux
```

Most likely, you’ll also need [the React bindings](http://github.com/gaearon/react-redux) and [the developer tools](http://github.com/gaearon/redux-devtools).

```
npm install --save react-redux
npm install --save-dev redux-devtools
```

This assumes that you’re using [npm](http://npmjs.com/) package manager with a module bundler like [Webpack](http://webpack.github.io) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

If you don’t yet use [npm](http://npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `Redux` available as a global object, you can grab a pre-built version from [cdnjs](https://cdnjs.com/libraries/redux). We *don’t* recommend this approach for any serious application, as most of the libraries complementary to Redux are only available on [npm](http://npmjs.com/).

### The Gist

The whole state of your app is stored in an object tree inside a single *store*.  
The only way to change the state tree is to emit an *action*, an object describing what happened.  
To specify how the actions transform the state tree, you write pure *reducers*.

That’s it!

```js
import { createStore } from 'redux';

/**
 * This is a reducer, a pure function with (state, action) => state signature.
 * It describes how an action transforms the state into the next state.
 *
 * The shape of the state is up to you: it can be a primitive, an array, an object,
 * or even an Immutable.js data structure. The only important part is that you should
 * not mutate the state object, but return a new object if the state changes.
 *
 * In this example, we use a `switch` statement and strings, but you can use a helper that
 * follows a different convention (such as function maps) if it makes sense for your project.
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

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
let store = createStore(counter);

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
// 1
```

Instead of mutating the state directly, you specify the mutations you want to happen with plain objects called *actions*. Then you write a special function called a *reducer* to decide how every action transforms the entire application’s state.

If you’re coming from Flux, there is a single important difference you need to understand. Redux doesn’t have a Dispatcher or support many stores. Instead, there is just a single store with a single root reducing function. As your app grows, instead of adding stores, you split the root reducer into smaller reducers independently operating on the different parts of the state tree. This is exactly like there is just one root component in a React app, but it is composed out of many small components.

This architecture might seem like an overkill for a counter app, but the beauty of this pattern is how well it scales to large and complex apps. It also enables very powerful developer tools, because it is possible to trace every mutation to the action that caused it. You can record user sessions and reproduce them just by replaying every action.

### Documentation

* [Introduction](http://rackt.github.io/redux/docs/introduction/index.html)
* [Basics](http://rackt.github.io/redux/docs/basics/index.html)
* [Advanced](http://rackt.github.io/redux/docs/advanced/index.html)
* [Recipes](http://rackt.github.io/redux/docs/recipes/index.html)
* [Troubleshooting](http://rackt.github.io/redux/docs/Troubleshooting.html)
* [Glossary](http://rackt.github.io/redux/docs/Glossary.html)
* [API Reference](http://rackt.github.io/redux/docs/api/index.html)

For PDF, ePub, and MOBI exports for offline reading, and instructions on how to create them, please see: [paulwittmann/redux-offline-docs](https://github.com/paulwittmann/redux-offline-docs).

### Examples

* [Counter](http://rackt.github.io/redux/docs/introduction/Examples.html#counter) ([source](https://github.com/rackt/redux/tree/master/examples/counter))
* [TodoMVC](http://rackt.github.io/redux/docs/introduction/Examples.html#todomvc) ([source](https://github.com/rackt/redux/tree/master/examples/todomvc))
* [Async](http://rackt.github.io/redux/docs/introduction/Examples.html#async) ([source](https://github.com/rackt/redux/tree/master/examples/async))
* [Real World](http://rackt.github.io/redux/docs/introduction/Examples.html#real-world) ([source](https://github.com/rackt/redux/tree/master/examples/real-world))

If you’re new to the NPM ecosystem and have troubles getting a project up and running, or aren’t sure where to paste the gist above, check out [simplest-redux-example](https://github.com/jackielii/simplest-redux-example) that uses Redux together with React and Browserify.

### Discussion

Join the **#redux** channel of the [Reactiflux](http://reactiflux.com) Slack community.

### Thanks

* [The Elm Architecture](https://github.com/evancz/elm-architecture-tutorial) for a great intro to modeling state updates with reducers;
* [Turning the database inside-out](http://blog.confluent.io/2015/03/04/turning-the-database-inside-out-with-apache-samza/) for blowing my mind;
* [Developing ClojureScript with Figwheel](http://www.youtube.com/watch?v=j-kj2qwJa_E) for convincing me that re-evaluation should “just work”;
* [Webpack](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack) for Hot Module Replacement;
* [Flummox](https://github.com/acdlite/flummox) for teaching me to approach Flux without boilerplate or singletons;
* [disto](https://github.com/threepointone/disto) for a proof of concept of hot reloadable Stores;
* [NuclearJS](https://github.com/optimizely/nuclear-js) for proving this architecture can be performant;
* [Om](https://github.com/omcljs/om) for popularizing the idea of a single state atom;
* [Cycle](https://github.com/staltz/cycle) for showing how often a function is the best tool;
* [React](https://github.com/facebook/react) for the pragmatic innovation.

Special thanks to [Jamie Paton](http://jdpaton.github.io) for handing over the `redux` NPM package name.

### Patrons

The work on Redux was [funded by the community](https://www.patreon.com/reactdx).  
Meet some of the outstanding companies that made it possible:

* [Webflow](http://webflow.com/)
* [Chess iX](http://www.chess-ix.com/)

[See the full list of Redux patrons.](PATRONS.md)

### License

MIT
