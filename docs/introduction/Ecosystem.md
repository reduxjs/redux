# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions.

For an extensive list of everything related to Redux, we recommend [Awesome Redux](https://github.com/xgrommx/awesome-redux). It contains examples, boilerplates, middleware, utility libraries, and more. [React/Redux Links](https://github.com/markerikson/react-redux-links) contains tutorials and other useful resources for anyone learning React or Redux, and [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) lists many Redux-related libraries and addons.

On this page we will only feature a few of them that the Redux maintainers have vetted personally. Don’t let this discourage you from trying the rest of them! The ecosystem is growing too fast, and we have a limited time to look at everything. Consider these the “staff picks”, and don’t hesitate to submit a PR if you’ve built something wonderful with Redux.

## Learning Redux

### Screencasts

* **[Getting Started with Redux](https://egghead.io/series/getting-started-with-redux)** — Learn the basics of Redux directly from its creator (30 free videos)

### Example Apps

* [Official Examples](Examples.md) — A few official examples covering different Redux techniques
* [SoundRedux](https://github.com/andrewngu/sound-redux) — A SoundCloud client built with Redux [![GitHub stars](https://img.shields.io/github/stars/andrewngu/sound-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/andrewngu/sound-redux/stargazers)
* [grafgiti](https://github.com/mohebifar/grafgiti) — Create graffity on your GitHub contributions wall [![GitHub stars](https://img.shields.io/github/stars/mohebifar/grafgiti.svg?style=social&label=Star&maxAge=2592000)](https://github.com/mohebifar/grafgiti/stargazers)

### Tutorials and Articles

* [Redux Tutorial](https://github.com/happypoulp/redux-tutorial) — Learn how to use Redux step by step [![GitHub stars](https://img.shields.io/github/stars/happypoulp/redux-tutorial.svg?style=social&label=Star&maxAge=2592000)](https://github.com/happypoulp/redux-tutorial/stargazers)
* [Redux Egghead Course Notes](https://github.com/tayiorbeii/egghead.io_redux_course_notes) — Notes on the Redux [Egghead video course](https://egghead.io/series/getting-started-with-redux)
* [Integrating Data with React Native](http://makeitopen.com/tutorials/building-the-f8-app/data/) — An intro to using Redux with React Native
* [What the Flux?! Let’s Redux.](https://blog.andyet.com/2015/08/06/what-the-flux-lets-redux) — An intro to Redux
* [Leveling Up with React: Redux](https://css-tricks.com/learning-react-redux/) — Another great intro to Redux
* [A cartoon intro to Redux](https://code-cartoons.com/a-cartoon-intro-to-redux-3afb775501a6) — A visual explanation of Redux data flow
* [Understanding Redux](http://www.youhavetolearncomputers.com/blog/2015/9/15/a-conceptual-overview-of-redux-or-how-i-fell-in-love-with-a-javascript-state-container) — Learn the basic concepts of Redux
* [Handcrafting an Isomorphic Redux Application (With Love)](https://medium.com/@bananaoomarang/handcrafting-an-isomorphic-redux-application-with-love-40ada4468af4) — A guide to creating a universal app with data fetching and routing
* [Full-Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html) — A comprehensive guide to test-first development with Redux, React, and Immutable
* [Getting Started with React, Redux, and Immutable](http://www.theodo.fr/blog/2016/03/getting-started-with-react-redux-and-immutable-a-test-driven-tutorial-part-2/) — A test-driven intro to refactoring a React app to use Redux
* [Secure Your React and Redux App with JWT Authentication](https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/) — Learn how to add JWT authentication to your React and Redux app
* [Understanding Redux Middleware](https://medium.com/@meagle/understanding-87566abcfb7a#.l033pyr02) — In-depth guide to implementing Redux middleware
* [Angular 2 — Introduction to Redux](https://medium.com/google-developer-experts/angular-2-introduction-to-redux-1cf18af27e6e) — An introduction to Redux fundamental concepts with an example in Angular 2
* [Working with VK API (in Russian)](https://www.gitbook.com/book/maxfarseer/redux-course-ru/details) — A tutorial in Russian that demonstrates creating an app that consumes VK API

### Talks

* [Live React: Hot Reloading and Time Travel](http://youtube.com/watch?v=xsSnOQynTHs) — See how constraints enforced by Redux make hot reloading with time travel easy
* [Cleaning the Tar: Using React within the Firefox Developer Tools](https://www.youtube.com/watch?v=qUlRpybs7_c) — Learn how to gradually migrate existing MVC applications to Redux
* [Redux: Simplifying Application State](https://www.youtube.com/watch?v=okdC5gcD-dM) — An intro to Redux architecture

## Using Redux

### Bindings

* [react-redux](https://github.com/gaearon/react-redux) — React [![GitHub stars](https://img.shields.io/github/stars/gaearon/react-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gaearon/react-redux/stargazers)
* [ng-redux](https://github.com/wbuchwalter/ng-redux) — Angular [![GitHub stars](https://img.shields.io/github/stars/wbuchwalter/ng-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/wbuchwalter/ng-redux/stargazers)
* [ng2-redux](https://github.com/wbuchwalter/ng2-redux) — Angular 2 [![GitHub stars](https://img.shields.io/github/stars/wbuchwalter/ng2-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/wbuchwalter/ng2-redux/stargazers)
* [backbone-redux](https://github.com/redbooth/backbone-redux) — Backbone [![GitHub stars](https://img.shields.io/github/stars/redbooth/backbone-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/redbooth/backbone-redux/stargazers)
* [redux-falcor](https://github.com/ekosz/redux-falcor) — Falcor [![GitHub stars](https://img.shields.io/github/stars/ekosz/redux-falcor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/ekosz/redux-falcor/stargazers)
* [deku-redux](https://github.com/troch/deku-redux) — Deku [![GitHub stars](https://img.shields.io/github/stars/troch/deku-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/troch/deku-redux/stargazers)

### Middleware

* [redux-thunk](http://github.com/gaearon/redux-thunk) — The easiest way to write async action creators [![GitHub stars](https://img.shields.io/github/stars/gaearon/redux-thunk.svg?style=social&label=Star&maxAge=2592000)](http://github.com/gaearon/redux-thunk/stargazers)
* [redux-promise](https://github.com/acdlite/redux-promise) — [FSA](https://github.com/acdlite/flux-standard-action)-compliant promise middleware [![GitHub stars](https://img.shields.io/github/stars/acdlite/flux-standard-action.svg?style=social&label=Star&maxAge=2592000)](https://github.com/acdlite/redux-promise/stargazers)
* [redux-rx](https://github.com/acdlite/redux-rx) — RxJS utilities for Redux, including a middleware for Observable [![GitHub stars](https://img.shields.io/github/stars/acdlite/redux-rx.svg?style=social&label=Star&maxAge=2592000)](https://github.com/acdlite/redux-rx/stargazers)
* [redux-logger](https://github.com/fcomb/redux-logger) — Log every Redux action and the next state [![GitHub stars](https://img.shields.io/github/stars/fcomb/redux-logger.svg?style=social&label=Star&maxAge=2592000)](https://github.com/fcomb/redux-logger/stargazers)
* [redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant) — Warns about state mutations in development [![GitHub stars](https://img.shields.io/github/stars/leoasis/redux-immutable-state-invariant.svg?style=social&label=Star&maxAge=2592000)](https://github.com/leoasis/redux-immutable-state-invariant/stargazers)
* [redux-analytics](https://github.com/markdalgleish/redux-analytics) — Analytics middleware for Redux [![GitHub stars](https://img.shields.io/github/stars/markdalgleish/redux-analytics.svg?style=social&label=Star&maxAge=2592000)](https://github.com/markdalgleish/redux-analytics/stargazers)
* [redux-gen](https://github.com/weo-edu/redux-gen) — Generator middleware for Redux [![GitHub stars](https://img.shields.io/github/stars/weo-edu/redux-gen.svg?style=social&label=Star&maxAge=2592000)](https://github.com/weo-edu/redux-gen/stargazers)
* [redux-saga](https://github.com/yelouafi/redux-saga) — An alternative side effect model for Redux apps [![GitHub stars](https://img.shields.io/github/stars/yelouafi/redux-saga.svg?style=social&label=Star&maxAge=2592000)](https://github.com/yelouafi/redux-saga/stargazers)

### Routing

* [react-router-redux](https://github.com/reactjs/react-router-redux) — Ruthlessly simple bindings to keep React Router and Redux in sync [![GitHub stars](https://img.shields.io/github/stars/reactjs/react-router-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/reactjs/react-router-redux/stargazers)
* [redial](https://github.com/markdalgleish/redial) — Universal data fetching and route lifecycle management for React that works great with Redux [![GitHub stars](https://img.shields.io/github/stars/markdalgleish/redial.svg?style=social&label=Star&maxAge=2592000)](https://github.com/markdalgleish/redial/stargazers)

### Components

* [redux-form](https://github.com/erikras/redux-form) — Keep React form state in Redux [![GitHub stars](https://img.shields.io/github/stars/erikras/redux-form.svg?style=social&label=Star&maxAge=2592000)](https://github.com/erikras/redux-form/stargazers)
* [react-redux-form](https://github.com/davidkpiano/react-redux-form) — Create forms easily in React with Redux [![GitHub stars](https://img.shields.io/github/stars/davidkpiano/react-redux-form.svg?style=social&label=Star&maxAge=2592000)](https://github.com/davidkpiano/react-redux-form/stargazers)

### Enhancers

* [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) — Customize batching and debouncing calls to the store subscribers [![GitHub stars](https://img.shields.io/github/stars/tappleby/redux-batched-subscribe.svg?style=social&label=Star&maxAge=2592000)](https://github.com/tappleby/redux-batched-subscribe/stargazers)
* [redux-history-transitions](https://github.com/johanneslumpe/redux-history-transitions) — History transitions based on arbitrary actions [![GitHub stars](https://img.shields.io/github/stars/johanneslumpe/redux-history-transitions.svg?style=social&label=Star&maxAge=2592000)](https://github.com/johanneslumpe/redux-history-transitions/stargazers)
* [redux-optimist](https://github.com/ForbesLindesay/redux-optimist) — Optimistically apply actions that can be later committed or reverted [![GitHub stars](https://img.shields.io/github/stars/ForbesLindesay/redux-optimist.svg?style=social&label=Star&maxAge=2592000)](https://github.com/ForbesLindesay/redux-optimist/stargazers)
* [redux-undo](https://github.com/omnidan/redux-undo) — Effortless undo/redo and action history for your reducers [![GitHub stars](https://img.shields.io/github/stars/omnidan/redux-undo.svg?style=social&label=Star&maxAge=2592000)](https://github.com/omnidan/redux-undo/stargazers)
* [redux-ignore](https://github.com/omnidan/redux-ignore) — Ignore redux actions by array or filter function [![GitHub stars](https://img.shields.io/github/stars/omnidan/redux-ignore.svg?style=social&label=Star&maxAge=2592000)](https://github.com/omnidan/redux-ignore/stargazers)
* [redux-recycle](https://github.com/omnidan/redux-recycle) — Reset the redux state on certain actions [![GitHub stars](https://img.shields.io/github/stars/omnidan/redux-recycle.svg?style=social&label=Star&maxAge=2592000)](https://github.com/omnidan/redux-recycle/stargazers)
* [redux-batched-actions](https://github.com/tshelburne/redux-batched-actions) — Dispatch several actions with a single subscriber notification [![GitHub stars](https://img.shields.io/github/stars/tshelburne/redux-batched-actions.svg?style=social&label=Star&maxAge=2592000)](https://github.com/tshelburne/redux-batched-actions/stargazers)
* [redux-search](https://github.com/treasure-data/redux-search) — Automatically index resources in a web worker and search them without blocking [![GitHub stars](https://img.shields.io/github/stars/treasure-data/redux-search.svg?style=social&label=Star&maxAge=2592000)](https://github.com/treasure-data/redux-search/stargazers)
* [redux-electron-store](https://github.com/samiskin/redux-electron-store) — Store enhancers that synchronize Redux stores across Electron processes [![GitHub stars](https://img.shields.io/github/stars/samiskin/redux-electron-store.svg?style=social&label=Star&maxAge=2592000)](https://github.com/samiskin/redux-electron-store/stargazers)
* [redux-loop](https://github.com/raisemarketplace/redux-loop) — Sequence effects purely and naturally by returning them from your reducers [![GitHub stars](https://img.shields.io/github/stars/raisemarketplace/redux-loop.svg?style=social&label=Star&maxAge=2592000)](https://github.com/raisemarketplace/redux-loop/stargazers)
* [redux-side-effects](https://github.com/salsita/redux-side-effects) — Utilize Generators for declarative yielding of side effects from your pure reducers [![GitHub stars](https://img.shields.io/github/stars/salsita/redux-side-effects.svg?style=social&label=Star&maxAge=2592000)](https://github.com/salsita/redux-side-effects/stargazers)

### Utilities

* [reselect](https://github.com/faassen/reselect) — Efficient derived data selectors inspired by NuclearJS [![GitHub stars](https://img.shields.io/github/stars/faassen/reselect.svg?style=social&label=Star&maxAge=2592000)](https://github.com/faassen/reselect/stargazers)
* [normalizr](https://github.com/gaearon/normalizr) — Normalize nested API responses for easier consumption by the reducers [![GitHub stars](https://img.shields.io/github/stars/gaearon/normalizr.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gaearon/normalizr/stargazers)
* [redux-actions](https://github.com/acdlite/redux-actions) — Reduces the boilerplate in writing reducers and action creators [![GitHub stars](https://img.shields.io/github/stars/acdlite/redux-actions.svg?style=social&label=Star&maxAge=2592000)](https://github.com/acdlite/redux-actions/stargazers)
* [redux-act](https://github.com/pauldijou/redux-act) — An opinionated library for making reducers and action creators [![GitHub stars](https://img.shields.io/github/stars/pauldijou/redux-act.svg?style=social&label=Star&maxAge=2592000)](https://github.com/pauldijou/redux-act/stargazers)
* [redux-transducers](https://github.com/acdlite/redux-transducers) — Transducer utilities for Redux [![GitHub stars](https://img.shields.io/github/stars/acdlite/redux-transducers.svg?style=social&label=Star&maxAge=2592000)](https://github.com/acdlite/redux-transducers/stargazers)
* [redux-immutable](https://github.com/gajus/redux-immutable) — Used to create an equivalent function of Redux `combineReducers` that works with [Immutable.js](https://facebook.github.io/immutable-js/) state. [![GitHub stars](https://img.shields.io/github/stars/gajus/redux-immutable.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gajus/redux-immutable/stargazers) 
* [redux-tcomb](https://github.com/gcanti/redux-tcomb) — Immutable and type-checked state and actions for Redux [![GitHub stars](https://img.shields.io/github/stars/gcanti/redux-tcomb.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gcanti/redux-tcomb/stargazers)
* [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store) — Mock redux store for testing your app [![GitHub stars](https://img.shields.io/github/stars/arnaudbenard/redux-mock-store.svg?style=social&label=Star&maxAge=2592000)](https://github.com/arnaudbenard/redux-mock-store/stargazers)
* [redux-actions-assertions](https://github.com/dmitry-zaets/redux-actions-assertions) — Assertions for Redux actions testing [![GitHub stars](https://img.shields.io/github/stars/dmitry-zaets/redux-actions-assertions.svg?style=social&label=Star&maxAge=2592000)](https://github.com/dmitry-zaets/redux-actions-assertions/stargazers)

### DevTools

* [Redux DevTools](http://github.com/gaearon/redux-devtools) — An action logger with time travel UI, hot reloading and error handling for the reducers, [first demoed at React Europe](https://www.youtube.com/watch?v=xsSnOQynTHs) [![GitHub stars](https://img.shields.io/github/stars/gaearon/redux-devtools.svg?style=social&label=Star&maxAge=2592000)](http://github.com/gaearon/redux-devtools/stargazers)
* [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension) — A Chrome extension wrapping Redux DevTools and providing additional functionality [![GitHub stars](https://img.shields.io/github/stars/zalmoxisus/redux-devtools-extension.svg?style=social&label=Star&maxAge=2592000)](https://github.com/zalmoxisus/redux-devtools-extension/stargazers)

### DevTools Monitors

* [Log Monitor](https://github.com/gaearon/redux-devtools-log-monitor) — The default monitor for Redux DevTools with a tree view [![GitHub stars](https://img.shields.io/github/stars/gaearon/redux-devtools-log-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gaearon/redux-devtools-log-monitor/stargazers)
* [Dock Monitor](https://github.com/gaearon/redux-devtools-dock-monitor) — A resizable and movable dock for Redux DevTools monitors [![GitHub stars](https://img.shields.io/github/stars/gaearon/redux-devtools-dock-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gaearon/redux-devtools-dock-monitor/stargazers)
* [Slider Monitor](https://github.com/calesce/redux-slider-monitor) — A custom monitor for Redux DevTools to replay recorded Redux actions [![GitHub stars](https://img.shields.io/github/stars/calesce/redux-slider-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/calesce/redux-slider-monitor/stargazers)
* [Inspector](https://github.com/alexkuz/redux-devtools-inspector) — A custom monitor for Redux DevTools that lets you filter actions, inspect diffs, and pin deep paths in the state to observe their changes [![GitHub stars](https://img.shields.io/github/stars/alexkuz/redux-devtools-inspector.svg?style=social&label=Star&maxAge=2592000)](https://github.com/alexkuz/redux-devtools-inspector/stargazers)
* [Diff Monitor](https://github.com/whetstone/redux-devtools-diff-monitor) — A monitor for Redux Devtools that diffs the Redux store mutations between actions [![GitHub stars](https://img.shields.io/github/stars/whetstone/redux-devtools-diff-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/whetstone/redux-devtools-diff-monitor/stargazers)
* [Filterable Log Monitor](https://github.com/bvaughn/redux-devtools-filterable-log-monitor/) — Filterable tree view monitor for Redux DevTools [![GitHub stars](https://img.shields.io/github/stars/whetstone/redux-devtools-diff-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/bvaughn/redux-devtools-filterable-log-monitor/stargazers)
* [Chart Monitor](https://github.com/romseguy/redux-devtools-chart-monitor) — A chart monitor for Redux DevTools [![GitHub stars](https://img.shields.io/github/stars/romseguy/redux-devtools-chart-monitor.svg?style=social&label=Star&maxAge=2592000)](https://github.com/romseguy/redux-devtools-chart-monitor/stargazers)
* [Filter Actions](https://github.com/zalmoxisus/redux-devtools-filter-actions) — Redux DevTools composable monitor with the ability to filter actions [![GitHub stars](https://img.shields.io/github/stars/zalmoxisus/redux-devtools-filter-actions.svg?style=social&label=Star&maxAge=2592000)](https://github.com/zalmoxisus/redux-devtools-filter-actions/stargazers)


### Community Conventions

* [Flux Standard Action](https://github.com/acdlite/flux-standard-action) — A human-friendly standard for Flux action objects [![GitHub stars](https://img.shields.io/github/stars/acdlite/flux-standard-action.svg?style=social&label=Star&maxAge=2592000)](https://github.com/acdlite/flux-standard-action/stargazers)
* [Canonical Reducer Composition](https://github.com/gajus/canonical-reducer-composition) — An opinionated standard for nested reducer composition [![GitHub stars](https://img.shields.io/github/stars/gajus/canonical-reducer-composition.svg?style=social&label=Star&maxAge=2592000)](https://github.com/gajus/canonical-reducer-composition/stargazers)
* [Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux) — A proposal for bundling reducers, action types and actions [![GitHub stars](https://img.shields.io/github/stars/erikras/ducks-modular-redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/erikras/ducks-modular-redux/stargazers)

### Translations

* [中文文档](http://camsong.github.io/redux-in-chinese/) — Chinese
* [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese [![GitHub stars](https://img.shields.io/github/stars/chentsulin/redux.svg?style=social&label=Star&maxAge=2592000)](https://github.com/chentsulin/redux/stargazers)
* [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian [![GitHub stars](https://img.shields.io/github/stars/rajdee/redux-in-russian.svg?style=social&label=Star&maxAge=2592000)](https://github.com/rajdee/redux-in-russian/stargazers)
* [Redux en Español](http://es.redux.js.org/) - Spanish

## More

[Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.  
[React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES6, and more.  
[Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) is a categorized collection of Redux-related libraries, addons, and utilities.
