# Change log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [3.0.0](https://github.com/rackt/redux/compare/v2.0.0...v3.0.0) - 2015/09/13

### Breaking Changes

* Action objects now must have a `type` property other than `undefined` ([#541](https://github.com/rackt/redux/issues/541), [#564](https://github.com/rackt/redux/pull/564))

### Other Changes

* `replaceReducer()` is un-deprecated.

## [2.0.0](https://github.com/rackt/redux/compare/v1.0.1...v2.0.0) - 2015/09/01

### Breaking Changes

* Removes `getReducer()` from the Store public API ([#668](https://github.com/rackt/redux/issues/668))
* Fixes `compose()` to act like a normal `compose()` ([#669](https://github.com/rackt/redux/issues/669))
* Relies on `process.env.NODE_ENV` being polyfilled ([#671](https://github.com/rackt/redux/issues/671))

## [1.0.1](https://github.com/rackt/redux/compare/v1.0.0...v1.0.1) - 2015/08/15

* Fixes “process is not defined” on React Native ([#525](https://github.com/rackt/redux/issues/525), [#526](https://github.com/rackt/redux/pull/526))
* Removes dependencies on `invariant` and `warning` ([#528](https://github.com/rackt/redux/pull/528))
* Fixes TodoMVC example ([#524](https://github.com/rackt/redux/issues/524), [#529](https://github.com/rackt/redux/pull/529))

## [1.0.0](https://github.com/rackt/redux/compare/v1.0.0-rc...v1.0.0) - 2015/08/14

### Breaking Changes

* If `dispatch` is attempted while reducer is executing, an error is thrown. Note that you can dispatch from lifecycle hooks just fine. It's only reducers that are not allowed to dispatch. (https://github.com/rackt/redux/issues/368) 

### New Home

We moved under [rackt](https://github.com/rackt) Github org. This won't affect you, but the new official URL is https://github.com/rackt/redux. We did this because we share values, and we want to collaborate on creating better tools, libraries, documentation, and examples. Redux stays independent of React, but we will work closely with React Router community to figure out a better integration.

### Docs!

[We have real docs now.](http://rackt.github.io/redux/) There are a few missing pieces, but it's a terrific effort, so thanks to everybody who contributed in the past month to get this shipped. Thanks to [Gitbook](https://github.com/GitbookIO/gitbook) for providing great tooling, too.

### Examples!

There's been no shortage of great examples in [Awesome Redux](https://github.com/xgrommx/awesome-redux), but we're shipping two new built-in examples in 1.0. One of them is a [very simple async application](https://github.com/rackt/redux/tree/master/examples/async). Creating it is covered in [async tutorial](http://rackt.github.io/redux/docs/advanced/AsyncActions.html). Another example we ship is a [“real-world” example](https://github.com/rackt/redux/tree/master/examples/real-world). It's a port of somewhat well-known [flux-react-router-example](https://github.com/gaearon/flux-react-router-example) to Redux, and shows advanced techniques such as caching, data normalization, custom API middleware, and pagination. Hopefully this example will help answer some commonly asked questions.

### Other Improvements

* Unsubscribing during a dispatch is now fixed: https://github.com/rackt/redux/pull/462
* `bindActionCreators` now can also accept a function as the first argument: https://github.com/rackt/redux/pull/352
* Dispatching from iframe now works: https://github.com/rackt/redux/issues/304
* Symbols can be used as action types: https://github.com/rackt/redux/pull/295 (Note: we don't recommend you to do this, because they're not serializable, so you can't record/replay user sessions.)

## [1.0.0-rc](https://github.com/rackt/redux/compare/v1.0.0-alpha...v1.0.0-rc) - 2015/07/13

### Big Changes

* React-specific code has been moved to [react-redux](https://github.com/rackt/react-redux) and will be versioned separately
* `createStore` no longer implicitly combines reducers
* All middleware is now “smart” middleware 
* `createStore` no longer accepts middleware
* The thunk middleware is no longer included by default

### Correctness Changes

* `combineReducers` now throws if you return `undefined` state
* `combineReducers` throws if you have no `default` case
* (React) Components now update correctly in response to the actions fired in `componentDidMount` 
* Dispatch from the middleware sends the dispatch through the whole middleware chain

**Read the [detailed upgrade notes on the release page.](https://github.com/rackt/redux/releases/tag/v1.0.0-rc)**

## [1.0.0-alpha](https://github.com/rackt/redux/compare/v0.12.0...v1.0.0-alpha) - 2015/06/30

### Naming

* “Stateless Stores” are now called reducers. (https://github.com/rackt/redux/issues/137#issuecomment-114178411)
* The “Redux instance” is now called “The Store”. (https://github.com/rackt/redux/issues/137#issuecomment-113252359)
* The dispatcher is removed completely. (https://github.com/rackt/redux/pull/166#issue-90113962)

### API changes

* <s>`composeStores`</s> is now `composeReducers`.
* <s>`createDispatcher`</s> is gone.
* <s>`createRedux`</s> is now `createStore`.
* `<Provider>` now accepts `store` prop instead of <s>`redux`</s>.
* The new `createStore` signature is `createStore(reducer: Function | Object, initialState: any, middlewares: Array | ({ getState, dispatch }) => Array)`.
* If the first argument to `createStore` is an object, `composeReducers` is automatically applied to it.
* The “smart” middleware signature changed. It now accepts an object instead of a single `getState` function. The `dispatch` function lets you “recurse” the middleware chain and is useful for async: #113 (comment).

### Correctness changes

* The `dispatch` provided by the default thunk middleware now walks the whole middleware chain.
* It is enforced now that raw Actions at the end of the middleware chain have to be plain objects.
* Nested dispatches are now handled gracefully. (#110, #119)

### Internal changes

* The object in React context is renamed from <s>`redux`</s> to `store`.
* Some tests are rewritten for clarity, focus and edge cases.
* Redux in examples is now aliased to the source code for easier work on master.

**Read the [detailed upgrade notes on the release page.](https://github.com/rackt/redux/releases/tag/v1.0.0-alpha)**

## [0.12.0] - 2015/06/19
No breaking changes this time.

* Classes returned by decorators now expose a static `DecoratedComponent` property for easier testing
* Dependencies on `lodash` and `babel-runtime` are dropped
* Now compatible with Babel loose mode
* `composeStore` now ignores non-function values (useful in Babel loose mode)
* A UMD build is added
* The initial action dispatched to the stores now has a built-in `@@INIT` type (might be useful to devtools)

## [0.11.1] - 2015/06/16
* Bugfix: when `Connector` `select` property changes, the state did not recalculate (#107)

## [0.11.0] - 2015/06/14
* Renames `compose` root export to `composeMiddleware` to clarify the intent
* Fixes a bug with `getState` returning stale state after a hot reload (#90)

## [0.10.1] - 2015/06/13
Missing from the 0.10 release notes: **React Native is now supported!**
(And that's actually a breaking change.) 

Now, to import React-specific parts (containers or decorators), you need to either import from `redux/react` or `redux/react-native`:

```js
// Import utilities and functions from redux
import { createRedux, bindActionCreators } from 'redux';

// Import components and decorators from redux/react
import { provide, Connector } from 'redux/react';

// React Native: Import components and decorators from redux/react-native
import { provide, Connector } from 'redux/react-native';
```

0.10 release also had a problem with ES6 code inside `redux/react` and `redux/react-native` entry points, which is now fixed. Please upgrade if you had problems with 0.10.

Changes introduced in 0.10.1:

* `Connector` now throws if `select` returns something other than a plain object (https://github.com/rackt/redux/pull/85)
* The custom dispatcher API is tweaked so `setState` now returns the state that was actually set. This makes custom dispatchers more composable. (https://github.com/rackt/redux/pull/77)

Happy reducing!

## [0.10.0] - 2015/06/13
### Middleware

Redux 1.0 is within striking distance! Can you believe how quickly Redux has matured? @rackt made the first commit only [14 days ago](https://github.com/rackt/redux/commit/8bc14659780c044baac1432845fe1e4ca5123a8d).

The 0.10 release is a follow-up to 0.9, with a focus on what we're calling (at least for now) **middleware**.

You can read all about middleware [here](https://github.com/rackt/redux/blob/master/docs/middleware.md). We plan to release some official middleware soon, but of course we'd also love to see middleware created by the community.

### Breaking changes

Just a small one: Redux includes a feature that enables you to return a function from an action creator to perform asynchronous dispatches. The function receives a callback and `getState()` as parameters. This has behavior has been re-implemented as middleware and moved into a separate module called [`thunkMiddleware()`](https://github.com/rackt/redux/blob/master/src/middleware/thunk.js). It is included automatically when using the `createRedux(stores)` shortcut, but not when using `createDispatcher()`.

### Tests

We have tests! Still need to improve coverage in a few areas, but we're currently at ~93%. Not bad! Big thanks to @emmenko for setting these up.

## [0.9.0] - 2015/06/09
### Internal Refactoring & Custom Dispatchers

This release brings breaking changes necessary to start experimenting with middleware and extensibility (#6, #55). It does *not* bring any support for middleware *per se*, but it untangles “Dispatcher” (a function that tells how actions turn into state updates) from “Redux” (an instance holding the current state and managing subscriptions). It is now possible to specify your own Dispatcher if you want to experiment with ideas like middleware, time travel, action creators returning Promises or Observables, etc.

* `createDispatcher` now returns a function you need to give to `createRedux`
* `createRedux` is the primary API you'll use for initialization
* Instead of `dispatcher` prop, a `dispatch` function prop is injected by the `<Connector>` and `@connect`
* Instead of `dispatcher` prop, `<Provider>` and `@provide` accept a `redux` prop
* Instead of `dispatcher.getAtom()`, use `redux.getState()`
* Instead of `dispatcher.setAtom()`, you may pass a second `initialState` argument to `createRedux`
* Instead of `dispatcher.perfrorm()` or `dispatcher.dispatch()`, use `redux.dispatch()`
* `bindActions` is renamed to `bindActionCreators` and accepts `dispatch` as the second parameter
* You may skip `composeStores` and `createDispatcher` completely and just use `createRedux(stores)` as a shortcut

### How It Looks Like Now

#### Initialization

##### Short Way

This is a shortcut for the most common use case.

```js
import { createRedux, Provider } from 'redux';
import * as stores from '../stores/index';

const redux = createRedux(stores);

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

###### Long Way

This way of writing lets you use compose Stores differently, or even pass a custom Dispatcher function. Its signature is `(initialState, setState) => (action) => ()`.

```js
import { createRedux, createDispatcher, composeStores } from 'redux';
import * as stores from '../stores/index';

// Compose all your Stores into a single Store function with `composeStores`:
const store = composeStores(stores);

// Create a default Dispatcher function for your composite Store:
const dispatcher = createDispatcher(store); // You may use your custom function here

// Create a Redux instance using the dispatcher function:
const redux = createRedux(dispatcher);

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

### Hydration and dehydration

```js
// server
const redux = createRedux(stores);
redux.dispatch(MyActionCreators.doSomething()); // fire action creators to fill the state
const state = redux.getState(); // somehow pass this state to the client

// client
const initialState = window.STATE_FROM_SERVER;
const redux = createRedux(stores, initialState);
```

### Binding actions

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
    return (
      <Counter counter={counter}
               {...bindActionCreators(CounterActions, dispatch)} />
    );
  }
}
```

## [0.8.1] - 2015/06/06
* `hydrate()` and `dehydrate()` are gone, welcome `getAtom()` and `setAtom()` instead
* `initialize()` and `dispose()` are added for advanced use cases
* changing `select` function now updates the `Connector` state
* the bug with action creators accepting `dispatch` instead of `perform` is fixed

## [0.8.0] - 2015/06/06
### The Big Rewrite!

This release wouldn't have happened without [this @acdlite's wonderful gist](https://gist.github.com/acdlite/9f1b5883d132ad242323).

New:

* Now there is just one top Store, *but* you may compose your Stores using `composeStores` higher-order Store (seriously.)
* Dispatcher is now part of the public API and offers (de)hydration for isomorphic apps.
* Fine-grained subscriptions via the new `<Connector select={fn}>` prop
* Less surprising, more consistent API

Read the discussion: https://github.com/rackt/redux/pull/46

## [0.7.0] - 2015/06/06
* Change second parameter in callback-style action creator from `state` to `read: (Store) => state` (#44)
* Rename: `Container -> Injector, @container -> @inject, Root -> Dispatcher, @root -> @dispatch` (#20)

## [0.6.2] - 2015/06/04
* `@container`'s second parameter now also accepts the `props` passed to it (#36)
* `<Container />` and `<Root />` invoke their `this.props.children` functions without `this.props` context

## [0.6.1] - 2015/06/04
* Fix incorrect ES6 Map usage (#35)

## [0.6.0] - 2015/06/04
* Breaking change: `stores` now accepts an object, just like `actions`
* Breaking change: `Container` children function signature is now `({ actions, state }) => ...`
* More fine-grained `Container` props validation

This fixes #22. There is no more prop shape difference between subscribing to a single or to many stores.
Your container may now look like this:

```js
<Container stores={{ counter: stores.counterStore }}
           actions={{ increment, decrement }}>
  {({ state, actions }) => <Counter {...state} {...actions} />}
</Container>
```

Note that you can change the `state` shape by giving arbitrary keys to your stores. It's also easier to choose what exactly you want to pass to the component. For example, you could write `actions={actions}` instead of `{...actions}`, and get all actions in `this.props.actions`.

The decorator version is changed the same way:

```js
@container({
  actions: { increment, decrement },
  stores: { counter: counterStore }
})
export default class Counter {
```

It also now accepts a second `transformProps` argument to be just as expressive as the component version:

```js
@container({
  actions: { increment, decrement },
  stores: { counter: counterStore }
}, ({ actions, state}) => { ...actions, ...state })) // default shape; you can write your own
```

## [0.5.1] - 2015/06/03
* Fix the remaining dependency on the function name (#16)
* Add a few early invariants

## [0.5.0] - 2015/06/03
* Store function names are no longer significant, but you have to pass an object with all your Stores to the `root` (or `Root`). Fixes https://github.com/rackt/redux/issues/16

```js
import { root } from 'redux';
import * as stores from './stores/index';

@root(stores)
export default class TodoApp {
```

```js
import { root } from 'redux';
import * as stores from './stores/index';

export default class TodoApp {
  render() {
    return (
      <Root stores={stores}>
```

## [0.4.0] - 2015/06/03
* Bring decorators back, now on top of the lower-level container components (https://github.com/rackt/redux/pull/15, thanks Florent)
* Require `stores` passed to `Container` to be an array
* Fix build on Windows (https://github.com/rackt/redux/pull/11, thanks Mike)
* Reduce context footprint (https://github.com/rackt/redux/pull/12, thanks Florent again!)

## [0.3.1] - 2015/06/03
* Remove old files from build

## [0.3.0] - 2015/06/03
Complete rewrite.

* **No more strings,** now using module bindings for injecting stores and actions
* Only use decorator for top-level component, keep dumb components pure and testable (https://github.com/rackt/redux/issues/5)
* Remove transaction logic (will be re-implemented on top of https://github.com/rackt/redux/issues/6)

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
    // stores can be a single store or an array.
    // actions can only be a string -> function map.
    // props passed to children will combine these actions and state.
    return (
      <Container stores={counterStore}
                 actions={{ increment, decrement }}>
        {props => <Counter {...props} />}
      </Container>
    );
  }
}
```

Minor caveat: Store function names are now significant.

## [0.2.2] - 2015/06/02
* Pass `state` as a second argument to callback-style action creators

## [0.2.1] - 2015/06/02
* Fix `@provides` not passing its props down

## 0.2.0 - 2015/06/02
* Initial public release.
  See examples in [README](https://github.com/rackt/redux/blob/master/README.md) and the
  [examples](https://github.com/rackt/redux/tree/master/examples) folder.
  Alpha quality :-)

[unreleased]: https://github.com/rackt/redux/compare/v0.12.0...HEAD
[0.12.0]: https://github.com/rackt/redux/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/rackt/redux/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/rackt/redux/compare/v0.10.1...v0.11.0
[0.10.1]: https://github.com/rackt/redux/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/rackt/redux/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/rackt/redux/compare/v0.8.1...v0.9.0
[0.8.1]: https://github.com/rackt/redux/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/rackt/redux/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/rackt/redux/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/rackt/redux/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/rackt/redux/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/rackt/redux/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/rackt/redux/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/rackt/redux/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/rackt/redux/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/rackt/redux/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/rackt/redux/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/rackt/redux/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/rackt/redux/compare/v0.2.0...v0.2.1
