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
* No `createAction`, `createStores`, `wrapThisStuff`. Your stuff is your stuff.
* I don't mind action constants. Seriously.
* Keep Flux lingo. No cursors or observables in core.
* Have I mentioned hot reloading yet?

## Demo

![gif](https://s3.amazonaws.com/f.cl.ly/items/2Z2D3U260d2A311k2B0z/Screen%20Recording%202015-06-03%20at%2003.22%20pm.gif)

```
git clone https://github.com/gaearon/redux.git redux
cd redux
npm install
npm start
```

## What's it look like?

### Actions

```js
// Still using constants...
import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';

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
// (wow, much functions, so injectable :doge:)
export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment());
    }, 1000);
  };
}

// Could also look into state in the callback form
export function incrementIfOdd() {
  return (dispatch, state) => {
    if (state.counterStore.counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}
```

### Stores
```js
// ... too, use constants
import {
  INCREMENT_COUNTER,
  DECREMENT_COUNTER
} from '../constants/ActionTypes';

// but you can write this part anyhow you like:

const initialState = { counter: 0 };

function increment({ counter }) {
  return { counter: counter + 1 };
}

function decrement({ counter }) {
  return { counter: counter - 1 };
}

// what's important is that Store is a pure function too
export default function counterStore(state = initialState, action) {
  // that returns the new state when an action comes
  switch (action.type) {
  case INCREMENT_COUNTER:
    return increment(state, action);
  case DECREMENT_COUNTER:
    return decrement(state, action);
  default:
    return state;
  }
  
  // BUT THAT'S A SWITCH STATEMENT!
  // Right. If you hate 'em, see the FAQ below.
}

// bonus: no special support needed for ImmutableJS,
// just return its objects as the state.
```

### Components

#### Dumb Components

```js
// The dumb component receives everything using props:
import React, { PropTypes } from 'react';

export default class Counter {
  static propTypes = {
    counter: PropTypes.number.isRequired,
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired
  };

  render() {
    const { counter } = this.props;
    return (
      <p>
        Clicked: {counter} times
      </p>
    );
  }
}
```

#### Smart Components

```js
// The smart component may inject actions
// and observe stores using <Container />:

import React, { Component } from 'react';
import { Root, Container } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import counterStore from './stores/counterStore';
import Counter from './Counter';

export default class CounterContainer {
  render() {
    // stores must be an array.
    // actions must be a string -> function map.
    // props passed to children will combine these actions and state.
    return (
      <Container stores={[counterStore]}
                 actions={{ increment, decrement }}>
        {props => <Counter {...props} />}
      </Container>
    );
  }
}
```

#### Decorators

Don't want to separate dumb and smart components just yet? Use the decorators!  
They work exactly the same as the container components, but are lowercase:

```js
import React, { PropTypes } from 'react';
import { increment, decrement } from './actions/CounterActions';
import { container } from 'redux';
import counterStore from './stores/counterStore';

@container({
  actions: { increment, decrement },
  stores: [counterStore]
})
export default class Counter {
  static propTypes = {
    increment: PropTypes.func.isRequired,
    decrement: PropTypes.func.isRequired,
    counter: PropTypes.number.isRequired
  };

  render() {
    return (
      <p>
        Clicked: {this.props.counter} times
        {' '}
        <button onClick={() => this.props.increment()}>+</button>
        {' '}
        <button onClick={() => this.props.decrement()}>-</button>
      </p>
    );
  }
}
```

#### The root component

```js
import React from 'react';
import { root } from 'redux';
import * from './stores/index';

// Let it know about all the stores
@root(stores)
export default class App {
  /* ... */
}
```

## FAQ

### How does hot reloading work?

* http://webpack.github.io/docs/hot-module-replacement.html
* http://gaearon.github.io/react-hot-loader/
* Literally that's it. Redux is fully driven by component props, so it works on top of React Hot Loader.

### Can I use this in production?

I wouldn't. Many use cases are not be considered yet. If you find some use cases this lib can't handle yet, please file an issue.

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
export default createStore(initialState, {
  [INCREMENT_COUNTER]: increment,
  [DECREMENT_COUNTER]: decrement
});
```

It's all just functions.
Fancy stuff like generating stores from handler maps, or generating action creator constants, should be in userland.
Redux has no opinion on how you do this in your project.
