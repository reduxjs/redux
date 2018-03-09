# Redux FAQ: React Redux

## Table of Contents

- [Why isn't my component re-rendering, or my mapStateToProps running?](#react-not-rerendering)
- [Why is my component re-rendering too often?](#react-rendering-too-often)
- [How can I speed up my mapStateToProps?](#react-mapstate-speed)
- [Why don't I have this.props.dispatch available in my connected component?](#react-props-dispatch)
- [Should I only connect my top component, or can I connect multiple components in my tree?](#react-multiple-components)


## React Redux

<a id="react-not-rerendering"></a>
### Why isn't my component re-rendering, or my mapStateToProps running?

Accidentally mutating or modifying your state directly is by far the most common reason why components do not re-render after an action has been dispatched. Redux expects that your reducers will update their state “immutably”, which effectively means always making copies of your data, and applying your changes to the copies. If you return the same object from a reducer, Redux assumes that nothing has been changed, even if you made changes to its contents. Similarly, React Redux tries to improve performance by doing shallow equality reference checks on incoming props in `shouldComponentUpdate`, and if all references are the same, `shouldComponentUpdate` returns `false` to skip actually updating your original component.

It's important to remember that whenever you update a nested value, you must also return new copies of anything above it in your state tree. If you have `state.a.b.c.d`, and you want to make an update to `d`, you would also need to return new copies of `c`, `b`, `a`, and `state`. This [state tree mutation diagram](http://arqex.com/wp-content/uploads/2015/02/trees.png) demonstrates how a change deep in a tree requires changes all the way up.

Note that “updating data immutably” does *not* mean that you must use [Immutable.js](https://facebook.github.io/immutable-js/), although that is certainly an option. You can do immutable updates to plain JS objects and arrays using several different approaches:

- Copying objects using functions like `Object.assign()` or `_.extend()`, and array functions such as `slice()` and `concat()`
- The array spread operator in ES6, and the similar object spread operator that is proposed for a future version of JavaScript
- Utility libraries that wrap immutable update logic into simpler functions

#### Further information

**Documentation**
- [Troubleshooting](/docs/Troubleshooting.md)
- [React Redux: Troubleshooting](https://github.com/reactjs/react-redux/blob/master/docs/troubleshooting.md)
- [Recipes: Using the Object Spread Operator](/docs/recipes/UsingObjectSpreadOperator.md)
- [Recipes: Structuring Reducers - Prerequisite Concepts](/docs/recipes/reducers/PrerequisiteConcepts.md)
- [Recipes: Structuring Reducers - Immutable Update Patterns](/docs/recipes/reducers/ImmutableUpdatePatterns.md)

**Articles**
- [Pros and Cons of Using Immutability with React](http://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)
- [React/Redux Links: Immutable Data](https://github.com/markerikson/react-redux-links/blob/master/immutable-data.md)

**Discussions**
- [#1262: Immutable data + bad performance](https://github.com/reactjs/redux/issues/1262)
- [React Redux #235: Predicate function for updating component](https://github.com/reactjs/react-redux/issues/235)
- [React Redux #291: Should mapStateToProps be called every time an action is dispatched?](https://github.com/reactjs/react-redux/issues/291)
- [Stack Overflow: Cleaner/shorter way to update nested state in Redux?](http://stackoverflow.com/questions/35592078/cleaner-shorter-way-to-update-nested-state-in-redux)
- [Gist: state mutations](https://gist.github.com/amcdnl/7d93c0c67a9a44fe5761#gistcomment-1706579)


<a id="why-use-react-redux"></a>
### Why Use React-Redux
To understand the benefit, you have to understand the problems it is intended to solve and how it goes about solving those problems relative to other options.

Redux store provides us with three functions that make possible the interaction of React Components with the state of the application that is held by the store.

These functions are:
* `store.getState()`  Let us access to current state of the store.
* `store.dispatch(action)`  Let us updated the state of the store.
* `store.subscribe(listener)`  Let us register a listener.

On the example below, we see how we can implement a React and Redux Application by just using this three functions:

### Entry Point

`index.js`

```javascript
import React, { Component } from "react"
import { render } from "react-dom"
import { createStore } from 'redux'
import reducers from './reducers'
import App from './components/App'

const store = createStore(reducers)

renderDOM = () => {
    render(
        <App store={store} />,
        document.getElementById('root')
    );
}

store.subscribe(renderDOM);

renderDOM();
```

### Reducers

`heroes.js`

```javascript
const heroes = (state = [], action) => {
  switch (action.type) {
    case "NEW_HERO":
      return [...state, action.payload]
    default:
      return state
  }
}
export default heroes
```

`villains.js`

```javascript
const villains = (state = [], action) => {
  switch (action.type) {
    case "NEW_VILLAIN":
      return [...state, action.payload]
    default:
      return state
  }
}

export default villains
```

`index.js`

```javascript
import heroes from './heroes'
import villains from './villians'

const reducers = combineReducers({
  heroes,
  villains
});
export default reducers
```

### Actions

`index.js`

```javascript

const newHero = hero => {
    return {
        type: 'NEW_HERO'
        payload: hero
    }
}

const newVillain = villain => {
    return {
        type: 'NEW_VILLAIN'
        payload: villain
    }
}

```

### Components

`Hero.js`
```javascript
import React, { Component } from 'react';
import { newHero } from './actions'

class Heroes extends Component {
  state = { hero: "" };
  componentDidUpdate() {
    if(PreviousState.hero === this.state.hero){
        console.log("Heroes component updated")
    }
  }
  onNewHero = () => {
    const { dispatch } = this.props.store
    dispatch(newFriend());
  };
  render() {
    const { getState } = this.props.store
    return (
      <div>
        <h1>{getState().heroes.join(", ")}</h1>
        <input
          value={this.state.hero}
          onChange={event => this.setState({ hero: event.target.value })}
        />
        <button onClick={this.onNewHero}>Add new Hero</button>
      </div>
    )
  }
}
```

`Villains.js`
```javascript
import React, { Component } from 'react'
import { newVillains } from './actions'

class Villains extends Component {
  state = { villain: "" }
  componentDidUpdate(previousProps, PreviousState) {
      if(PreviousState.villain === this.state.villain){
          console.log("Villains component updated")
      }
  }
  onNewVillain = () => {
    const { dispatch } = this.props.store;
    dispatch(newVillain())
  };
  render() {
    const { getState } = this.props.store
    return (
      <div>
        <h1>{getState().villains.join(", ")}</h1>
        <input
          value={this.state.villain}
          onChange={event => this.setState({ villain: event.target.value })}
        />
        <button onClick={this.onNewVillain}>Add new villain</button>
      </div>
    )
  }
}
```

`App.js`

```javascript 
import Heroes from './components/Friends'
import Villains from './components/Villains'
const App = ({ store }) => {
  return (
    <div>
      <Heroes store={store} />
      <hr />
      <Villains store={store} />
    </div>
  )
}

```

In fact, we can build React and Redux Application without React-Redux, but if we take a look at our App we can see some issues:

*  We need to pass down the store as a prop to every component that we want to access the store.

*  To get access to the piece of state that the component needs, we have to type `this.props.props.state[pieceOfState]`

* To dispatch an action we need to pass it as an argument of `this.props.store.dispatch()`.

*  Let's take a look at this code <code> the If statement here evaluates to true if the Component was re-rendered by an action that we dispatched. If we dispatch an action, `subscribe.store()` will re-rendered the entire Application even if just one component cares about the piece of state that was updated (We can confirm this by looking at the console).

React-Redux uses several features to solves every one of this points:

* `<Provider/>`  This Component from the React-Redux library requires that we pass the store as a prop and what it does is to make the store accessible to every component that we pass through it by using the Context API of React.

* The first argument that we pass into `connect()` is `mapStateToProps` a function that receives as argument the current state of the store and allows us to specify the piece of state that our component wants to have access. It merges the result into the component props.

* The second argument that we specify is `mapDispatchToProps` It can be a function or an object. It wraps our actions with store.dispatch and merge the result into the component props

* `connect()` Performs several equalities checks every time we dispatch an action, to determine if a component should be re-render with new props. 

The equalities checks that `connect()` performs are:
* `areStatesEqual` compares the incoming store state to its previous value. By default it use strictEqual (===).
* `areOwnPropsEqual` compares incoming props to its previous value. By default it uses shallowEqual.
* `areStatePropsEqual` compares the result of mapStateToProps to its previous value. By default it uses shallowEqual.
* `areMergedPropsEqual` compares the result of mergeProps to its previous value. By default it uses shallowEqual.

It is because of these checks that `connect()` can determine if a component should be re-render with new props or not.

`connect` returns a HOC (High Order Component) function which returns a new component and merges into the props the results of `mapStateToProps`, `mapDispatchToProps`, `mergeProps`.

In other words, using `connect()` we can inject the piece of the state that the component cares about and the behavior that it can have over this data, and more importantly avoid unnecessaries calls to mapStateToProps, mapDispatchToProps, mergeProps.

More critical please always use `connect()` to bind your component to the store if you do not; you are wasting much performance in your App. `connect()` is a must use library with Redux.

#### Further information

**Discussions**
- [Reddit: I use react and redux but never react-redux](https://www.reddit.com/r/javascript/comments/6hperk/i_use_react_and_redux_but_never_reactredux_what/dj0fywb/)

<a id="react-rendering-too-often"></a>
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

The extra re-renders could be resolved by saving the array of objects into the state using a reducer, caching the mapped array using [Reselect](https://github.com/reactjs/reselect), or implementing `shouldComponentUpdate` in the component by hand and doing a more in-depth props comparison using a function such as `_.isEqual`. Be careful to not make your custom `shouldComponentUpdate()` more expensive than the rendering itself! Always use a profiler to check your assumptions about performance.

For non-connected components, you may want to check what props are being passed in. A common issue is having a parent component re-bind a callback inside its render function, like `<Child onClick={this.handleClick.bind(this)} />`. That creates a new function reference every time the parent re-renders. It's generally good practice to only bind callbacks once in the parent component's constructor.

#### Further information

**Documentation**
- [FAQ: Performance - Scaling](/docs/faq/Performance.md#performance-scaling)

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



<a id="react-mapstate-speed"></a>
### How can I speed up my `mapStateToProps`?

While React Redux does work to minimize the number of times that your `mapStateToProps` function is called, it's still a good idea to ensure that your `mapStateToProps` runs quickly and also minimizes the amount of work it does. The common recommended approach is to create memoized “selector” functions using [Reselect](https://github.com/reactjs/reselect). These selectors can be combined and composed together, and selectors later in a pipeline will only run if their inputs have changed. This means you can create selectors that do things like filtering or sorting, and ensure that the real work only happens if needed.

#### Further information

**Documentation**
- [Recipes: Computed Derived Data](/docs/recipes/ComputingDerivedData.md)

**Articles**
- [Improving React and Redux Performance with Reselect](http://blog.rangle.io/react-and-redux-performance-with-reselect/)

**Discussions**
- [#815: Working with Data Structures](https://github.com/reactjs/redux/issues/815)
- [Reselect #47: Memoizing Hierarchical Selectors](https://github.com/reactjs/reselect/issues/47)


<a id="react-props-dispatch"></a>
### Why don't I have `this.props.dispatch` available in my connected component?

The `connect()` function takes two primary arguments, both optional. The first, `mapStateToProps`, is a function you provide to pull data from the store when it changes, and pass those values as props to your component. The second, `mapDispatchToProps`, is a function you provide to make use of the store's `dispatch` function, usually by creating pre-bound versions of action creators that will automatically dispatch their actions as soon as they are called.

If you do not provide your own `mapDispatchToProps` function when calling `connect()`, React Redux will provide a default version, which simply returns the `dispatch` function as a prop. That means that if you *do* provide your own function, `dispatch` is *not* automatically provided.  If you still want it available as a prop, you need to explicitly return it yourself in your `mapDispatchToProps` implementation.

#### Further information

**Documentation**
- [React Redux API: connect()](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options)

**Discussions**
- [React Redux #89: can i wrap multi actionCreators into one props with name?](https://github.com/reactjs/react-redux/issues/89)
- [React Redux #145: consider always passing down dispatch regardless of what mapDispatchToProps does](https://github.com/reactjs/react-redux/issues/145)
- [React Redux #255: this.props.dispatch is undefined if using mapDispatchToProps](https://github.com/reactjs/react-redux/issues/255)
- [Stack Overflow: How to get simple dispatch from this.props using connect w/ Redux?](http://stackoverflow.com/questions/34458261/how-to-get-simple-dispatch-from-this-props-using-connect-w-redux/34458710])


<a id="react-multiple-components"></a>
### Should I only connect my top component, or can I connect multiple components in my tree?

Early Redux documentation advised that you should only have a few connected components near the top of your component tree.  However, time and experience has shown that that generally requires a few components to know too much about the data requirements of all their descendants, and forces them to pass down a confusing number of props.

The current suggested best practice is to categorize your components as “presentational” or “container” components, and extract a connected container component wherever it makes sense:

> Emphasizing “one container component at the top” in Redux examples was a mistake. Don't take this as a maxim. Try to keep your presentation components separate. Create container components by connecting them when it's convenient. Whenever you feel like you're duplicating code in parent components to provide data for same kinds of children, time to extract a container. Generally as soon as you feel a parent knows too much about “personal” data or actions of its children, time to extract a container.

In fact, benchmarks have shown that more connected components generally leads to better performance than fewer connected components.

In general, try to find a balance between understandable data flow and areas of responsibility with your components.

#### Further information

**Documentation**
- [Basics: Usage with React](/docs/basics/UsageWithReact.md)
- [FAQ: Performance - Scaling](/docs/faq/Performance.md#performance-scaling)

**Articles**
- [Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
- [High-Performance Redux](http://somebody32.github.io/high-performance-redux/)
- [React/Redux Links: Architecture - Redux Architecture](https://github.com/markerikson/react-redux-links/blob/master/react-redux-architecture.md#redux-architecture)
- [React/Redux Links: Performance - Redux Performance](https://github.com/markerikson/react-redux-links/blob/master/react-performance.md#redux-performance)

**Discussions**
- [Twitter: emphasizing “one container” was a mistake](https://twitter.com/dan_abramov/status/668585589609005056)
- [#419: Recommended usage of connect](https://github.com/reactjs/redux/issues/419)
- [#756: container vs component?](https://github.com/reactjs/redux/issues/756)
- [#1176: Redux+React with only stateless components](https://github.com/reactjs/redux/issues/1176)
- [Stack Overflow: can a dumb component use a Redux container?](http://stackoverflow.com/questions/34992247/can-a-dumb-component-use-render-redux-container-component)
