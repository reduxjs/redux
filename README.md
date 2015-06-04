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

<img src='https://s3.amazonaws.com/f.cl.ly/items/2Z2D3U260d2A311k2B0z/Screen%20Recording%202015-06-03%20at%2003.22%20pm.gif' width='500'>

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
    if (state.counterStore % 2 === 0) {
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

// what's important is that Store is a pure function,
// and you can write it anyhow you like.

// the Store signature is (state, action) => state,
// and the state shape is up to you: you can use primitives,
// objects, arrays, or even ImmutableJS objects.

export default function counterStore(counter = 0, action) {
  // this function returns the new state when an action comes
  switch (action.type) {
  case INCREMENT_COUNTER:
    return counter + 1;
  case DECREMENT_COUNTER:
    return counter - 1;
  default:
    return counter;
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
        &nbsp;
        <button onClick={increment}>+</button>
        &nbsp;
        <button onClick={decrement}>-</button>
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
    // stores and actions must both be string -> function maps.
    // props passed to children will combine these actions and state.
    return (
      <Container stores={{ counter: stores.counterStore }}
                 actions={{ increment, decrement }}>
        {/* Yes this is a function as a child. Bear with me. */}
        {({ state, actions }) => <Counter {...state} {...actions} />}
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
  stores: { counter: counterStore }
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
import * as stores from './stores/index';

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
export default createStore(0, {
  [INCREMENT_COUNTER]: x => x + 1,
  [DECREMENT_COUNTER]: x => x - 1
});
```

It's all just functions.
Fancy stuff like generating stores from handler maps, or generating action creator constants, should be in userland.
Redux has no opinion on how you do this in your project.

### What about `waitFor`?

I wrote a lot of vanilla Flux code, and my only use case for it was avoiding emitting a change before a related Store consumes the action. In Redux this doesn't matter because the change is only emitted after *all* Stores have consumed the action.

If several of your Stores want to read data from each other and depend on each other, it's a sign they should've been a single Store instead. [See this discussion on how `waitFor` can be replaced by the composition of stateless Stores.](https://gist.github.com/gaearon/d77ca812015c0356654f)
