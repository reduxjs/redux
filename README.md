# <a href='https://redux.js.org'><img src='https://camo.githubusercontent.com/f28b5bc7822f1b7bb28a96d8d09e7d79169248fc/687474703a2f2f692e696d6775722e636f6d2f4a65567164514d2e706e67' height='60' alt='Redux Logo' aria-label='redux.js.org' /></a>

Redux is a predictable state container for JavaScript apps.
(Not to be confused with a WordPress framework – [Redux Framework](https://redux.io))

It helps you write applications that behave consistently, run in different environments (client, server, and native), and are easy to test. On top of that, it provides a great developer experience, such as [live code editing combined with a time traveling debugger](https://github.com/reduxjs/redux-devtools).

You can use Redux together with [React](https://reactjs.org), or with any other view library.
It is tiny (2kB, including dependencies), and has a rich ecosystem of addons.

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/reduxjs/redux/Tests/master?style=flat-square)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![npm downloads](https://img.shields.io/npm/dm/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on discord](https://img.shields.io/badge/discord-%23redux%20%40%20reactiflux-61dafb.svg?style=flat-square)](https://discord.gg/0ZcbPKXt5bZ6au5t)
[![Changelog #187](https://img.shields.io/badge/changelog-%23187-lightgrey.svg?style=flat-square)](https://changelog.com/187)

## Installation

[**Redux Toolkit**](https://redux-toolkit.js.org) is our official recommended approach for writing Redux logic. It wraps around the Redux core, and contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

```
npm install @reduxjs/toolkit react-redux
```

For the Redux core library by itself:

```
npm install redux
```

For more details, see [the Installation docs page](https://redux.js.org/introduction/installation).

## Documentation

The Redux docs are located at **https://redux.js.org**:

- [Introduction](https://redux.js.org/introduction/getting-started)
- [Tutorials](https://redux.js.org/tutorials/index)
- [Usage Guides](https://redux.js.org/usage/index)
- [FAQ](https://redux.js.org/faq)
- [API Reference](https://redux.js.org/api/api-reference)

## Learn Redux

### Redux Essentials Tutorial

The [**Redux Essentials tutorial**](https://redux.js.org/tutorials/essentials/part-1-overview-concepts) is a "top-down" tutorial that teaches "how to use Redux the right way", using our latest recommended APIs and best practices. We recommend starting there.

### Redux Fundamentals Tutorial

The [**Redux Fundamentals tutorial**](https://redux.js.org/tutorials/fundamentals/part-1-overview) is a "bottom-up" tutorial that teaches "how Redux works" from first principles and without any abstractions, and why standard Redux usage patterns exist.

### Additional Tutorials

- The Redux repository contains several example projects demonstrating various aspects of how to use Redux. Almost all examples have a corresponding CodeSandbox sandbox. This is an interactive version of the code that you can play with online. See the complete list of examples in the **[Examples page](https://redux.js.org/introduction/examples)**.
- Redux creator Dan Abramov's **free ["Getting Started with Redux" video series](https://app.egghead.io/playlists/fundamentals-of-redux-course-from-dan-abramov-bd5cc867)** and **[Building React Applications with Idiomatic Redux](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)** video courses on Egghead.io
- Redux maintainer Mark Erikson's **["Redux Fundamentals" conference talk](https://blog.isquaredsoftware.com/2018/03/presentation-reactathon-redux-fundamentals/)** and [**"Redux Fundamentals" workshop slides**](https://blog.isquaredsoftware.com/2018/06/redux-fundamentals-workshop-slides/)
- Dave Ceddia's post [**A Complete React Redux Tutorial for Beginners**](https://daveceddia.com/redux-tutorial/)

### Other Resources

- The **[Redux FAQ](https://redux.js.org/faq)** answers many common questions about how to use Redux, and the **["Using Redux" docs section](https://redux.js.org/usage/index)** has information on handling derived data, testing, structuring reducer logic, and reducing boilerplate.
- Redux maintainer Mark Erikson's **["Practical Redux" tutorial series](https://blog.isquaredsoftware.com/series/practical-redux/)** demonstrates real-world intermediate and advanced techniques for working with React and Redux (also available as **[an interactive course on Educative.io](https://www.educative.io/collection/5687753853370368/5707702298738688)**).
- The **[React/Redux links list](https://github.com/markerikson/react-redux-links)** has categorized articles on working with [reducers and selectors](https://github.com/markerikson/react-redux-links/blob/master/redux-reducers-selectors.md), [managing side effects](https://github.com/markerikson/react-redux-links/blob/master/redux-side-effects.md), [Redux architecture and best practices](https://github.com/markerikson/react-redux-links/blob/master/redux-architecture.md), and more.
- Our community has created thousands of Redux-related libraries, addons, and tools. The **["Ecosystem" docs page](https://redux.js.org/introduction/ecosystem)** lists our recommendations, and also there's a complete listing available in the **[Redux addons catalog](https://github.com/markerikson/redux-ecosystem-links)**.

### Help and Discussion

The **[#redux channel](https://discord.gg/0ZcbPKXt5bZ6au5t)** of the **[Reactiflux Discord community](https://www.reactiflux.com)** is our official resource for all questions related to learning and using Redux. Reactiflux is a great place to hang out, ask questions, and learn - please come and join us there!

## Before Proceeding Further

Redux is a valuable tool for organizing your state, but you should also consider whether it's appropriate for your situation. Please don't use Redux just because someone said you should - instead, please take some time to understand the potential benefits and tradeoffs of using it.

Here are some suggestions on when it makes sense to use Redux:

- You have reasonable amounts of data changing over time
- You need a single source of truth for your state
- You find that keeping all your state in a top-level component is no longer sufficient

Yes, these guidelines are subjective and vague, but this is for a good reason. The point at which you should integrate Redux into your application is different for every user and different for every application.

> **For more thoughts on how Redux is meant to be used, please see:**<br>
>
> - **[When (and when not) to reach for Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
> - **[You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**<br>
> - **[The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**<br>
> - **[The Tao of Redux, Part 2 - Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)**
> - **[Redux FAQ](https://redux.js.org/faq)**

## Developer Experience

Dan Abramov (author of Redux) wrote Redux while working on his React Europe talk called [“Hot Reloading with Time Travel”](https://www.youtube.com/watch?v=xsSnOQynTHs). His goal was to create a state management library with a minimal API but completely predictable behavior. Redux makes it possible to implement logging, hot reloading, time travel, universal apps, record and replay, without any buy-in from the developer.

## Influences

Redux evolves the ideas of [Flux](https://facebook.github.io/flux/), but avoids its complexity by taking cues from [Elm](https://github.com/evancz/elm-architecture-tutorial/).
Even if you haven't used Flux or Elm, Redux only takes a few minutes to get started with.

## Basic Example

The whole global state of your app is stored in an object tree inside a single _store_.
The only way to change the state tree is to create an _action_, an object describing what happened, and _dispatch_ it to the store.
To specify how state gets updated in response to an action, you write pure _reducer_ functions that calculate a new state based on the old state and the action.

```js
import { createStore } from 'redux'

/**
 * This is a reducer - a function that takes a current state value and an
 * action object describing "what happened", and returns a new state value.
 * A reducer's function signature is: (state, action) => newState
 *
 * The Redux state should contain only plain JS objects, arrays, and primitives.
 * The root state value is usually an object.  It's important that you should
 * not mutate the state object, but return a new object if the state changes.
 *
 * You can use any conditional logic you want in a reducer. In this example,
 * we use a switch statement, but it's not required.
 */
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
let store = createStore(counterReducer)

// You can use subscribe() to update the UI in response to state changes.
// Normally you'd use a view binding library (e.g. React Redux) rather than subscribe() directly.
// There may be additional use cases where it's helpful to subscribe as well.

store.subscribe(() => console.log(store.getState()))

// The only way to mutate the internal state is to dispatch an action.
// The actions can be serialized, logged or stored and later replayed.
store.dispatch({ type: 'counter/incremented' })
// {value: 1}
store.dispatch({ type: 'counter/incremented' })
// {value: 2}
store.dispatch({ type: 'counter/decremented' })
// {value: 1}
```

Instead of mutating the state directly, you specify the mutations you want to happen with plain objects called _actions_. Then you write a special function called a _reducer_ to decide how every action transforms the entire application's state.

In a typical Redux app, there is just a single store with a single root reducing function. As your app grows, you split the root reducer into smaller reducers independently operating on the different parts of the state tree. This is exactly like how there is just one root component in a React app, but it is composed out of many small components.

This architecture might seem like a lot for a counter app, but the beauty of this pattern is how well it scales to large and complex apps. It also enables very powerful developer tools, because it is possible to trace every mutation to the action that caused it. You can record user sessions and reproduce them just by replaying every action.

### Redux Toolkit Example

Redux Toolkit simplifies the process of writing Redux logic and setting up the store. With Redux Toolkit, that same logic looks like:

```js
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    incremented: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

// Can still subscribe to the store
store.subscribe(() => console.log(store.getState()))

// Still pass action objects to `dispatch`, but they're created for us
store.dispatch(incremented())
// {value: 1}
store.dispatch(incremented())
// {value: 2}
store.dispatch(decremented())
// {value: 1}
```

Redux Toolkit allows us to write shorter logic that's easier to read, while still following the same Redux behavior and data flow.

## Examples

Almost all examples have a corresponding CodeSandbox sandbox. This is an interactive version of the code that you can play with online.

- [**Counter Vanilla**](https://redux.js.org/introduction/examples#counter-vanilla): [Source](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla)
- [**Counter**](https://redux.js.org/introduction/examples#counter): [Source](https://github.com/reduxjs/redux/tree/master/examples/counter) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter)
- [**Todos**](https://redux.js.org/introduction/examples#todos): [Source](https://github.com/reduxjs/redux/tree/master/examples/todos) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos)
- [**Todos with Undo**](https://redux.js.org/introduction/examples#todos-with-undo): [Source](https://github.com/reduxjs/redux/tree/master/examples/todos-with-undo) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos-with-undo)
- [**TodoMVC**](https://redux.js.org/introduction/examples#todomvc): [Source](https://github.com/reduxjs/redux/tree/master/examples/todomvc) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todomvc)
- [**Shopping Cart**](https://redux.js.org/introduction/examples#shopping-cart): [Source](https://github.com/reduxjs/redux/tree/master/examples/shopping-cart) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/shopping-cart)
- [**Tree View**](https://redux.js.org/introduction/examples#tree-view): [Source](https://github.com/reduxjs/redux/tree/master/examples/tree-view) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/tree-view)
- [**Async**](https://redux.js.org/introduction/examples#async): [Source](https://github.com/reduxjs/redux/tree/master/examples/async) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/async)
- [**Universal**](https://redux.js.org/introduction/examples#universal): [Source](https://github.com/reduxjs/redux/tree/master/examples/universal)
- [**Real World**](https://redux.js.org/introduction/examples#real-world): [Source](https://github.com/reduxjs/redux/tree/master/examples/real-world) | [Sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/real-world)

## Testimonials

> [“Love what you're doing with Redux”](https://twitter.com/jingc/status/616608251463909376)
> Jing Chen, creator of Flux

> [“I asked for comments on Redux in FB's internal JS discussion group, and it was universally praised. Really awesome work.”](https://twitter.com/fisherwebdev/status/616286955693682688)
> Bill Fisher, author of Flux documentation

> [“It's cool that you are inventing a better Flux by not doing Flux at all.”](https://twitter.com/andrestaltz/status/616271392930201604)
> André Staltz, creator of Cycle

## Thanks

- [The Elm Architecture](https://github.com/evancz/elm-architecture-tutorial) for a great intro to modeling state updates with reducers;
- [Turning the database inside-out](https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/) for blowing my mind;
- [Developing ClojureScript with Figwheel](https://www.youtube.com/watch?v=j-kj2qwJa_E) for convincing me that re-evaluation should “just work”;
- [Webpack](https://webpack.js.org/concepts/hot-module-replacement/) for Hot Module Replacement;
- [Flummox](https://github.com/acdlite/flummox) for teaching me to approach Flux without boilerplate or singletons;
- [disto](https://github.com/threepointone/disto) for a proof of concept of hot reloadable Stores;
- [NuclearJS](https://github.com/optimizely/nuclear-js) for proving this architecture can be performant;
- [Om](https://github.com/omcljs/om) for popularizing the idea of a single state atom;
- [Cycle](https://github.com/cyclejs/cycle-core) for showing how often a function is the best tool;
- [React](https://github.com/facebook/react) for the pragmatic innovation.

Special thanks to [Jamie Paton](https://jdpaton.github.io) for handing over the `redux` NPM package name.

## Logo

You can find the official logo [on GitHub](https://github.com/reduxjs/redux/tree/master/logo).

## Change Log

This project adheres to [Semantic Versioning](https://semver.org/).
Every release, along with the migration instructions, is documented on the GitHub [Releases](https://github.com/reduxjs/redux/releases) page.

## Patrons

The work on Redux was [funded by the community](https://www.patreon.com/reactdx).
Meet some of the outstanding companies that made it possible:

- [Webflow](https://github.com/webflow)
- [Ximedes](https://www.ximedes.com/)

[See the full list of Redux patrons](PATRONS.md), as well as the always-growing list of [people and companies that use Redux](https://github.com/reduxjs/redux/issues/310).

## License

[MIT](LICENSE.md)
