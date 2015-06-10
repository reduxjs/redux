redux
=========================

An experiment in fully hot-reloadable Flux.  

**The API might change any day.**  
_**Don't use in production.**_

## Why another Flux framework?

Read **[The Evolution of Flux Frameworks](https://medium.com/@dan_abramov/the-evolution-of-flux-frameworks-6c16ad26bb31)** for some context.

### Design Goals

* Hot reloading of everything.
* A hook for the future devtools to "commit" a state, and replay actions on top of it during hot reload.
* No wrapper calls in your stores and actions. Your stuff is your stuff.
* Super easy to test things in isolation without mocks.
* I don't mind action constants. Seriously.
* Keep Flux lingo. No cursors or observables in core.
* Have I mentioned hot reloading yet?

## Demo

<img src='https://s3.amazonaws.com/f.cl.ly/items/2Z2D3U260d2A311k2B0z/Screen%20Recording%202015-06-03%20at%2003.22%20pm.gif' width='500'>

```
git clone https://github.com/gaearon/redux.git redux
cd redux
npm install
npm start
```

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
  return (dispatch, { counter }) => {
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
import { Connector, bindActionCreators } from 'redux';
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
import { connect, bindActionCreators } from 'redux';
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

#### Initializing Redux

The simplest way to initialize a Redux instance is to give it an object whose values are your Store functions, and whose keys are their names. You may `import *` from the file with all your Store definitions to obtain such an object:

```js
import { createRedux, Provider } from 'redux';
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

#### Running the same code on client and server

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

#### Additional customization

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
import * as stores from '../stores/index';

// Compose all your Stores into a single Store function with `composeStores`:
const store = composeStores(stores);

// Create a Dispatcher function for your composite Store:
const dispatcher = createDispatcher(store);

// Create a Redux instance using the dispatcher function:
const redux = createRedux(dispatcher);
```

Why would you want to write it longer? Maybe you're an advanced user and want to provide a custom Dispatcher function, or maybe you have a different idea of how to compose your Stores (or you're satisfied with a single Store). Redux lets you do all of this.

When in doubt, use the shorter option!

## FAQ

### How does hot reloading work?

* http://webpack.github.io/docs/hot-module-replacement.html
* http://gaearon.github.io/react-hot-loader/
* Literally that's it. Redux is fully driven by component props, so it works on top of React Hot Loader.

### Can I use this in production?

I wouldn't. Many use cases haven't been considered yet. If you find some use cases this lib can't handle yet, please file an issue.

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
