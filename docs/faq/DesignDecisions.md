# Redux FAQ: Design Decisions

## Table of Contents

- [Why doesn't Redux pass the state and action to subscribers?](#does-not-pass-state-action-to-subscribers) 
- [Why doesn't Redux support using classes for actions and reducers?](#does-not-support-classes) 
- [Why does the middleware signature use currying?](#why-currying)
- [Why does applyMiddleware use a closure for dispatch?](#closure-dispatch)
- [Can you please change combineReducers to support nested state trees?](#combineReducers-limitations)
- [Why doesn't mapDispatchToProps allow use of return values from getState() or mapStateToProps()?](#no-asynch-in-mapDispatchToProps)


## Design Decisions

<a id="does-not-pass-state-action-to-subscribers"></a>
### Why doesn't Redux pass the state and action to subscribers?
Subscribers are intended to respond to the state value itself, not the action. Updates to the state are not always processed synchronously, because libraries can change Redux to process actions in batches to optimize performance and avoid repeated re-rendering. The intended guarantee is that Redux eventually calls all subscribers with the most recent state, but not that it always calls each subscriber for each action. The store state is available in the subscriber simply by calling store.getState(). The action cannot be made available in the subsribers without breaking the way that actions are batched. 

A potential use-case for using the action inside a subscriber -- which is an unsupported feature -- is to ensure that a component only re-renders after certain kinds of actions. Re-rendering should instead be controlled instead through:
1.) the [shouldComponentUpdate](https://facebook.github.io/react/docs/react-component.html#shouldcomponentupdate) lifecycle method
2.) the [virtual DOM equality check (vDOMEq)](https://facebook.github.io/react/docs/optimizing-performance.html#avoid-reconciliation)
3.) [React.PureComponent](https://facebook.github.io/react/docs/optimizing-performance.html#examples)
4.) Using React-Redux: use [mapStateToProps](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) to subscribe components to only the parts of the store that they need.

<a id="does-not-support-classes"></a>
### Why doesn't Redux support using classes for actions and reducers?
The pattern of using functions, called action creators, to return action objects may seem counterintuitive to programmers with a lot of Object Oriented Programming experience, who would see this is a strong use-case for Classes and instances. Class instances for action objects and reducers are not supported because class instances make serialization and deserialization tricky. Deserialization methods like JSON.parse(string) will return a plain old Javascript object rather than class instances. 

Serialization enables the brower to store all actions that have been dispatched, as well as the previous store states, with much less memory. Rewinding and 'hot reloading' the store is central to the Redux developer experience and the function of Redux DevTools. This also enables deserialized actions to be stored on the server and re-serialized in the brower in the case of server-side rendering with Redux.

<a id="why-currying"></a>
### Why does the middleware signature use currying?
The [curried function signature](https://github.com/reactjs/redux/issues/1744) of declaring middleware is [deemed unnecessary](https://github.com/reactjs/redux/pull/784) by some, because both store and next are available when the applyMiddleware function is executed. This issue has been determined to not be [worth introducing breaking changes](https://github.com/reactjs/redux/issues/1744).

<a id="closure-dispatch"></a>
### Why does applyMiddleware use a closure for dispatch?
applyMiddleware takes the existing dispatch from the store and closes over it to create the initial chain of middlewares that have been invoked with an object that exposes the getState and dispatch functions, which enables middlewares that [rely on dispatch during initialization](https://github.com/reactjs/redux/pull/1592) to run. 

<a id="combineReducers-limitations"></a>
### Can you please change combineReducers to support nested state trees?
No, but there are some limits to combineReducers that are worth knowing.
- combineReducers receives an object where the values are all reducer names. Additional nesting is not possible, which limits the state shape. The following code is not possible:
```
const rootReducer = combineReducers({
    a : reducerA,
    b : {
        b1 : reducerB1,
        b2 : reducerB2
    }
});
```
- reducers within combineReducers are only passed the part of the state that they modify, and not the top state.

The default utility combineReducers is only one way to build a complex reducer. Consider using libraries like [combineSectionReducers](https://github.com/ryo33/combine-section-reducers) or [reduceReducers](https://github.com/acdlite/reduce-reducers) if you want your reducers to have a nested tree structure.

<a id="no-asynch-in-mapDispatchToProps"></a>
### Why doesn't mapDispatchToProps allow use of return values from getState() or mapStateToProps()?
In general, connect provides some way to generate a props object out of a closure that is injected with both the current state and dispatch. Asynchronous logic does not belong in the mapStateToProps and mapDispatchToProps functions at all. They should be only pure functions which transform the state to props and bind action creators to dispatch. 

You cannot modify the state during the execution of mapStateToProps, because modifying the state from these functions could lead to infinite loops because every update would reinvoke the map functions. Calling getState() inside mapStateToProps would always just return the same state that is passed to the function. 

The designed way to handle this use-case (needing to alter props based on the current state and mapDispatchToProps functions) is to work from the third argument to the connect function, mergeProps. If specified, it is passed the result of mapStateToProps(), mapDispatchToProps(), and the container component's props. The plain object you return from it will be passed as props to the wrapped component.

#### Further information
**Discussions**
* [#580: Why doesn't Redux pass the state to subscribers?](https://github.com/reactjs/redux/issues/580)
* [#2214: Alternate Proof of Concept: Enhancer Overhaul -- more on debouncing](https://github.com/reactjs/redux/pull/2214)

* [#1171: Why doesn't Redux use classes for actions and reducers?](https://github.com/reactjs/redux/issues/1171#issuecomment-196819727)
* Why does the middleware signature use currying?
    * See - [#55](https://github.com/reactjs/redux/pull/55), [#534](https://github.com/reactjs/redux/issues/534), [#784](https://github.com/reactjs/redux/pull/784), [#922](https://github.com/reactjs/redux/issues/922), [#1744](https://github.com/reactjs/redux/issues/1744)
* Why does applyMiddleware use a closure for dispatch?
    * See - [#1592](https://github.com/reactjs/redux/pull/1592) and [#2097](https://github.com/reactjs/redux/issues/2097)
* [#1768 Can you please change combineReducers to support nested state trees?](https://github.com/reactjs/redux/pull/1768)
* [#237 Why doesn't mapDispatchToProps allow use of return values from getState() or mapStateToProps()?](https://github.com/reactjs/react-redux/issues/237)
