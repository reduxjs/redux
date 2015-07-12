redux
=========================

[![build status](https://img.shields.io/travis/gaearon/redux/master.svg?style=flat-square)](https://travis-ci.org/gaearon/redux)
[![npm version](https://img.shields.io/npm/v/redux.svg?style=flat-square)](https://www.npmjs.com/package/redux)
[![redux channel on slack](https://img.shields.io/badge/slack-redux@reactiflux-61DAFB.svg?style=flat-square)](http://www.reactiflux.com)

Atomic Flux with hot reloading.

**The API is likely to change a few times before we reach 1.0.**<br>
**Its [surface area](http://www.youtube.com/watch?v=4anAwXYqLG8) is minimal so you can try it in production and report any issues.**

**You can track the [new docs](https://github.com/gaearon/redux/pull/140) and the [1.0 API and terminology changes](https://github.com/gaearon/redux/pull/195).**


# Table of Contents

- [Why another Flux framework?](#why-another-flux-framework)
  - [Philosophy & Design Goals](#philosophy--design-goals)
- [The Talk](#the-talk)
- [Demo](#demo)
- [Examples](#examples)
  - [Simple Examples](#simple-examples)
  - [ES5 Examples](#es5-examples)
  - [Async and Universal Examples with Routing](#async-and-universal-examples-with-routing)
- [What does it look like?](#what-does-it-look-like)
  - [Actions](#actions)
  - [Stores](#stores)
  - [Components](#components)
    - [Dumb Components](#dumb-components)
    - [Smart Components](#smart-components)
    - [Decorators](#decorators)
  - [React Native](#react-native)
  - [Initializing Redux](#initializing-redux)
  - [Running the same code on client and server](#running-the-same-code-on-client-and-server)
  - [Additional customization](#additional-customization)
- [FAQ](#faq)
  - [How does hot reloading work?](#how-does-hot-reloading-work)
  - [Can I use this in production?](#can-i-use-this-in-production)
  - [How do I do async?](#how-do-i-do-async)
  - [But there are switch statements!](#but-there-are-switch-statements)
  - [What about `waitFor`?](#what-about-waitfor)
  - [My views aren't updating!](#my-views-arent-updating)
  - [How do Stores, Actions and Components interact?](#how-do-stores-actions-and-components-interact)
- [Discussion](#discussion)
- [Inspiration and Thanks](#inspiration-and-thanks)

## Why another Flux framework?

Read **[The Evolution of Flux Frameworks](https://medium.com/@dan_abramov/the-evolution-of-flux-frameworks-6c16ad26bb31)** for some context.

### Philosophy & Design Goals

* You shouldn't need a book on functional programming to use Redux.
* Everything (Stores, Action Creators, configuration) is hot reloadable.
* Preserves the benefits of Flux, but adds other nice properties thanks to its functional nature.
* Prevents some of the anti-patterns common in Flux code.
* Works great in [universal (aka “isomorphic”)](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) apps because it doesn't use singletons and the data can be rehydrated.
* Doesn't care how you store your data: you may use JS objects, arrays, ImmutableJS, etc.
* Under the hood, it keeps all your data in a tree, but you don't need to think about it.
* Lets you efficiently subscribe to finer-grained updates than individual Stores.
* Provides hooks for powerful devtools (e.g. time travel, record/replay) to be implementable without user buy-in.
* Provides extension points so it's easy to [support promises](https://github.com/gaearon/redux/issues/99#issuecomment-112212639) or [generate constants](https://gist.github.com/skevy/8a4ffc3cfdaf5fd68739) outside the core.
* No wrapper calls in your stores and actions. Your stuff is your stuff.
* It's super easy to test things in isolation without mocks.
* You can use “flat” Stores, or [compose and reuse Stores](https://gist.github.com/gaearon/d77ca812015c0356654f) just like you compose Components.
* The API surface area is minimal.
* Have I mentioned hot reloading yet?

## The Talk

Redux was demoed together with **[React Hot Loader](https://github.com/gaearon/react-hot-loader)** at React Europe.  
Watch **[Dan Abramov's talk on Hot Reloading with Time Travel](https://www.youtube.com/watch?v=xsSnOQynTHs).**

## Demo

<img src='https://s3.amazonaws.com/f.cl.ly/items/2Z2D3U260d2A311k2B0z/Screen%20Recording%202015-06-03%20at%2003.22%20pm.gif' width='500'>

## Examples

### Simple Examples

Redux is distributed with a Counter and a TodoMVC example in its source code.

First, clone the repo:

```
git clone https://github.com/gaearon/redux.git
cd redux
```

Run the Counter example:

```
cd redux/examples/counter
npm install
npm start
```

Run the TodoMVC example:

```
cd ../todomvc
npm install
npm start
```

### ES5 Examples

If you have not used ES6 before, check out one of these ES5 examples:

* [redux-todomvc-es5](https://github.com/insin/redux-todomvc-es5)

### Async and Universal Examples with Routing

These async and [universal (aka “isomorphic”)](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) examples using React Router should help you get started:

* [redux-react-router-async-example](https://github.com/emmenko/redux-react-router-async-example): Work in progress. Semi-official. Only the client side. Uses React Router.
* [react-redux-universal-hot-example](https://github.com/erikras/react-redux-universal-hot-example): Universal. Uses React Router.
* [redux-example](https://github.com/quangbuule/redux-example): Universal. Uses Immutable, React Router.
* [isomorphic-counter-example](https://github.com/khtdr/redux-react-koa-isomorphic-counter-example): Universal. A bare-bone implementation of the [counter example app](https://github.com/gaearon/redux/tree/master/examples/counter). Uses promises-middleware to interact with API via Koa on the server.
* [Awesome list](https://github.com/xgrommx/awesome-redux)

Don’t be shy, add your own!

## What does it look like?

### Actions

```js
// Still using constants...
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';

// But action creators are pure functions returning actions
export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}

// Can also be async if you return a function
export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}


// Could also read state of a store in the callback form
export function incrementIfOdd() {
  return (dispatch, getState) => {
    const { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}
```

### Stores
```js
// ... too, use constants
import { INCREMENT_COUNTER, DECREMENT_COUNTER } from '../constants/ActionTypes';

// what's important is that Store is a pure function,
// and you can write it anyhow you like.

// the Store signature is (state, action) => state,
// and the state shape is up to you: you can use primitives,
// objects, arrays, or even ImmutableJS objects.

export default function counter(state = 0, action) {
  // this function returns the new state when an action comes
  switch (action.type) {
  case INCREMENT_COUNTER:
    return state + 1;
  case DECREMENT_COUNTER:
    return state - 1;
  default:
    return state;
  }

  // BUT THAT'S A SWITCH STATEMENT!
  // Right. If you hate 'em, see the FAQ below.
}
```

### Components

#### Dumb Components

```js
// The dumb component receives everything using props:
import React, { PropTypes } from 'react';

export default class Counter {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.number.isRequired
  };

  render() {
    const { increment, decrement, counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
      </p>
    );
  }
}
```

#### Smart Components

```js
// The smart component may observe stores using `<Connector />`,
// and bind actions to the dispatcher with `bindActionCreators`.

import React from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'redux/react';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

// You can optionally specify `select` for finer-grained subscriptions
// and retrieval. Only when the return value is shallowly different,
// will the child component be updated.
function select(state) {
  return { counter: state.counter };
}

export default class CounterApp {
  render() {
    return (
      <Connector select={select}>
        {({ counter, dispatch }) =>
          /* Yes this is child as a function. */
          <Counter counter={counter}
                   {...bindActionCreators(CounterActions, dispatch)} />
        }
      </Connector>
    );
  }
}
```

#### Decorators

The `@connect` decorator lets you create smart components less verbosely:

```js
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'redux/react';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatch } = this.props;
    // Instead of `bindActionCreators`, you may also pass `dispatch` as a prop
    // to your component and call `dispatch(CounterActions.increment())`
    return (
      <Counter counter={counter}
               {...bindActionCreators(CounterActions, dispatch)} />
    );
  }
}
```

### React Native

To use Redux with React Native, just replace imports from `redux/react` with `redux/react-native`:

```js
import { bindActionCreators } from 'redux';
import { Provider, Connector } from 'redux/react-native';
```

### Initializing Redux

The simplest way to initialize a Redux instance is to give it an object whose values are your Store functions, and whose keys are their names. You may `import *` from the file with all your Store definitions to obtain such an object:

```js
import { createRedux } from 'redux';
import { Provider } from 'redux/react';
import * as stores from '../stores/index';

const redux = createRedux(stores);
```

Then pass `redux` as a prop to `<Provider>` component in the root component of your app, and you're all set:

```js
export default class App {
  render() {
    return (
      <Provider redux={redux}>
        {() =>
          <CounterApp />
        }
      </Provider>
    );
  }
}
```

### Running the same code on client and server

The `redux` instance returned by `createRedux` also has the `dispatch(action)`, `subscribe()` and `getState()` methods that you may call outside the React components.

You may optionally specify the initial state as the second argument to `createRedux`. This is useful for hydrating the state you received from running Redux on the server:

```js
// server
const redux = createRedux(stores);
redux.dispatch(MyActionCreators.doSomething()); // fire action creators to fill the state
const state = redux.getState(); // somehow pass this state to the client

// client
const initialState = window.STATE_FROM_SERVER;
const redux = createRedux(stores, initialState);
```

### Additional customization

There is also a longer way to do the same thing, if you need additional customization.

This:

```js
import { createRedux } from 'redux';
import * as stores from '../stores/index';

const redux = createRedux(stores);
```

is in fact a shortcut for this:

```js
import { createRedux, createDispatcher, composeStores } from 'redux';
import thunkMiddleware from 'redux/lib/middleware/thunk';
import * as stores from '../stores/index';

// Compose all your Stores into a single Store function with `composeStores`:
const store = composeStores(stores);

// Create a Dispatcher function for your composite Store:
const dispatcher = createDispatcher(
  store,
  getState => [thunkMiddleware(getState)] // Pass the default middleware
);

// Create a Redux instance using the dispatcher function:
const redux = createRedux(dispatcher);
```

Why would you want to write it longer? Maybe you're an advanced user and want to provide a custom Dispatcher function, or maybe you have a different idea of how to compose your Stores (or you're satisfied with a single Store). Redux lets you do all of this.

`createDispatcher()` also gives you the ability to specify middleware -- for example, to add support for promises. [Learn more](https://github.com/gaearon/redux/blob/master/docs/middleware.md) about how to create and use middleware in Redux.

When in doubt, use the shorter option!

## FAQ

### How does hot reloading work?

* http://webpack.github.io/docs/hot-module-replacement.html
* http://gaearon.github.io/react-hot-loader/
* Literally that's it. Redux is fully driven by component props, so it works on top of React Hot Loader.

### Can I use this in production?

Yep. People already do that although I warned them! The API surface is minimal so migrating to 1.0 API when it comes out won't be difficult. Let us know about any issues.

### How do I do async?

There's already a built-in way of doing async action creators:

```js
// Can also be async if you return a function
export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}
```

It's also easy to implement support for returning Promises or Observables with a custom middleware. [See an example of a custom Promise middleware.](https://github.com/gaearon/redux/issues/99#issuecomment-112212639)

### But there are switch statements!

`(state, action) => state` is as simple as a Store can get. You are free to implement your own `createStore`:

```js
export default function createStore(initialState, handlers) {
  return (state = initialState, action) =>
    handlers[action.type] ?
      handlers[action.type](state, action) :
      state;
}
```

and use it for your Stores:

```js
export default createStore(0, {
  [INCREMENT_COUNTER]: x => x + 1,
  [DECREMENT_COUNTER]: x => x - 1
});
```

It's all just functions.
Fancy stuff like generating stores from handler maps, or generating action creator constants, should be in userland.
Redux has no opinion on how you do this in your project.

See also [this gist](https://gist.github.com/skevy/8a4ffc3cfdaf5fd68739) for an example implementation of action constant generation.

### What about `waitFor`?

I wrote a lot of vanilla Flux code and my only use case for it was to avoid emitting a change before a related Store consumes the action. This doesn't matter in Redux because the change is only emitted after *all* Stores have consumed the action.

If several of your Stores want to read data from each other and depend on each other, it's a sign that they should've been a single Store instead. [See this discussion on how `waitFor` can be replaced by the composition of stateless Stores.](https://gist.github.com/gaearon/d77ca812015c0356654f)

### My views aren't updating!

Redux makes a hard assumption that you never mutate the state passed to you. It's easy! For example, instead of

```js
function (state, action) {
  state.isAuthenticated = true;
  state.email = action.email;
  return state;
}
```

you should write

```js
function (state, action) {
  return {
    ...state,
    isAuthenticated: true,
    email: action.email
  };
}
```

[Read more](https://github.com/sebmarkbage/ecmascript-rest-spread) about the spread properties ES7 proposal.

### How do Stores, Actions and Components interact?

Action creators are just pure functions so they don't interact with anything. Components need to call `dispatch(action)` (or use `bindActionCreators` that wraps it) to dispatch an action *returned* by the action creator.

Stores are just pure functions too so they don't need to be “registered” in the traditional sense, and you can't subscribe to them directly. They're just descriptions of how data transforms. So in that sense they don't “interact” with anything either, they just exist, and are used by the dispatcher for computation of the next state.

Now, the dispatcher is more interesting. You pass all the Stores to it, and it composes them into a single Store function that it uses for computation. The dispatcher is also a pure function, and it is passed as configuration to `createRedux`, the only stateful thing in Redux. By default, the default dispatcher is used, so if you call `createRedux(stores)`, it is created implicitly.

To sum it up: there is a Redux instance at the root of your app. It binds everything together. It accepts a dispatcher (which itself accepts Stores), it holds the state, and it knows how to turn actions into state updates. Everything else (components, for example) subscribes to the Redux instance. If something wants to dispatch an action, they need to do it on the Redux instance. `Connector` is a handy shortcut for subscribing to a slice of the Redux instance's state and injecting `dispatch` into your components, but you don't have to use it.

There is no other “interaction” in Redux.

## Discussion

Join the **#redux** channel of the [Reactiflux](http://reactiflux.com/) Slack community

## Inspiration and Thanks

* [Webpack](https://github.com/webpack/docs/wiki/hot-module-replacement-with-webpack) for Hot Module Replacement
* [The Elm Architecture](https://github.com/evancz/elm-architecture-tutorial) for a great intro to “stateless Stores”
* [Turning the database inside-out](http://blog.confluent.io/2015/03/04/turning-the-database-inside-out-with-apache-samza/) for blowing my mind
* [Developing ClojureScript with Figwheel](http://www.youtube.com/watch?v=j-kj2qwJa_E) for convincing me that re-evaluation should “just work”
* [Flummox](https://github.com/acdlite/flummox) for teaching me to approach Flux without boilerplate or singletons
* [disto](https://github.com/threepointone/disto) for a proof of concept of hot reloadable Stores
* [NuclearJS](https://github.com/optimizely/nuclear-js) for proving this architecture can be performant
* [Om](https://github.com/omcljs/om) for popularizing the idea of a single state atom
* [Cycle](https://github.com/staltz/cycle) for showing how often a function is the best tool
* [React](https://github.com/facebook/react) for the pragmatic innovation

Special thanks go to [Jamie Paton](http://jdpaton.github.io/) for handing over the `redux` NPM package name.
