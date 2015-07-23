redux
=========================

[![build status](https://img.shields.io/travis/gaearon/redux/master.svg?style=flat-square)](https://travis-ci.org/gaearon/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)

Redux is an architecture for JavaScript applications with unidirectional data flow. It evolves the ideas of [Flux](https://facebook.github.io/flux), taking cues from [Elm](elm-lang.org/guide/architecture) and [Om](http://swannodette.github.io/2013/12/17/the-future-of-javascript-mvcs/) for a succinct approach based on functional composition.  

Redux works both for client-side, universal, and native apps. You can use Redux together with [React](https://facebook.github.io/react/) or any other view library. Redux is tiny (2kB) and has no dependencies, but its ecosystem takes the developer experience to the next level.  

## How It Works

Redux can be described in three fundamental principles:

* **The whole state of your app is stored in an object tree inside a single *store*.** This makes it easy to create universal apps. The state from the server can be serialized and hydrated into the client with no extra coding effort. You can also persist your app’s state in development for a faster development cycle. And of course, with a single state tree, you get the previously difficult functionality like Undo/Redo for free.

* **The only way to mutate the state is to emit an *action*, an object describing what happened.** This ensures that the views or the network callbacks never write directly to the state, and instead express the intent to mutate. Because all mutations are centralized and happen one by one in a strict order, there are no subtle race conditions to watch out for. Actions are just plain objects, so they can be logged, serialized, stored, and later replayed for debugging or testing purposes.

* **To specify how different parts of the state tree are transformed by the actions, you write pure *reducers*.** Reducers are just pure functions that take the previous state and the action, and return the next state. You can start with a single reducer, but as your app grows, you can split it into smaller reducers that manage the specific parts of the state tree. Because reducers are just functions, you can control the order in which they are called, pass additional data, or even make reusable reducers for common tasks such as pagination.
