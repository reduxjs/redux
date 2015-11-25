# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions.

For an extensive list of everything related to Redux, we recommend [Awesome Redux](https://github.com/xgrommx/awesome-redux). It contains examples, boilerplates, middleware, utility libraries, and more.

On this page we will only feature a few of them that the Redux maintainers have vetted personally. Don’t let this discourage you from trying the rest of them! The ecosystem is growing too fast, and we have a limited time to look at everything. Consider these the “staff picks”, and don’t hesitate to submit a PR if you’ve built something wonderful with Redux.

## Learning Redux

### Screencasts

* **[Getting Started with Redux](https://egghead.io/series/getting-started-with-redux)** — Learn the basics of Redux directly from its creator (30 free videos)

### Example Apps

* [SoundRedux](https://github.com/andrewngu/sound-redux) — A SoundCloud client built with Redux
* [Shopping Cart (Flux Comparison)](https://github.com/voronianski/flux-comparison/tree/master/redux) — A shopping cart example from Flux Comparison

### Tutorials and Articles

* [Redux Tutorial](https://github.com/happypoulp/redux-tutorial) — Learn how to use Redux step by step
* [What the Flux?! Let’s Redux.](https://blog.andyet.com/2015/08/06/what-the-flux-lets-redux) — An intro to Redux
* [A cartoon intro to Redux](https://code-cartoons.com/a-cartoon-intro-to-redux-3afb775501a6) — A visual explanation of Redux data flow
* [Understanding Redux](http://www.youhavetolearncomputers.com/blog/2015/9/15/a-conceptual-overview-of-redux-or-how-i-fell-in-love-with-a-javascript-state-container) — Learn the basic concepts of Redux
* [Handcrafting an Isomorphic Redux Application (With Love)](https://medium.com/@bananaoomarang/handcrafting-an-isomorphic-redux-application-with-love-40ada4468af4) — A guide to creating a universal app with data fetching and routing
* [Full-Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html) — A comprehensive guide to test-first development with Redux, React, and Immutable
* [Understanding Redux Middleware](https://medium.com/@meagle/understanding-87566abcfb7a#.l033pyr02) — In-depth guide to implementing Redux middleware
* [A Simple Way to Route with Redux](http://jlongster.com/A-Simple-Way-to-Route-with-Redux) — An introduction to Redux Simple Router

### Talks

* [Live React: Hot Reloading and Time Travel](http://youtube.com/watch?v=xsSnOQynTHs) — See how constraints enforced by Redux make hot reloading with time travel easy
* [Cleaning the Tar: Using React within the Firefox Developer Tools](https://www.youtube.com/watch?v=qUlRpybs7_c) — Learn how to gradually migrate existing MVC applications to Redux

## Using Redux

### Bindings

* [react-redux](https://github.com/gaearon/react-redux) — React
* [ng-redux](https://github.com/wbuchwalter/ng-redux) — Angular
* [ng2-redux](https://github.com/wbuchwalter/ng2-redux) — Angular 2
* [backbone-redux](https://github.com/redbooth/backbone-redux) — Backbone
* [redux-falcor](https://github.com/ekosz/redux-falcor) — Falcor
* [deku-redux](https://github.com/troch/deku-redux) — Deku

### Middleware

* [redux-thunk](http://github.com/gaearon/redux-thunk) — The easiest way to write async action creators
* [redux-promise](https://github.com/acdlite/redux-promise) — [FSA](https://github.com/acdlite/flux-standard-action)-compliant promise middleware
* [redux-rx](https://github.com/acdlite/redux-rx) — RxJS utilities for Redux, including a middleware for Observable
* [redux-logger](https://github.com/fcomb/redux-logger) — Log every Redux action and the next state
* [redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant) — Warns about state mutations in development
* [redux-analytics](https://github.com/markdalgleish/redux-analytics) — Analytics middleware for Redux
* [redux-gen](https://github.com/weo-edu/redux-gen) — Generator middleware for Redux

### Routing

* [redux-router](https://github.com/rackt/redux-router) — Redux bindings for React Router
* [redux-simple-router](https://github.com/jlongster/redux-simple-router) — Ruthlessly simple bindings to keep React Router and Redux in sync

### Components

* [redux-form](https://github.com/erikras/redux-form) — Keep React form state in Redux

### Store Enhancers

* [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) — Customize batching and debouncing calls to the store subscribers
* [redux-history-transitions](https://github.com/johanneslumpe/redux-history-transitions) — History transitions based on arbitrary actions

### Reducer Enhancers

* [redux-optimist](https://github.com/ForbesLindesay/redux-optimist) — Optimistically apply actions that can be later committed or reverted
* [redux-undo](https://github.com/omnidan/redux-undo) — Effortless undo/redo and action history for your reducers
* [redux-ignore](https://github.com/omnidan/redux-ignore) — Ignore redux actions by array or filter function
* [redux-recycle](https://github.com/omnidan/redux-recycle) — Reset the redux state on certain actions
* [redux-batched-actions](https://github.com/tshelburne/redux-batched-actions) — Dispatch several actions with a single subscriber notification

### Utilities

* [reselect](https://github.com/faassen/reselect) — Efficient derived data selectors inspired by NuclearJS
* [normalizr](https://github.com/gaearon/normalizr) — Normalize nested API responses for easier consumption by the reducers
* [redux-actions](https://github.com/acdlite/redux-actions) — Reduces the boilerplate in writing reducers and action creators
* [redux-act](https://github.com/pauldijou/redux-act) — An opinionated library for making reducers and action creators 
* [redux-transducers](https://github.com/acdlite/redux-transducers) — Transducer utilities for Redux
* [redux-immutablejs](https://github.com/indexiatech/redux-immutablejs) — Integration tools between Redux and [Immutable](https://github.com/facebook/immutable-js/)
* [redux-tcomb](https://github.com/gcanti/redux-tcomb) — Immutable and type-checked state and actions for Redux
* [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store) - Mock redux store for testing your app

### Developer Tools

* [redux-devtools](http://github.com/gaearon/redux-devtools) — An action logger with time travel UI, hot reloading and error handling for the reducers, [first demoed at React Europe](https://www.youtube.com/watch?v=xsSnOQynTHs)

### Community Conventions

* [Flux Standard Action](https://github.com/acdlite/flux-standard-action) — A human-friendly standard for Flux action objects
* [Canonical Reducer Composition](https://github.com/gajus/canonical-reducer-composition) — An opinionated standard for nested reducer composition
* [Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux) — A proposal for bundling reducers, action types and actions

## More

[Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.
