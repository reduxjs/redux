redux
=========================

An experiment in fully hot-reloadable Flux.  
The API might change any day. Don't use in production.

## Why another Flux framework?

Read **[The Evolution of Flux Frameworks](https://medium.com/@dan_abramov/the-evolution-of-flux-frameworks-6c16ad26bb31)** for some context.

### Design Goals

* Hot reloading of everything.
* A hook for the future devtools to "commit" a state, and replay actions on top of it during hot reload.
* No `createAction`, `createStores`, `wrapThisStuff`. Your stuff is your stuff.
* I don't mind action constants. Seriously.
* Embrace decorators for React components.
* Keep Flux lingo. No cursors or observables in core.
* Have I mentioned hot reloading yet?

## Demo

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

function incremenent({ counter }) {
  return { counter: counter + 1 };
}

function decremenent({ counter }) {
  return { counter: counter - 1 };
}

// what's important is that Store is a pure function too
export default function CounterStore(state = initialState, action) {
  // that returns the new state when an action comes
  switch (action.type) {
  case INCREMENT_COUNTER:
    return incremenent(state, action);
  case DECREMENT_COUNTER:
    return decremenent(state, action);
  default:
    return state;
  }
}

// bonus: no special support needed for ImmutableJS,
// just return its objects as the state.
```

### Components

#### Observing a single Store

```js
// We're gonna need some decorators
import React from 'react';
import { observes } from 'redux';

// Gonna subscribe it
@observes('CounterStore')
export default class Counter {
  render() {
    const { counter } = this.props; // injected by @observes
    return (
      <p>
        Clicked: {counter} times
      </p>
    );
  }
}
```

#### Observing many Stores

```js
// We're gonna need some decorators
import React from 'react';
import { observes } from 'redux';

// With multiple stores, you might want to specify a prop mapper as last argument.
// You can also access `props` inside the prop mapper.
@observes('CounterStore', 'TodoStore', (state, props) => ({
  counter: state.CounterStore.counter,
  todos: state.TodoStore.todos
}))
export default class TodosWithCounter {
  /* ... */
}
```

#### Performing a single Action

```js
// We're gonna need some decorators
import React from 'react';
import { performs } from 'redux';

// Gonna inject it
@performs('increment')
export default class IncrementButton {
  render() {
    const { increment } = this.props; // injected by @performs
    return (
      <button onClick={increment}>+</button>
    );
  }
}
```

#### Performing many Actions

```js
// We're gonna need some decorators
import React from 'react';
import { performs } from 'redux';

// With multiple actions, you might want to specify a prop mapper as last argument.
// You can also access `props` inside the prop mapper.
@performs('increment', 'decrement', (actions, props) => ({
  increment: props.invert ? actions.decrement : actions.increment,
  decrement: props.invert ? actions.increment : actions.decrement
}))
export default class IncrementButton {
  /* .... */
}
```

### Dispatcher

#### Creating a hot-reloadable dispatcher

```js
import * as stores from './stores/index';
import * as actions from './actions/index';
import { createDispatcher } from 'redux';

// Prefer to use existing dispatcher
const dispatcher =
  module.hot && module.hot.data && module.hot.data.dispatcher ||
  createDispatcher();

// Pass (potentially hot-reloaded) stores and actions
dispatcher.receive(stores, actions);

// Store the dispatcher for the next hot reload
if (module.hot) {
  module.hot.dispose(data => {
    data.dispatcher = dispatcher;
  });
}

export default dispatcher;
```

#### Attaching the dispatcher to the root component

```js
import React from 'react';
import { provides } from 'redux';
import dispatcher from './dispatcher';

@provides(dispatcher)
export default class App {
  /* ... */
}
```
