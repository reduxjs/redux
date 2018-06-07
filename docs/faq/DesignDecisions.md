# Redux FAQ: Design Decisions

## Table of Contents

- [Why doesn't Redux pass the state and action to subscribers?](#does-not-pass-state-action-to-subscribers) 
- [Why doesn't Redux support using classes for actions and reducers?](#does-not-support-classes) 
- [Why does the middleware signature use currying?](#why-currying)
- [Why does applyMiddleware use a closure for dispatch?](#closure-dispatch)
- [Why doesn't `combineReducers` include a third argument with the entire state when it calls each reducer?](#combineReducers-limitations)
- [Why doesn't mapDispatchToProps allow use of return values from `getState()` or `mapStateToProps()`?](#no-asynch-in-mapDispatchToProps)


## Design Decisions

<a id="does-not-pass-state-action-to-subscribers"></a>
### Why doesn't Redux pass the state and action to subscribers?
Subscribers are intended to respond to the state value itself, not the action. Updates to the state are processed synchronously, but notifications to subscribers can be batched or debounced, meaning that subscribers are not always notified with every action. This is a common [performance optimization](http://redux.js.org/docs/faq/Performance.html#performance-update-events) to avoid repeated re-rendering.

Batching or debouncing is possible by using enhancers to override `store.dispatch` to change the way that subscribers are notified. Also, there are libraries that change Redux to process actions in batches to optimize performance and avoid repeated re-rendering:
* [redux-batch](https://github.com/manaflair/redux-batch) allows passing an array of actions to `store.dispatch()` with only one notification,
* [redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe) allows batching of subscribe notifications that occur as a result of dispatches.

The intended guarantee is that Redux eventually calls all subscribers with the most recent state available, but not that it always calls each subscriber for each action. The store state is available in the subscriber simply by calling `store.getState()`. The action cannot be made available in the subscribers without breaking the way that actions might be batched.

A potential use-case for using the action inside a subscriber -- which is an unsupported feature -- is to ensure that a component only re-renders after certain kinds of actions. Instead, re-rendering should be controlled through:
1. the [shouldComponentUpdate](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate) lifecycle method
2. the [virtual DOM equality check (vDOMEq)](https://facebook.github.io/react/docs/optimizing-performance.html#avoid-reconciliation)
3. [React.PureComponent](https://facebook.github.io/react/docs/optimizing-performance.html#examples)
4. Using React-Redux: use [mapStateToProps](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) to subscribe components to only the parts of the store that they need.

#### Further Information
**Articles**
 * [How can I reduce the number of store update events?](./Performance.md#performance-update-events)

**Discussions**
* [#580: Why doesn't Redux pass the state to subscribers?](https://github.com/reactjs/redux/issues/580)
* [#2214: Alternate Proof of Concept: Enhancer Overhaul -- more on debouncing](https://github.com/reactjs/redux/pull/2214)

<a id="does-not-support-classes"></a>
### Why doesn't Redux support using classes for actions and reducers?
The pattern of using functions, called action creators, to return action objects may seem counterintuitive to programmers with a lot of Object Oriented Programming experience, who would see this is a strong use-case for Classes and instances. Class instances for action objects and reducers are not supported because class instances make serialization and deserialization tricky. Deserialization methods like `JSON.parse(string)` will return a plain old Javascript object rather than class instances. 

As described in the [Store FAQ](./OrganizingState.md#organizing-state-non-serializable), if you are okay with things like persistence and time-travel debugging not working as intended, you are welcome to put non-serializable items into your Redux store.

Serialization enables the browser to store all actions that have been dispatched, as well as the previous store states, with much less memory. Rewinding and 'hot reloading' the store is central to the Redux developer experience and the function of Redux DevTools. This also enables deserialized actions to be stored on the server and re-serialized in the browser in the case of server-side rendering with Redux.

#### Further Information
**Articles**
* [Can I put functions, promises, or other non-serializable items in my store state?](./OrganizingState.md#organizing-state-non-serializable)

**Discussions**
* [#1171: Why doesn't Redux use classes for actions and reducers?](https://github.com/reactjs/redux/issues/1171#issuecomment-196819727)

<a id="why-currying"></a>
### Why does the middleware signature use currying?

Redux middleware are written using a triply-nested function structure that looks like `const middleware = storeAPI => next => action => {}`, rather than a single function that looks like `const middleware = (storeAPI, next, action) => {}`.  There's a few reasons for this.

One is that "currying" functions is a standard functional programming technique, and Redux was explicitly intended to use functional programming principles in its design.  Another is that currying functions creates closures where you can declare variables that exist for the lifetime of the middleware (which could be considered a functional equivalent to instance variables that exist for the lifetime of a class instance).  Finally, it's simply the approach that was chosen when Redux was initially designed.

The [curried function signature](https://github.com/reactjs/redux/issues/1744) of declaring middleware is [deemed unnecessary](https://github.com/reactjs/redux/pull/784) by some, because both store and next are available when the applyMiddleware function is executed. This issue has been determined to not be [worth introducing breaking changes](https://github.com/reactjs/redux/issues/1744), as there are now hundreds of middleware in the Redux ecosystem that rely on the existing middleware definition.

#### Further Information
**Discussions**
* Why does the middleware signature use currying?
    * Prior discussions: [#55](https://github.com/reactjs/redux/pull/55), [#534](https://github.com/reactjs/redux/issues/534), [#784](https://github.com/reactjs/redux/pull/784), [#922](https://github.com/reactjs/redux/issues/922), [#1744](https://github.com/reactjs/redux/issues/1744)
    * [React Boston 2017: You Might Need Redux (And Its Ecosystem)](http://blog.isquaredsoftware.com/2017/09/presentation-might-need-redux-ecosystem/)

<a id="closure-dispatch"></a>
### Why does `applyMiddleware` use a closure for `dispatch`?
`applyMiddleware` takes the existing dispatch from the store and closes over it to create the initial chain of middlewares that have been invoked with an object that exposes the getState and dispatch functions, which enables middlewares that [rely on dispatch during initialization](https://github.com/reactjs/redux/pull/1592) to run. 

#### Further Information
**Discussions**
* Why does applyMiddleware use a closure for dispatch?
    * See - [#1592](https://github.com/reactjs/redux/pull/1592) and [#2097](https://github.com/reactjs/redux/issues/2097)

<a id="combineReducers-limitations"></a>
### Why doesn't `combineReducers` include a third argument with the entire state when it calls each reducer?

`combineReducers` is opinionated to encourage splitting reducer logic by domain. As stated in [Beyond `combineReducers`](../recipes/reducers/BeyondCombineReducers.md),`combineReducers` is deliberately limited to handle a single common use case: updating a state tree that is a plain Javascript object by delegating the work of updating each slice of state to a specific slice reducer. 

It's not immediately obvious what a potential third argument to each reducer should be: the entire state tree, some callback function, some other part of the state tree, etc. If `combineReducers` doesn't fit your use case, consider using libraries like [combineSectionReducers](https://github.com/ryo33/combine-section-reducers) or [reduceReducers](https://github.com/acdlite/reduce-reducers) for other options with deeply nested reducers and reducers that require access to the global state. 

If none of the published utilities solve your use case, you can always write a function yourself that does just exactly what you need.

#### Further information
**Articles**
* [Beyond `combineReducers`](../recipes/reducers/BeyondCombineReducers.md)

**Discussions**
* [#1768 Allow reducers to consult global state](https://github.com/reactjs/redux/pull/1768)

<a id="no-asynch-in-mapDispatchToProps"></a>
### Why doesn't `mapDispatchToProps` allow use of return values from `getState()` or `mapStateToProps()`?

There have been requests to use either the entire `state` or the return value of `mapState` inside of `mapDispatch`, so that when functions are declared inside of `mapDispatch`, they can close over the latest returned values from the store. 

This approach is not supported in `mapDispatch` because it would mean also calling `mapDispatch` every time the store is updated. This would cause the re-creation of functions with every state update, thus adding a lot of performance overhead.

The preferred way to handle this use-case--needing to alter props based on the current state and mapDispatchToProps functions--is to work from  mergeProps, the third argument to the connect function. If specified, it is passed the result of `mapStateToProps()`, `mapDispatchToProps()`, and the container component's props. The plain object returned from `mergeProps` will be passed as props to the wrapped component.

#### Further information
**Discussions**
* [#237 Why doesn't mapDispatchToProps allow use of return values from getState() or mapStateToProps()?](https://github.com/reactjs/react-redux/issues/237)
