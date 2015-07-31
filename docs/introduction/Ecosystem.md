# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions.

For an extensive list of everything related to Redux, we recommend [Awesome Redux](https://github.com/xgrommx/awesome-redux). It contains examples, boilerplates, middleware, utility libraries, and more.

On this page we will only feature a few of them that the Redux maintainers have vetted personally. Don’t let this discourage you from trying the rest of them! The ecosystem is growing too fast, and we have a limited time to look at everything. Consider these the “staff picks”, and don’t hesitate a PR if you’ve built something wonderful with Redux.

## Examples

Redux ships with a counter and a TodoMVC example in the [`examples` folder](https://github.com/gaearon/redux/tree/master/examples) in the source.
We will have some official examples with data fetching, universal rendering and hot reloading soon, but for now, you can check out some examples from [Awesome Redux](https://github.com/xgrommx/awesome-redux).

## Bindings

* [react-redux](https://github.com/gaearon/react-redux) — React
* [ng-redux](https://github.com/wbuchwalter/ng-redux) — Angular

## Middleware

* [redux-thunk](http://github.com/gaearon/redux-thunk) — The easiest way to write async action creators
* [redux-promise](https://github.com/acdlite/redux-promise) — [FSA](https://github.com/acdlite/flux-standard-action)-compliant promise middleware
* [redux-rx](https://github.com/acdlite/redux-rx) — RxJS utilities for Redux, including a middleware for Observable
* [redux-batched-updates](https://github.com/acdlite/redux-batched-updates) — Batch React updates that occur as a result of Redux dispatches

## Utilities

* [reselect](https://github.com/faassen/reselect) — Efficient derived data selectors inspired by NuclearJS
* [redux-actions](https://github.com/acdlite/redux-actions) — Reduces the boilerplate in writing reducers and action creators
* [redux-transducers](https://github.com/acdlite/redux-transducers) — Transducer utilities for Redux

## Developer Tools

* [redux-devtools](http://github.com/gaearon/redux-devtools) — An action logger with time travel UI, hot reloading and error handling for the reducers, [first demoed at React Europe](https://www.youtube.com/watch?v=xsSnOQynTHs)
