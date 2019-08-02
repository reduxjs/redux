---
id: react-redux
title: React Redux
sidebar_label: React Redux
hide_title: true
---

# Redux FAQ: React Redux

## Table of Contents

- [Why should I use React-Redux?](#why-should-i-use-react-redux)
- [Why isn't my component re-rendering, or my mapStateToProps running?](#why-isnt-my-component-re-rendering-or-my-mapstatetoprops-running)
- [Why is my component re-rendering too often?](#why-is-my-component-re-rendering-too-often)
- [How can I speed up my mapStateToProps?](#how-can-i-speed-up-my-mapstatetoprops)
- [Why don't I have this.props.dispatch available in my connected component?](#why-dont-i-have-thispropsdispatch-available-in-my-connected-component)
- [Should I only connect my top component, or can I connect multiple components in my tree?](#should-i-only-connect-my-top-component-or-can-i-connect-multiple-components-in-my-tree)
- [How does Redux compare to the React Context API?](#how-does-redux-compare-to-the-react-context-api)

## React Redux

### Why should I use React-Redux?

Redux itself is a standalone library that can be used with any UI layer or framework, including React, Angular, Vue, Ember, and vanilla JS. Although Redux and React are commonly used together, they are independent of each other.

If you are using Redux with any kind of UI framework, you will normally use a "UI binding" library to tie Redux together with your UI framework, rather than directly interacting with the store from your UI code.

**React-Redux is the official Redux UI binding library for React**. If you are using Redux and React together, you should also use React-Redux to bind these two libraries.

While it is possible to write Redux store subscription logic by hand, doing so would become very repetitive. In addition, optimizing UI performance would require complicated logic.

The process of subscribing to the store, checking for updated data, and triggering a re-render can be made more generic and reusable. **A UI binding library like React-Redux handles the store interaction logic, so you don't have to write that code yourself.**

Overall, React-Redux encourages good React architecture, and implements complex performance optimizations for you. It is also kept up-to-date with the latest API changes from Redux and React.

#### Further Information

**Documentation**

- **[React-Redux docs: Why Use React-Redux?](https://react-redux.js.org/introduction/why-use-react-redux)**

### Why isn't my component re-rendering, or my mapStateToProps running?

Accidentally mutating or modifying your state directly is by far the most common reason why components do not re-render after an action has been dispatched. Redux expects that your reducers will update their state “immutably”, which effectively means always making copies of your data, and applying your changes to the copies. If you return the same object from a reducer, Redux assumes that nothing has been changed, even if you made changes to its contents. Similarly, React Redux tries to improve performance by doing shallow equality reference checks on incoming props in `shouldComponentUpdate`, and if all references are the same, `shouldComponentUpdate` returns `false` to skip actually updating your original component.

It's important to remember that whenever you update a nested value, you must also return new copies of anything above it in your state tree. If you have `state.a.b.c.d`, and you want to make an update to `d`, you would also need to return new copies of `c`, `b`, `a`, and `state`. This [state tree mutation diagram](http://arqex.com/wp-content/uploads/2015/02/trees.png) demonstrates how a change deep in a tree requires changes all the way up.

Note that “updating data immutably” does _not_ mean that you must use [Immutable.js](https://facebook.github.io/immutable-js/), although that is certainly an option. You can do immutable updates to plain JS objects and arrays using several different approaches:

- Copying objects using functions like `Object.assign()` or `_.extend()`, and array functions such as `slice()` and `concat()`
- The array spread operator in ES6, and the similar object spread operator that is proposed for a future version of JavaScript
- Utility libraries that wrap immutable update logic into simpler functions

#### Further information

**Documentation**

- [Troubleshooting](../Troubleshooting.md)
- [React Redux: Troubleshooting](https://react-redux.js.org/troubleshooting)
- [Recipes: Using the Object Spread Operator](../recipes/UsingObjectSpreadOperator.md)
- [Recipes: Structuring Reducers - Prerequisite Concepts](../recipes/structuring-reducers/PrerequisiteConcepts.md)
- [Recipes: Structuring Reducers - Immutable Update Patterns](../recipes/structuring-reducers/ImmutableUpdatePatterns.md)

**Articles**

- [Pros and Cons of Using Immutability with React](http://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)
- [React/Redux Links: Immutable Data](https://github.com/markerikson/react-redux-links/blob/master/immutable-data.md)

**Discussions**

- [#1262: Immutable data + bad performance](https://github.com/reduxjs/redux/issues/1262)
- [React Redux #235: Predicate function for updating component](https://github.com/reduxjs/react-redux/issues/235)
- [React Redux #291: Should mapStateToProps be called every time an action is dispatched?](https://github.com/reduxjs/react-redux/issues/291)
- [Stack Overflow: Cleaner/shorter way to update nested state in Redux?](http://stackoverflow.com/questions/35592078/cleaner-shorter-way-to-update-nested-state-in-redux)
- [Gist: state mutations](https://gist.github.com/amcdnl/7d93c0c67a9a44fe5761#gistcomment-1706579)

### Why is my component re-rendering too often?

React Redux implements several optimizations to ensure your actual component only re-renders when actually necessary. One of those is a shallow equality check on the combined props object generated by the `mapStateToProps` and `mapDispatchToProps` arguments passed to `connect`. Unfortunately, shallow equality does not help in cases where new array or object instances are created each time `mapStateToProps` is called. A typical example might be mapping over an array of IDs and returning the matching object references, such as:

```js
const mapStateToProps = state => {
  return {
    objects: state.objectIds.map(id => state.objects[id])
  }
}
```

Even though the array might contain the exact same object references each time, the array itself is a different reference, so the shallow equality check fails and React Redux would re-render the wrapped component.

The extra re-renders could be resolved by saving the array of objects into the state using a reducer, caching the mapped array using [Reselect](https://github.com/reduxjs/reselect), or implementing `shouldComponentUpdate` in the component by hand and doing a more in-depth props comparison using a function such as `_.isEqual`. Be careful to not make your custom `shouldComponentUpdate()` more expensive than the rendering itself! Always use a profiler to check your assumptions about performance.

For non-connected components, you may want to check what props are being passed in. A common issue is having a parent component re-bind a callback inside its render function, like `<Child onClick={this.handleClick.bind(this)} />`. That creates a new function reference every time the parent re-renders. It's generally good practice to only bind callbacks once in the parent component's constructor.

#### Further information

**Documentation**

- [FAQ: Performance - Scaling](./Performance.md#performance-scaling)

**Articles**

- [A Deep Dive into React Perf Debugging](http://benchling.engineering/deep-dive-react-perf-debugging/)
- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f)
- [Improving React and Redux Performance with Reselect](http://blog.rangle.io/react-and-redux-performance-with-reselect/)
- [Encapsulating the Redux State Tree](http://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
- [React/Redux Links: React/Redux Performance](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md)

**Discussions**

- [Stack Overflow: Can a React Redux app scale as well as Backbone?](http://stackoverflow.com/questions/34782249/can-a-react-redux-app-really-scale-as-well-as-say-backbone-even-with-reselect)

**Libraries**

- [Redux Addons Catalog: DevTools - Component Update Monitoring](https://github.com/markerikson/redux-ecosystem-links/blob/master/devtools.md#component-update-monitoring)

### How can I speed up my `mapStateToProps`?

While React Redux does work to minimize the number of times that your `mapStateToProps` function is called, it's still a good idea to ensure that your `mapStateToProps` runs quickly and also minimizes the amount of work it does. The common recommended approach is to create memoized “selector” functions using [Reselect](https://github.com/reduxjs/reselect). These selectors can be combined and composed together, and selectors later in a pipeline will only run if their inputs have changed. This means you can create selectors that do things like filtering or sorting, and ensure that the real work only happens if needed.

#### Further information

**Documentation**

- [Recipes: Computed Derived Data](../recipes/ComputingDerivedData.md)

**Articles**

- [Improving React and Redux Performance with Reselect](http://blog.rangle.io/react-and-redux-performance-with-reselect/)

**Discussions**

- [#815: Working with Data Structures](https://github.com/reduxjs/redux/issues/815)
- [Reselect #47: Memoizing Hierarchical Selectors](https://github.com/reduxjs/reselect/issues/47)

### Why don't I have `this.props.dispatch` available in my connected component?

The `connect()` function takes two primary arguments, both optional. The first, `mapStateToProps`, is a function you provide to pull data from the store when it changes, and pass those values as props to your component. The second, `mapDispatchToProps`, is a function you provide to make use of the store's `dispatch` function, usually by creating pre-bound versions of action creators that will automatically dispatch their actions as soon as they are called.

If you do not provide your own `mapDispatchToProps` function when calling `connect()`, React Redux will provide a default version, which simply returns the `dispatch` function as a prop. That means that if you _do_ provide your own function, `dispatch` is _not_ automatically provided. If you still want it available as a prop, you need to explicitly return it yourself in your `mapDispatchToProps` implementation.

#### Further information

**Documentation**

- [React Redux API: connect()](https://react-redux.js.org/api/connect)

**Discussions**

- [React Redux #89: can i wrap multi actionCreators into one props with name?](https://github.com/reduxjs/react-redux/issues/89)
- [React Redux #145: consider always passing down dispatch regardless of what mapDispatchToProps does](https://github.com/reduxjs/react-redux/issues/145)
- [React Redux #255: this.props.dispatch is undefined if using mapDispatchToProps](https://github.com/reduxjs/react-redux/issues/255)
- [Stack Overflow: How to get simple dispatch from this.props using connect w/ Redux?](http://stackoverflow.com/questions/34458261/how-to-get-simple-dispatch-from-this-props-using-connect-w-redux/34458710])

### Should I only connect my top component, or can I connect multiple components in my tree?

Early Redux documentation advised that you should only have a few connected components near the top of your component tree. However, time and experience has shown that such a component architecture generally requires a few components to know too much about the data requirements of all their descendants, and forces them to pass down a confusing number of props.

The current suggested best practice is to categorize your components as “presentational” or “container” components, and extract a connected container component wherever it makes sense:

> Emphasizing “one container component at the top” in Redux examples was a mistake. Don't take this as a maxim. Try to keep your presentation components separate. Create container components by connecting them when it's convenient. Whenever you feel like you're duplicating code in parent components to provide data for same kinds of children, time to extract a container. Generally as soon as you feel a parent knows too much about “personal” data or actions of its children, time to extract a container.

In fact, benchmarks have shown that more connected components generally leads to better performance than fewer connected components.

In general, try to find a balance between understandable data flow and areas of responsibility with your components.

#### Further information

**Documentation**

- [Basics: Usage with React](../basics/UsageWithReact.md)
- [FAQ: Performance - Scaling](../faq/Performance.md#performance-scaling)

**Articles**

- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [High-Performance Redux](http://somebody32.github.io/high-performance-redux/)
- [React/Redux Links: Architecture - Redux Architecture](https://github.com/markerikson/react-redux-links/blob/master/react-redux-architecture.md#redux-architecture)
- [React/Redux Links: Performance - Redux Performance](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md#redux-performance)

**Discussions**

- [Twitter: emphasizing “one container” was a mistake](https://twitter.com/dan_abramov/status/668585589609005056)
- [#419: Recommended usage of connect](https://github.com/reduxjs/redux/issues/419)
- [#756: container vs component?](https://github.com/reduxjs/redux/issues/756)
- [#1176: Redux+React with only stateless components](https://github.com/reduxjs/redux/issues/1176)
- [Stack Overflow: can a dumb component use a Redux container?](http://stackoverflow.com/questions/34992247/can-a-dumb-component-use-render-redux-container-component)

### How does Redux compare to the React Context API?

**Similarities**

Both Redux and React's Context API deal with "prop drilling". That said, they both allow you to pass data without having to pass the props through multiple layers of components. Internally, Redux _uses_ the React context API that allows it to pass the store along your component tree.

**Differences**

With Redux, you get the the power of [Redux Dev Tools Extension](https://github.com/zalmoxisus/redux-devtools-extension). It automatically logs every action your app performs, and it allows time traveling – you can click on any past action and jump to that point in time. Redux also supports the concept of middleware, where you may bind customized function calls on every action dispatch. Such examples include an automatic event logger, interception of certain actions, etc.

With React's Context API, you deal with a pair of components speaking only to each other. This gives you nice isolation between irrelevant data. You also have the flexibility of how you may use the data with your components, i.e., you can provide the state of a parent component, and you may pass context data as props to wrapped components.

There is a key difference in how Redux and React's Context treat data. Redux maintains the data of your whole app in a giant, stateful object. It deduces the changes of your data by running the reducer function you provide, and returns the next state that corresponds to every action dispatched. React Redux then optimizes component rendering and makes sure that each component re-renders only when the data it needs change. Context, on the other hand, does not hold any state. It is only a conduit for the data. To express changes in data you need to rely on the state of a parent component.

#### Further information

- [Redux vs. The React Context API](https://daveceddia.com/context-api-vs-redux/)
- [You Might Not Need Redux (But You Can’t Replace It With Hooks)](https://www.simplethread.com/cant-replace-redux-with-hooks/)
