# Redux FAQ: Organizing State

## Table of Contents

- [Do I have to put all my state into Redux? Should I ever use React's setState()?](#organizing-state-only-redux-state) 
- [Can I put functions, promises, or other non-serializable items in my store state?](#organizing-state-non-serializable) 
- [How do I organize nested or duplicate data in my state?](#organizing-state-nested-data) 


## Organizing State

<a id="organizing-state-only-redux-state"></a>
### Do I have to put all my state into Redux? Should I ever use React's `setState()`?

There is no “right” answer for this. Some users prefer to keep every single piece of data in Redux, to maintain a fully serializable and controlled version of their application at all times. Others prefer to keep non-critical or UI state, such as “is this dropdown currently open”, inside a component's internal state. 

***Using local component state is fine***.  As a developer, it is _your_ job to determine what kinds of state make up your application, and where each piece of state should live.  Find a balance that works for you, and go with it.

Some common rules of thumb for determining what kind of data should be put into Redux:

- Do other parts of the application care about this data?
- Do you need to be able to create further derived data based on this original data?
- Is the same data being used to drive multiple components?
- Is there value to you in being able to restore this state to a given point in time (ie, time travel debugging)?
- Do you want to cache the data (ie, use what's in state if it's already there instead of re-requesting it)?

There are a number of community packages that implement various approaches for storing per-component state in a Redux store instead, such as [redux-ui](https://github.com/tonyhb/redux-ui), [redux-component](https://github.com/tomchentw/redux-component), [redux-react-local](https://github.com/threepointone/redux-react-local), and more.  It's also possible to apply Redux's principles and concept of reducers to the task of updating local component state as well, along the lines of `this.setState( (previousState) => reducer(previousState, someAction))`.

#### Further information

**Articles**

- [You Might Not Need Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [Finding `state`'s place with React and Redux](https://medium.com/@adamrackis/finding-state-s-place-with-react-and-redux-e9a586630172)
- [A Case for setState](https://medium.com/@zackargyle/a-case-for-setstate-1f1c47cd3f73)
- [How to handle state in React: the missing FAQ](https://medium.com/react-ecosystem/how-to-handle-state-in-react-6f2d3cd73a0c)
- [Where to Hold React Component Data: state, store, static, and this](https://medium.freecodecamp.com/where-do-i-belong-a-guide-to-saving-react-component-data-in-state-store-static-and-this-c49b335e2a00)
- [The 5 Types of React Application State](http://jamesknelson.com/5-types-react-application-state/)

**Discussions**

- [#159: Investigate using Redux for pseudo-local component state](https://github.com/reactjs/redux/issues/159)
- [#1098: Using Redux in reusable React component](https://github.com/reactjs/redux/issues/1098)
- [#1287: How to choose between Redux's store and React's state?](https://github.com/reactjs/redux/issues/1287)
- [#1385: What are the disadvantages of storing all your state in a single immutable atom?](https://github.com/reactjs/redux/issues/1385)
- [Twitter: Should I keep something in React component state?](https://twitter.com/dan_abramov/status/749710501916139520)
- [Twitter: Using a reducer to update a component](https://twitter.com/dan_abramov/status/736310245945933824)
- [React Forums: Redux and global state vs local state](https://discuss.reactjs.org/t/redux-and-global-state-vs-local-state/4187)
- [Reddit: "When should I put something into my Redux store?"](https://www.reddit.com/r/reactjs/comments/4w04to/when_using_redux_should_all_asynchronous_actions/d63u4o8)
- [Stack Overflow: Why is state all in one place, even state that isn't global?](http://stackoverflow.com/questions/35664594/redux-why-is-state-all-in-one-place-even-state-that-isnt-global)
- [Stack Overflow: Should all component state be kept in Redux store?](http://stackoverflow.com/questions/35328056/react-redux-should-all-component-states-be-kept-in-redux-store)

**Libraries**

- [Redux Addons Catalog: Component State](https://github.com/markerikson/redux-ecosystem-links/blob/master/component-state.md)


<a id="organizing-state-non-serializable"></a>
### Can I put functions, promises, or other non-serializable items in my store state?

It is highly recommended that you only put plain serializable objects, arrays, and primitives into your store. It's *technically* possible to insert non-serializable items into the store, but doing so can break the ability to persist and rehydrate the contents of a store, as well as interfere with time-travel debugging.

If you are okay with things like persistence and time-travel debugging potentially not working as intended, then you are totally welcome to put non-serializable items into your Redux store.  Ultimately, it's _your_ application, and how you implement it is up to you.  As with many other things about Redux, just be sure you understand what tradeoffs are involved.

#### Further information

**Discussions**
- [#1248: Is it ok and possible to store a react component in a reducer?](https://github.com/reactjs/redux/issues/1248)
- [#1279: Have any suggestions for where to put a Map Component in Flux?](https://github.com/reactjs/redux/issues/1279)
- [#1390: Component Loading](https://github.com/reactjs/redux/issues/1390)
- [#1407: Just sharing a great base class](https://github.com/reactjs/redux/issues/1407)
- [#1793: React Elements in Redux State](https://github.com/reactjs/redux/issues/1793)


<a id="organizing-state-nested-data"></a>
### How do I organize nested or duplicate data in my state?

Data with IDs, nesting, or relationships should generally be stored in a “normalized” fashion: each object should be stored once, keyed by ID, and other objects that reference it should only store the ID rather than a copy of the entire object. It may help to think of parts of your store as a database, with individual “tables” per item type. Libraries such as [normalizr](https://github.com/paularmstrong/normalizr) and [redux-orm](https://github.com/tommikaikkonen/redux-orm) can provide help and abstractions in managing normalized data.

#### Further information

**Documentation**
- [Advanced: Async Actions](/docs/advanced/AsyncActions.md)
- [Examples: Real World example](/docs/introduction/Examples.html#real-world)
- [Recipes: Structuring Reducers - Prerequisite Concepts](/docs/recipes/reducers/PrerequisiteConcepts.md#normalizing-data)
- [Recipes: Structuring Reducers - Normalizing State Shape](/docs/recipes/reducers/NormalizingStateShape.md)
- [Examples: Tree View](https://github.com/reactjs/redux/tree/master/examples/tree-view)

**Articles**
- [High-Performance Redux](http://somebody32.github.io/high-performance-redux/)
- [Querying a Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)

**Discussions**
- [#316: How to create nested reducers?](https://github.com/reactjs/redux/issues/316)
- [#815: Working with Data Structures](https://github.com/reactjs/redux/issues/815)
- [#946: Best way to update related state fields with split reducers?](https://github.com/reactjs/redux/issues/946)
- [#994: How to cut the boilerplate when updating nested entities?](https://github.com/reactjs/redux/issues/994)
- [#1255: Normalizr usage with nested objects in React/Redux](https://github.com/reactjs/redux/issues/1255)
- [#1269: Add tree view example](https://github.com/reactjs/redux/pull/1269)
- [#1824: Normalising state and garbage collection](https://github.com/reactjs/redux/issues/1824#issuecomment-228585904)
- [Twitter: state shape should be normalized](https://twitter.com/dan_abramov/status/715507260244496384)
- [Stack Overflow: How to handle tree-shaped entities in Redux reducers?](http://stackoverflow.com/questions/32798193/how-to-handle-tree-shaped-entities-in-redux-reducers)
- [Stack Overflow: How to optimize small updates to props of nested components in React + Redux?](http://stackoverflow.com/questions/37264415/how-to-optimize-small-updates-to-props-of-nested-component-in-react-redux)
