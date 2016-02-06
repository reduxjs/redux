# [Redux](http://rackt.github.io/redux)

Redux is a predictable state container for JavaScript apps.  

It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as [live code editing combined with a time traveling debugger](https://github.com/gaearon/redux-devtools).

You can use Redux together with [React](https://facebook.github.io/react/), or with any other view library.  
It is tiny (2kB) and has no dependencies.

[![build status](https://img.shields.io/travis/rackt/redux/master.svg?style=flat-square)](https://travis-ci.org/rackt/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![npm downloads](https://img.shields.io/npm/dm/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on discord](https://img.shields.io/badge/discord-%23redux%20%40%20reactiflux-61dafb.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bZ6au5t)
[![#rackt on freenode](https://img.shields.io/badge/irc-%23rackt%20%40%20freenode-61DAFB.svg?style=flat-square)](https://webchat.freenode.net/)
[![Changelog #187](https://img.shields.io/badge/changelog-%23187-lightgrey.svg?style=flat-square)](https://changelog.com/187)

>**New! Learn Redux from its creator:  
>[Getting Started with Redux](https://egghead.io/series/getting-started-with-redux) (30 free videos)**

### Testimonials

>[“Love what you’re doing with Redux”](https://twitter.com/jingc/status/616608251463909376)  
>Jing Chen, creator of Flux

>[“I asked for comments on Redux in FB's internal JS discussion group, and it was universally praised. Really awesome work.”](https://twitter.com/fisherwebdev/status/616286955693682688)  
>Bill Fisher, author of Flux documentation

>[“It's cool that you are inventing a better Flux by not doing Flux at all.”](https://twitter.com/andrestaltz/status/616271392930201604)  
>André Staltz, creator of Cycle

### Developer Experience

I wrote Redux while working on my React Europe talk called [“Hot Reloading with Time Travel”](https://www.youtube.com/watch?v=xsSnOQynTHs). My goal was to create a state management library with minimal API but completely predictable behavior, so it is possible to implement logging, hot reloading, time travel, universal apps, record and replay, without any buy-in from the developer.

### Influences

Redux evolves the ideas of [Flux](http://facebook.github.io/flux/), but avoids its complexity by taking cues from [Elm](https://github.com/evancz/elm-architecture-tutorial/).  
Whether you have used them or not, Redux only takes a few minutes to get started with.

### Installation

To install the stable version:

```
npm install --save redux
```

Most likely, you’ll also need [the React bindings](https://github.com/rackt/react-redux) and [the developer tools](https://github.com/gaearon/redux-devtools).

```
npm install --save react-redux
npm install --save-dev redux-devtools
```

This assumes that you’re using [npm](https://www.npmjs.com/) package manager with a module bundler like [Webpack](http://webpack.github.io) or [Browserify](http://browserify.org/) to consume [CommonJS modules](http://webpack.github.io/docs/commonjs.html).

If you don’t yet use [npm](https://www.npmjs.com/) or a modern module bundler, and would rather prefer a single-file [UMD](https://github.com/umdjs/umd) build that makes `Redux` available as a global object, you can grab a pre-built version from [cdnjs](https://cdnjs.com/libraries/redux). We *don’t* recommend this approach for any serious application, as most of the libraries complementary to Redux are only available on [npm](https://www.npmjs.com/).

### The Gist

The whole state of your app is stored in an object tree inside a single *store*.  
The only way to change the state tree is to emit an *action*, an object describing what happened.  
To specify how the actions transform the state tree, you write pure *reducers*.

That’s it!

```js
import { createStore } from 'redux'

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
    return state + 1
  case 'DECREMENT':
    return state - 1
  default:
    return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
let store = createStore(counter)

// You can subscribe to the updates manually, or use bindings to your view layer.
store.subscribe(() =>
  console.log(store.getState())
)

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
store.dispatch({ type: 'INCREMENT' })
// 1
store.dispatch({ type: 'INCREMENT' })
// 2
store.dispatch({ type: 'DECREMENT' })
// 1
```

Instead of mutating the state directly, you specify the mutations you want to happen with plain objects called *actions*. Then you write a special function called a *reducer* to decide how every action transforms the entire application’s state.

If you’re coming from Flux, there is a single important difference you need to understand. Redux doesn’t have a Dispatcher or support many stores. Instead, there is just a single store with a single root reducing function. As your app grows, instead of adding stores, you split the root reducer into smaller reducers independently operating on the different parts of the state tree. This is exactly like there is just one root component in a React app, but it is composed out of many small components.

This architecture might seem like an overkill for a counter app, but the beauty of this pattern is how well it scales to large and complex apps. It also enables very powerful developer tools, because it is possible to trace every mutation to the action that caused it. You can record user sessions and reproduce them just by replaying every action.

### Learn Redux from Its Creator

[Getting Started with Redux](https://egghead.io/series/getting-started-with-redux) is a video course consisting of 30 videos narrated by Dan Abramov, author of Redux. It is designed to complement the “Basics” part of the docs while bringing additional insights about immutability, testing, Redux best practices, and using Redux with React. **This course is free and will always be.**

>[“Great course on egghead.io by @dan_abramov - instead of just showing you how to use #redux, it also shows how and why redux was built!”](https://twitter.com/sandrinodm/status/670548531422326785)  
>Sandrino Di Mattia

>[“Plowing through @dan_abramov 'Getting Started with Redux' - its amazing how much simpler concepts get with video.”](https://twitter.com/chrisdhanaraj/status/670328025553219584)  
>Chris Dhanaraj

>[“This video series on Redux by @dan_abramov on @eggheadio is spectacular!”](https://twitter.com/eddiezane/status/670333133242408960)  
>Eddie Zaneski

>[“Come for the name hype. Stay for the rock solid fundamentals. (Thanks, and great job @dan_abramov and @eggheadio!)”](https://twitter.com/danott/status/669909126554607617)  
>Dan

>[“This series of videos on Redux by @dan_abramov is repeatedly blowing my mind - gunna do some serious refactoring”](https://twitter.com/gelatindesign/status/669658358643892224)  
>Laurence Roberts

So, what are you waiting for?

#### [Watch the 30 Free Videos!](https://egghead.io/series/getting-started-with-redux)

If you enjoyed my course, consider supporting Egghead by [buying a subscription](https://egghead.io/pricing). Subscribers have access to the source code for the example in every one of my videos, as well as to tons of advanced lessons on other topics, including JavaScript in depth, React, Angular, and more. Many [Egghead instructors](https://egghead.io/instructors) are also open source library authors, so buying a subscription is a nice way to thank them for the work that they’ve done.

### Documentation

* [Introduction](http://rackt.github.io/redux/docs/introduction/index.html)
* [Basics](http://rackt.github.io/redux/docs/basics/index.html)
* [Advanced](http://rackt.github.io/redux/docs/advanced/index.html)
* [Recipes](http://rackt.github.io/redux/docs/recipes/index.html)
* [Troubleshooting](http://rackt.github.io/redux/docs/Troubleshooting.html)
* [Glossary](http://rackt.github.io/redux/docs/Glossary.html)
* [API Reference](http://rackt.github.io/redux/docs/api/index.html)

For PDF, ePub, and MOBI exports for offline reading, and instructions on how to create them, please see: [paulkogel/redux-offline-docs](https://github.com/paulkogel/redux-offline-docs).

### Examples

* [Counter Vanilla](http://rackt.github.io/redux/docs/introduction/Examples.html#counter-vanilla) ([source](https://github.com/rackt/redux/tree/master/examples/counter-vanilla))
* [Counter](http://rackt.github.io/redux/docs/introduction/Examples.html#counter) ([source](https://github.com/rackt/redux/tree/master/examples/counter))
* [Todos](http://rackt.github.io/redux/docs/introduction/Examples.html#todos) ([source](https://github.com/rackt/redux/tree/master/examples/todos))
* [Todos with Undo](http://rackt.github.io/redux/docs/introduction/Examples.html#todos-with-undo) ([source](https://github.com/rackt/redux/tree/master/examples/todos-with-undo))
* [TodoMVC](http://rackt.github.io/redux/docs/introduction/Examples.html#todomvc) ([source](https://github.com/rackt/redux/tree/master/examples/todomvc))
* [Shopping Cart](http://rackt.github.io/redux/docs/introduction/Examples.html#shopping-cart) ([source](https://github.com/rackt/redux/tree/master/examples/shopping-cart))
* [Tree View](http://rackt.github.io/redux/docs/introduction/Examples.html#tree-view) ([source](https://github.com/rackt/redux/tree/master/examples/tree-view))
* [Async](http://rackt.github.io/redux/docs/introduction/Examples.html#async) ([source](https://github.com/rackt/redux/tree/master/examples/async))
* [Universal](http://rackt.github.io/redux/docs/introduction/Examples.html#universal) ([source](https://github.com/rackt/redux/tree/master/examples/universal))
* [Real World](http://rackt.github.io/redux/docs/introduction/Examples.html#real-world) ([source](https://github.com/rackt/redux/tree/master/examples/real-world))

If you’re new to the NPM ecosystem and have troubles getting a project up and running, or aren’t sure where to paste the gist above, check out [simplest-redux-example](https://github.com/jackielii/simplest-redux-example) that uses Redux together with React and Browserify.

### Discussion

Join the [#redux](https://discord.gg/0ZcbPKXt5bZ6au5t) channel of the [Reactiflux](http://www.reactiflux.com) Discord community.

### Thanks

* [The Elm Architecture](https://github.com/evancz/elm-architecture-tutorial) for a great intro to modeling state updates with reducers;
* [Turning the database inside-out](http://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/) for blowing my mind;
* [Developing ClojureScript with Figwheel](https://www.youtube.com/watch?v=j-kj2qwJa_E) for convincing me that re-evaluation should “just work”;
* [Webpack](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack) for Hot Module Replacement;
* [Flummox](https://github.com/acdlite/flummox) for teaching me to approach Flux without boilerplate or singletons;
* [disto](https://github.com/threepointone/disto) for a proof of concept of hot reloadable Stores;
* [NuclearJS](https://github.com/optimizely/nuclear-js) for proving this architecture can be performant;
* [Om](https://github.com/omcljs/om) for popularizing the idea of a single state atom;
* [Cycle](https://github.com/cyclejs/cycle-core) for showing how often a function is the best tool;
* [React](https://github.com/facebook/react) for the pragmatic innovation.

Special thanks to [Jamie Paton](http://jdpaton.github.io) for handing over the `redux` NPM package name.

### Change Log

This project adheres to [Semantic Versioning](http://semver.org/).  
Every release, along with the migration instructions, is documented on the Github [Releases](https://github.com/rackt/redux/releases) page.

### Patrons

The work on Redux was [funded by the community](https://www.patreon.com/reactdx).  
Meet some of the outstanding companies that made it possible:

* [Webflow](https://github.com/webflow)
* [Ximedes](https://www.ximedes.com/)

[See the full list of Redux patrons.](PATRONS.md)

### License

MIT
