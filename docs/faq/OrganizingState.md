# Redux FAQ: Organizing State

## Table of Contents

- [Do I have to put all my state into Redux? Should I ever use React's setState()?](#organizing-state-only-redux-state) 
- [Can I put functions, promises, or other non-serializable items in my store state?](#organizing-state-non-serializable) 
- [How do I organize nested or duplicate data in my state?](#organizing-state-nested-data) 


## Organizing State

<a id="organizing-state-only-redux-state"></a>
### Do I have to put all my state into Redux? Should I ever use React's `setState()`?

There is no “right” answer for this. Some users prefer to keep every single piece of data in Redux, to maintain a fully serializable and controlled version of their application at all times. Others prefer to keep non-critical or UI state, such as “is this dropdown currently open”, inside a component's internal state. Find a balance that works for you, and go with it.

There are a number of community packages that implement various approaches for storing per-component state in a Redux store instead, such as [redux-ui](https://github.com/tonyhb/redux-ui), [redux-component](https://github.com/tomchentw/redux-component), [redux-react-local](https://github.com/threepointone/redux-react-local), and more.

#### Further information

**Discussions**

- [#159: Investigate using Redux for pseudo-local component state](https://github.com/reactjs/redux/issues/159)
- [#1098: Using Redux in reusable React component](https://github.com/reactjs/redux/issues/1098)
- [#1287: How to choose between Redux's store and React's state?](https://github.com/reactjs/redux/issues/1287)
- [#1385: What are the disadvantages of storing all your state in a single immutable atom?](https://github.com/reactjs/redux/issues/1385)
- [Stack Overflow: Why is state all in one place, even state that isn't global?](http://stackoverflow.com/questions/35664594/redux-why-is-state-all-in-one-place-even-state-that-isnt-global)
- [Stack Overflow: Should all component state be kept in Redux store?](http://stackoverflow.com/questions/35328056/react-redux-should-all-component-states-be-kept-in-redux-store)

<a id="organizing-state-non-serializable"></a>
### Can I put functions, promises, or other non-serializable items in my store state?

It is highly recommended that you only put plain serializable objects, arrays, and primitives into your store. It's *technically* possible to insert non-serializable items into the store, but doing so can break the ability to persist and rehydrate the contents of a store.

#### Further information

**Discussions**
- [#1248: Is it ok and possible to store a react component in a reducer?](https://github.com/reactjs/redux/issues/1248)
- [#1279: Have any suggestions for where to put a Map Component in Flux?](https://github.com/reactjs/redux/issues/1279)
- [#1390: Component Loading](https://github.com/reactjs/redux/issues/1390)
- [#1407: Just sharing a great base class](https://github.com/reactjs/redux/issues/1407)

<a id="organizing-state-nested-data"></a>
### How do I organize nested or duplicate data in my state?

Data with IDs, nesting, or relationships should generally be stored in a “normalized” fashion: each object should be stored once, keyed by ID, and other objects that reference it should only store the ID rather than a copy of the entire object. It may help to think of parts of your store as a database, with individual “tables” per item type. Libraries such as [normalizr](https://github.com/gaearon/normalizr) and [redux-orm](https://github.com/tommikaikkonen/redux-orm) can provide help and abstractions in managing normalized data.

#### Further information

**Documentation**
- [Advanced: Async Actions](/docs/advanced/AsyncActions.md)
- [Examples: Real World example](/docs/introduction/Examples.html#real-world)

**Discussions**
- [#316: How to create nested reducers?](https://github.com/reactjs/redux/issues/316)
- [#815: Working with Data Structures](https://github.com/reactjs/redux/issues/815)
- [#946: Best way to update related state fields with split reducers?](https://github.com/reactjs/redux/issues/946)
- [#994: How to cut the boilerplate when updating nested entities?](https://github.com/reactjs/redux/issues/994)
- [#1255: Normalizr usage with nested objects in React/Redux](https://github.com/reactjs/redux/issues/1255)
- [Twitter: state shape should be normalized](https://twitter.com/dan_abramov/status/715507260244496384)