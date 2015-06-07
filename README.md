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

## What's it look like?

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
  return perform => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `perform`
      perform(increment());
    }, 1000);
  };
}


// Could also read state of a store in the callback form
export function incrementIfOdd() {
  return (perform, { counter }) => {
    if (counter % 2 === 0) {
      return;
    }

    perform(increment());
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
// and bind actions to the dispatcher with `bindActions`.

import React from 'react';
import { Connector, bindActions } from 'redux';
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
        {({ counter, dispatcher }) =>
          /* Yes this is child as a function. */
          <Counter counter={counter}
                   {...bindActions(CounterActions, dispatcher)} />
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
import { connect, bindActions } from 'redux';
import Counter from '../components/Counter';
import * as CounterActions from '../actions/CounterActions';

@connect(state => ({
  counter: state.counter
}))
export default class CounterApp {
  render() {
    const { counter, dispatcher } = this.props;
    return (
      <Counter counter={counter}
               {...bindActions(CounterActions, dispatcher)} />
    );
  }
}
```

#### The root component

Decorate your top-level component with `@provider(dispatcher)` (or `<Provider dispatcher={dispatcher}>` inside) to bind it to a Redux dispatcher instance.

Redux dispatcher accepts a single Store as an argument. Usually Flux apps have many Stores, so Redux provides a `composeStore` method that turns an object with Store functions as values (such as what you'd get from `import * as stores`) into a Store that [composes](https://gist.github.com/gaearon/d77ca812015c0356654f) them.

Think `composeStores` is a “higher-order” Store because it creates a Store from several Stores. (You don't have to use it! You can just pass your own top-level Store function if that's what you prefer.)

```js
import React from 'react';
import { createDispatcher, Provider, composeStores } from 'redux';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import * as stores from '../stores/index';

const dispatcher = createDispatcher(composeStores(stores));

export default class App {
  render() {
    return (
      <Provider dispatcher={dispatcher}>
        {() =>
          /* Yep, function as a child. */
          <div>
            <CounterApp />
            <TodoApp />
          </div>
        }
      </Provider>
    );
  }
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
