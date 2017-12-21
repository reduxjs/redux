# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions.

For an extensive list of everything related to Redux, we recommend [Awesome Redux](https://github.com/xgrommx/awesome-redux). It contains examples, boilerplates, middleware, utility libraries, and more. [React/Redux Links](https://github.com/markerikson/react-redux-links) contains tutorials and other useful resources for anyone learning React or Redux, and [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) lists many Redux-related libraries and addons.

On this page we will only feature a few of them that the Redux maintainers have vetted personally. Don't let this discourage you from trying the rest of them! The ecosystem is growing too fast, and we have a limited time to look at everything. Consider these the “staff picks”, and don't hesitate to submit a PR if you've built something wonderful with Redux.

## Learning Redux

### Screencasts

* **[Getting Started with Redux](https://egghead.io/series/getting-started-with-redux)** — Learn the basics of Redux directly from its creator (30 free videos)
* **[Learn Redux](https://learnredux.com)** — Build a simple photo app that will simplify the core ideas behind Redux, React Router and React.js

### Example Apps

* [Official Examples](Examples.md) — A few official examples covering different Redux techniques
* [SoundRedux](https://github.com/andrewngu/sound-redux) — A SoundCloud client built with Redux
* [grafgiti](https://github.com/mohebifar/grafgiti) — Create graffiti on your GitHub contributions wall
* [React-lego](https://github.com/peter-mouland/react-lego) — How to plug into React, one block at a time.

### Tutorials and Articles

* [Redux Tutorial](https://github.com/happypoulp/redux-tutorial)
* [Redux Egghead Course Notes](https://github.com/tayiorbeii/egghead.io_redux_course_notes)
* [Integrating Data with React Native](http://makeitopen.com/docs/en/1-3-data.html)
* [What the Flux?! Let's Redux.](https://blog.andyet.com/2015/08/06/what-the-flux-lets-redux)
* [Leveling Up with React: Redux](https://css-tricks.com/learning-react-redux/)
* [A cartoon intro to Redux](https://code-cartoons.com/a-cartoon-intro-to-redux-3afb775501a6)
* [Understanding Redux](http://www.youhavetolearncomputers.com/blog/2015/9/15/a-conceptual-overview-of-redux-or-how-i-fell-in-love-with-a-javascript-state-container)
* [Handcrafting an Isomorphic Redux Application (With Love)](https://medium.com/@bananaoomarang/handcrafting-an-isomorphic-redux-application-with-love-40ada4468af4)
* [Full-Stack Redux Tutorial](http://teropa.info/blog/2015/09/10/full-stack-redux-tutorial.html)
* [Getting Started with React, Redux, and Immutable](http://www.theodo.fr/blog/2016/03/getting-started-with-react-redux-and-immutable-a-test-driven-tutorial-part-2/)
* [Secure Your React and Redux App with JWT Authentication](https://auth0.com/blog/2016/01/04/secure-your-react-and-redux-app-with-jwt-authentication/)
* [Understanding Redux Middleware](https://medium.com/@meagle/understanding-87566abcfb7a)
* [Angular 2 — Introduction to Redux](https://medium.com/google-developer-experts/angular-2-introduction-to-redux-1cf18af27e6e)
* [Apollo Client: GraphQL with React and Redux](https://medium.com/apollo-stack/apollo-client-graphql-with-react-and-redux-49b35d0f2641)
* [Using redux-saga To Simplify Your Growing React Native Codebase](https://shift.infinite.red/using-redux-saga-to-simplify-your-growing-react-native-codebase-2b8036f650de)
* [Build an Image Gallery Using Redux Saga](http://joelhooks.com/blog/2016/03/20/build-an-image-gallery-using-redux-saga)
* [Working with VK API (in Russian)](https://www.gitbook.com/book/maxfarseer/redux-course-ru/details)

### Talks

* [Live React: Hot Reloading and Time Travel](http://youtube.com/watch?v=xsSnOQynTHs) — See how constraints enforced by Redux make hot reloading with time travel easy
* [Cleaning the Tar: Using React within the Firefox Developer Tools](https://www.youtube.com/watch?v=qUlRpybs7_c) — Learn how to gradually migrate existing MVC applications to Redux
* [Redux: Simplifying Application State](https://www.youtube.com/watch?v=okdC5gcD-dM) — An intro to Redux architecture

## Using Redux

### Bindings

* [react-redux](https://github.com/gaearon/react-redux) — React
* [ng-redux](https://github.com/wbuchwalter/ng-redux) — Angular
* [ng2-redux](https://github.com/wbuchwalter/ng2-redux) — Angular 2
* [backbone-redux](https://github.com/redbooth/backbone-redux) — Backbone
* [redux-falcor](https://github.com/ekosz/redux-falcor) — Falcor
* [deku-redux](https://github.com/troch/deku-redux) — Deku
* [polymer-redux](https://github.com/tur-nr/polymer-redux) - Polymer
* [ember-redux](https://github.com/toranb/ember-redux) - Ember.js

### Middleware

* [redux-thunk](http://github.com/gaearon/redux-thunk) — The easiest way to write async action creators
* [redux-promise](https://github.com/acdlite/redux-promise) — [FSA](https://github.com/acdlite/flux-standard-action)-compliant promise middleware
* [redux-axios-middleware](https://github.com/svrcekmichal/redux-axios-middleware) — Redux middleware for fetching data with axios HTTP client
* [redux-observable](https://github.com/redux-observable/redux-observable/) — RxJS middleware for action side effects using "Epics"
* [redux-cycles](https://github.com/cyclejs-community/redux-cycles) — Handle Redux async actions using Cycle.js
* [redux-logger](https://github.com/fcomb/redux-logger) — Log every Redux action and the next state
* [redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant) — Warns about state mutations in development
* [redux-unhandled-action](https://github.com/socialtables/redux-unhandled-action) — Warns about actions that produced no state changes in development
* [redux-analytics](https://github.com/markdalgleish/redux-analytics) — Analytics middleware for Redux
* [redux-gen](https://github.com/weo-edu/redux-gen) — Generator middleware for Redux
* [redux-saga](https://github.com/yelouafi/redux-saga) — An alternative side effect model for Redux apps
* [redux-action-tree](https://github.com/cerebral/redux-action-tree) — Composable Cerebral-style signals for Redux
* [apollo-client](https://github.com/apollostack/apollo-client) — A simple caching client for any GraphQL server and UI framework built on top of Redux

### Routing

* [react-router-redux](https://github.com/reactjs/react-router-redux) — Ruthlessly simple bindings to keep React Router and Redux in sync
* [redial](https://github.com/markdalgleish/redial) — Universal data fetching and route lifecycle management for React that works great with Redux
* [redux-little-router](https://github.com/FormidableLabs/redux-little-router) — A tiny router for Redux that lets the URL do the talking

### Components

* [redux-form](https://github.com/erikras/redux-form) — Keep React form state in Redux
* [react-redux-form](https://github.com/davidkpiano/react-redux-form) — Create forms easily in React with Redux
* [redux-resource](https://github.com/jmeas/redux-resource) — Manage remote resources with Redux

### Enhancers

* [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) — Customize batching and debouncing calls to the store subscribers
* [redux-history-transitions](https://github.com/johanneslumpe/redux-history-transitions) — History transitions based on arbitrary actions
* [redux-optimist](https://github.com/ForbesLindesay/redux-optimist) — Optimistically apply actions that can be later committed or reverted
* [redux-optimistic-ui](https://github.com/mattkrick/redux-optimistic-ui) — A reducer enhancer to enable type-agnostic optimistic updates
* [redux-undo](https://github.com/omnidan/redux-undo) — Effortless undo/redo and action history for your reducers
* [redux-ignore](https://github.com/omnidan/redux-ignore) — Ignore redux actions by array or filter function
* [redux-recycle](https://github.com/omnidan/redux-recycle) — Reset the redux state on certain actions
* [redux-batched-actions](https://github.com/tshelburne/redux-batched-actions) — Dispatch several actions with a single subscriber notification
* [redux-search](https://github.com/treasure-data/redux-search) — Automatically index resources in a web worker and search them without blocking
* [redux-electron-store](https://github.com/samiskin/redux-electron-store) — Store enhancers that synchronize Redux stores across Electron processes
* [redux-loop](https://github.com/raisemarketplace/redux-loop) — Sequence effects purely and naturally by returning them from your reducers
* [redux-side-effects](https://github.com/salsita/redux-side-effects) — Utilize Generators for declarative yielding of side effects from your pure reducers

### Utilities

* [reselect](https://github.com/faassen/reselect) — Efficient derived data selectors inspired by NuclearJS
* [normalizr](https://github.com/paularmstrong/normalizr) — Normalize nested API responses for easier consumption by the reducers
* [redux-actions](https://github.com/acdlite/redux-actions) — Reduces the boilerplate in writing reducers and action creators
* [redux-act](https://github.com/pauldijou/redux-act) — An opinionated library for making reducers and action creators
* [redux-transducers](https://github.com/acdlite/redux-transducers) — Transducer utilities for Redux
* [redux-immutable](https://github.com/gajus/redux-immutable) — Used to create an equivalent function of Redux `combineReducers` that works with [Immutable.js](https://facebook.github.io/immutable-js/) state.
* [redux-tcomb](https://github.com/gcanti/redux-tcomb) — Immutable and type-checked state and actions for Redux
* [redux-mock-store](https://github.com/arnaudbenard/redux-mock-store) — Mock redux store for testing your app
* [redux-actions-assertions](https://github.com/dmitry-zaets/redux-actions-assertions) — Assertions for Redux actions testing
* [redux-bootstrap](https://github.com/remojansen/redux-bootstrap) — Bootstrapping function for Redux applications
* [redux-data-structures](https://redux-data-structures.js.org/) — Reducer factory (higher-order functions) for counters, maps, lists (queues, stacks), sets, etc.

### DevTools

* [Redux DevTools](http://github.com/gaearon/redux-devtools) — An action logger with time travel UI, hot reloading and error handling for the reducers, [first demoed at React Europe](https://www.youtube.com/watch?v=xsSnOQynTHs)
* [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension) — A Chrome extension wrapping Redux DevTools and providing additional functionality

### DevTools Monitors

* [Log Monitor](https://github.com/gaearon/redux-devtools-log-monitor) — The default monitor for Redux DevTools with a tree view
* [Dock Monitor](https://github.com/gaearon/redux-devtools-dock-monitor) — A resizable and movable dock for Redux DevTools monitors
* [Slider Monitor](https://github.com/calesce/redux-slider-monitor) — A custom monitor for Redux DevTools to replay recorded Redux actions
* [Inspector](https://github.com/alexkuz/redux-devtools-inspector) — A custom monitor for Redux DevTools that lets you filter actions, inspect diffs, and pin deep paths in the state to observe their changes
* [Diff Monitor](https://github.com/whetstone/redux-devtools-diff-monitor) — A monitor for Redux Devtools that diffs the Redux store mutations between actions
* [Filterable Log Monitor](https://github.com/bvaughn/redux-devtools-filterable-log-monitor/) — Filterable tree view monitor for Redux DevTools
* [Chart Monitor](https://github.com/romseguy/redux-devtools-chart-monitor) — A chart monitor for Redux DevTools
* [Filter Actions](https://github.com/zalmoxisus/redux-devtools-filter-actions) — Redux DevTools composable monitor with the ability to filter actions


### Community Conventions

* [Flux Standard Action](https://github.com/acdlite/flux-standard-action) — A human-friendly standard for Flux action objects
* [Canonical Reducer Composition](https://github.com/gajus/canonical-reducer-composition) — An opinionated standard for nested reducer composition
* [Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux) — A proposal for bundling reducers, action types and actions

### Translations

* [中文文档](http://camsong.github.io/redux-in-chinese/) — Chinese
* [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
* [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
* [Redux en Español](http://es.redux.js.org/) - Spanish

## More

[Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.  
[React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES6, and more.  
[Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) is a categorized collection of Redux-related libraries, addons, and utilities.
