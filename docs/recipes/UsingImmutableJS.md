# Using Immutable.JS with Redux
## Table of Contents
- [Why should I use an immutable-focused library such as Immutable.JS?](#why-use-immutable-library)
- [Why should I choose Immutable.JS as an immutable library?](#why-choose-immutable-js)
- [What are the issues with using Immutable.JS?](#issues-with-immutable-js)
- [Is Immutable.JS worth the effort?](#is-immutable-js-worth-effort)
- [What are some opinionated Best Practices for using Immutable.JS with Redux?](#immutable-js-best-practices)

<a id="why-use-immutable-library"></a>
## Why should I use an immutable-focused library such as Immutable.JS?

Immutable-focused libraries such as Immutable.JS have been designed to overcome the issues with immutability inherent within JavaScript, providing all the benefits of immutability with the performance your app requires. 

Whether you choose to use such a library, or stick with plain JavaScript, depends on how comfortable you are with adding another dependency to your app, or how sure you are that you can avoid the pitfalls inherent within JavaScript’s approach to immutability.

Whichever option you choose, make sure you’re familiar with the concepts of [immutability, side effects and mutation](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation). In particular, ensure you have a deep understanding of what JavaScript does when updating and copying values in order to guard against accidental mutations that will degrade you app’s performance, or break it altogether.

#### Further Information

**Documentation**
- [Recipes: immutability, side effects and mutation](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation)

**Articles**
- [Introduction to Immutable.js and Functional Programming Concepts](https://auth0.com/blog/intro-to-immutable-js/)
- [Pros and Cons of using immutability with React.js](http://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)


<a id="why-choose-immutable-js"></a>
## Why should I choose Immutable.JS as an immutable library?

Immutable.JS was designed to provide immutability in a performant manner in an effort to overcome the limitations of immutability with JavaScript. Its principle advantages include:

#### Guaranteed immutability

Data encapsulated in an Immutable.JS object is never mutated. A new copy is always returned. This contrasts with JavaScript, in which some operations do not mutate your data (e.g. some Array methods, including map, filter, forEach, etc.), but some do (Array’s pop, push, concat, splice, etc.).

#### Rich API

Immutable.JS provides a rich set of immutable objects to encapsulate your data (e.g. Maps, Lists, Sets, Records, etc.), and an extensive set of methods to manipulate it, including methods to sort, filter, and group the data, reverse it, flatten it, and create subsets.

#### Performance

Immutable.JS does a lot work behind the scenes to optimize performance. This is the key to its power, as using immutable data structures can involve a lot of expensive copying. In particular, immutably manipulating large, complex data sets, such as a nested Redux state tree, can generate many intermediate copies of objects, which consume memory and slow down performance as the browser’s garbage collector fights to clean things up.

Immutable.JS avoids this by [cleverly sharing data structures](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.z1g1ofrsi) under the surface, minimizing the need to copy data. It also enables complex chains of operations to be carried out without creating unnecessary (and costly) cloned intermediate data that will quickly be thrown away. 

You never see this, of course - the data you give to an Immutable.JS object is never mutated. Rather, it’s the *intermediate* data generated within Immutable.JS from a chained sequence of method calls that is free to be mutated. You therefore get all the benefits of immutable data structures with none (or very little) of the potential performance hits.

#### Further Information

**Articles**
- [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.6nwctunlc)
- [PDF: JavaScript Immutability - Don’t go changing](https://www.jfokus.se/jfokus16/preso/JavaScript-Immutability--Dont-Go-Changing.pdf)

**Libraries**
- [Immutable.js, persistent data structures and structural sharing](https://facebook.github.io/immutable-js/)


<a id="issues-with-immutable-js"></a>
## What are the issues with using Immutable.JS?

Although powerful, Immutable.JS needs to be used carefully, as it comes with issues of its own. Note, however, that all of these issues can be overcome quite easily with careful coding.

#### Difficult to interoperate with

JavaScript does not provide immutable data structures. As such, for Immutable.JS to provide its immutable guarantees, your data must be encapsulated within an Immutable.JS object (such as a `Map` or a `List`, etc.). Once it’s contained in this way, it’s hard for that data to then interoperate with other, plain JavaScript objects.

For example, you will no longer be able to reference an object’s properties through standard JavaScript dot or bracket notation. Instead, you must reference them via Immutable.JS’s `get()` or `getIn()` methods, which use an awkward syntax that accesses properties via an array of strings, each of which represents a property key.

For example, instead of `myObj.prop1.prop2.prop3`, you would use `myImmutableMap.getIn([‘prop1’, ‘prop2’, ‘prop3’])`. 

This makes it awkward to interoperate not just with your own code, but also with other libraries, such as lodash or ramda, that expect plain JavaScript objects.

Note that Immutable.JS objects do have a `toJS()` method, which returns the data as a plain JavaScript data structure, but this method is extremely slow, and using it extensively will negate the performance benefits that Immutable.JS provides

### Once used, Immutable.JS will spread throughout your codebase

Once you encapsulate your data with Immutable.JS, you have to use Immutable.JS’s `get()` or `getIn()` property accessors to access it. 

This has the effect of spreading Immutable.JS across your entire codebase, including potentially your components, where you may prefer not to have such external dependencies. Your entire codebase must know what is, and what is not, an Immutable.JS object. It also makes removing Immutable.JS from your app difficult in the future, should you ever need to.

This issue can be avoided by [uncoupling your application logic from your data structures](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.z1g1ofrsi), as outlined in the [best practices section](#immutable-js-best-practices) below.

### No Destructuring or Spread Operators

Because you must access your data via Immutable.JS’s own `get()` and `getIn()` methods, you can no longer use JavaScript’s destructuring operator (or the proposed Object spread operator), making your code more verbose.

### Not suitable for small values that change often

Immutable.JS works best for collections of data, and the larger the better. It can be slow when your data comprises lots of small, simple JavaScript objects, with each comprising a few keys of primitive values. 

Note, however, that this does not apply to the Redux state tree, which is (usually) represented as a large collection of data.

### Difficult to Debug

Immutable.JS objects, such as `Map`, `List`, etc., can be difficult to debug, as inspecting such an object will reveal an entire nested hierarchy of Immutable.JS-specific properties that you don’t care about, while your actual data that you do care about is encapsulated several layers deep. 

To resolve this issue, use a browser extension such as the [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog), which surfaces your data in Chrome Dev Tools, and hides Immutable.JS’s properties when inspecting your data.

### Breaks object references, causing poor performance

One of the key advantages of immutability is that it enables shallow equality checking, which dramatically improves performance. 

If two different variables reference the same immutable object, then a simple equality check of the two variables is enough to determine that they are equal, and that the object they both reference is unchanged. The equality check never has to check the values of any of the object’s properties, as it is, of course, immutable.

However, shallow checking will not work if your data encapsulated within an Immutable.JS object is itself an object. This is because Immutable.JS’s `toJS()` method, which returns the data contained within an Immutable.JS object as a JavaScript value, will create a new object every time it’s called, and so break the reference with the encapsulated data.

Accordingly, calling `toJS()` twice, for example, and assigning the result to two different variables will cause an equality check on those two variables to fail, even though the object values themselves haven’t changed.

This is a particular issue if you use `toJS()` in a wrapped component’s `mapStateToProps` function, as React-Redux shallowly compares each value in the returned props object.  For example, the value referenced by the `todos` prop returned from `mapStateToProps` below will always be a different object, and so will fail a shallow equality check.

```
// AVOID .toJS() in mapStateToProps
function mapStateToProps(state) {
  return { 
        todos: state.get('todos').toJS() // Always a new object
    }
}
```

When the shallow check fails, React-Redux will cause the component to re-render. Using `toJS()` in `mapStateToProps` in this way, therefore, will always cause the component to re-render, even if the value never changes, impacting heavily on performance.

This can be prevented by using `toJS()` in a Higher Order Component, as discussed in the [Best Practices section](#immutable-js-best-practices) below.

#### Further Information

**Articles**
- [Immutable.js, persistent data structures and structural sharing](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.hzgz7ghbe)
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.9ucv6hwk4)
- [Building Efficient UI with React and Redux](https://www.toptal.com/react/react-redux-and-immutablejs)

**Chrome Extension**
- [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)


<a id="is-immutable-js-worth-effort"></a>
## Is Using Immutable.JS worth the effort?

Frequently, yes. There are various tradeoffs and opinions to consider, but there are many good reasons to use Immutable.JS. Do not underestimate the difficulty of trying to track down a property of your state tree that has been inadvertently mutated.

Components will both re-render when they shouldn’t, and refuse to render when they should, and tracking down the bug causing the rendering issue is hard, as the component rendering incorrectly is not necessarily the one whose properties are being accidentally mutated.

This problem is caused predominantly by returning a mutated state object from a Redux reducer. With Immutable.JS, this problem simply does not exist, thereby removing a whole class of bugs from your app. 

This, together with its performance and rich API for data manipulation, is why Immutable.JS is worth the effort.

#### Further Information

**Documentation**
- [Troubleshooting: Nothing happens when I dispatch an action](http://redux.js.org/docs/Troubleshooting.html#nothing-happens-when-i-dispatch-an-action)


<a id="immutable-js-best-practices"></a>
## What are some opinionated Best Practices for using Immutable.JS with Redux?

Immutable.JS can provide significant reliability and performance improvements to your app, but it must be used correctly. If you choose to use Immutable.JS (and remember, you are not required to, and there are other immutable libraries you can use), follow these opinionated best practices, and you’ll be able to get the most out of it, without tripping up on any of the issues it can potentially cause.

### Never mix plain JavaScript objects with Immutable.JS  

Never let a plain JavaScript object contain Immutable.JS properties. Equally, never let an Immutable.JS object contain a plain JavaScript object.

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)


### Make your entire Redux state tree an Immutable.JS object

For a Redux app, your entire state tree should be an Immutable.JS object, with no plain JavaScript objects used at all. 

* Create the tree using Immutable.JS’s `fromJS()` function. 

* Use an Immutable.JS-aware version of the `combineReducers` function, such as the one in [redux-immutable](https://www.npmjs.com/package/redux-immutable), as Redux itself expects the state tree to be a plain JavaScript object.

* When adding JavaScript objects to an Immutable.JS Map or List using Immutable.JS’s `update`, `merge` or `set` methods, ensure that the object being added is first converted to an Immutable object using `fromJS()`.

**Example**

```
// avoid
const newObj = { key: value};
const newState = state.setIn(['prop1’], newObj); // <-- newObj has been added as a plain
    // JavaScript object - NOT as an Immutable.JS Map

// recommend
const newObj = { key: value};
const newState = state.setIn(['prop1’], fromJS(newObj)); // <-- newObj is now an
    // Immutable.JS Map
```

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)

**Libraries**
- [redux-immutable](https://www.npmjs.com/package/redux-immutable)


### Use Immutable.JS everywhere except your dumb components

Using Immutable.JS everywhere keeps your code performant. Use it in your smart components, your selectors, your sagas or thunks, action creators, and especially your reducers. 

Do not, however, use Immutable.JS in your dumb components.

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [Smart and Dumb Components in React](http://jaketrent.com/post/smart-dumb-components-react/)

### Limit your use of `toJS()`

`toJS()` is an expensive function and negates the purpose of using Immutable.JS. Avoid its use.

#### Further Information

** Discussions**
- [Lee Byron on Twitter: “Perf tip for #immutablejs…”](https://twitter.com/leeb/status/746733697093668864)

### Your selectors should return Immutable.JS objects

Always.

### Use Immutable.JS objects in your Smart Components

Smart components that access the store via React Redux’s `connect` function must use the Immutable.JS values returned by your selectors.  Make sure you avoid the potential issues this can cause with unnecessary component re-rendering. Memoize your selectors using a library such as reselect if necessary.

#### Further Information

**Documentation**
- [Recipes: Computing Derived Data](http://redux.js.org/docs/recipes/ComputingDerivedData.html)
- [FAQ: Immutable Data](/docs/faq/ImmutableData.html#immutability-issues-with-react-redux)
- [Reselect Documentation: How do I use Reselect with Immutable.js?](https://github.com/reactjs/reselect/#q-how-do-i-use-reselect-with-immutablejs)

**Articles**
- [Redux Patterns and Anti-Patterns](https://tech.affirm.com/redux-patterns-and-anti-patterns-7d80ef3d53bc#.451p9ycfy)

**Libraries**
- [Reselect: Selector library for Redux](https://github.com/reactjs/reselect)

### Never use `toJS()` in `mapStateToProps`

Converting an Immutable.JS object to a JavaScript object using `toJS()` will return a new object every time. If you do this in `mapSateToProps`, you will cause the component to believe that the object has changed every time the state tree changes, and so trigger an unnecessary re-render.

#### Further Information

**Documentation**
- [FAQ: Immutable Data](http://localhost:4000/docs/faq/ImmutableData.html#how-can-immutability-in-mapstatetoprops-cause-components-to-render-unnecessarily)

### Never use Immutable.JS in your Dumb Components

Your dumb components should be pure; that is, they should produce the same output given the same input, and have no external dependencies. If you pass such a component an Immutable.JS object as a prop, you make it dependent upon Immutable.JS to extract the prop’s value and otherwise manipulate it.

Such a dependency renders the component impure, makes testing the component more difficult, and makes reusing and refactoring the component unnecessarily difficult.

#### Further Information

**Articles**
- [Immutable Data Structures and JavaScript](http://jlongster.com/Using-Immutable-Data-Structures-in-JavaScript)
- [Smart and Dumb Components in React](http://jaketrent.com/post/smart-dumb-components-react/)
- [Tips For a Better Redux Architecture: Lessons for Enterprise Scale](https://hashnode.com/post/tips-for-a-better-redux-architecture-lessons-for-enterprise-scale-civrlqhuy0keqc6539boivk2f)

### Use a Higher Order Component to convert your Smart Component’s Immutable.JS props to your Dumb Component’s JavaScript props

Something needs to map the Immutable.JS props in your Smart Component to the pure JavaScript props used in your Dumb Component. That something is a Higher Order Component (HOC) that simply takes the Immutable.JS props from your Smart Component, and converts them using `toJS()` to plain JavaScript props, which are then passed to  your Dumb Component.

Here is an example of such a HOC:

```
import { React } from 'react';
import { Iterable } from 'immutable';

export const toJS = (WrappedComponent) =>
   (wrappedComponentProps) => {
       const KEY = 0;
       const **VALUE = 1;

       const propsJS = Object.entries(wrappedComponentProps)
            .reduce((newProps, wrappedComponentProp)  => {
                newProps[wrappedComponentProp[KEY]] = 
                    Iterable.isIterable(wrappedComponentProp[VALUE]) 
                        ? wrappedComponentProp[VALUE].toJS() 
                        : wrappedComponentProp[VALUE];
                return newProps;
            }, {});

       return <WrappedComponent {...propsJS} />
   };

```

And this is how you would use it in your Smart Component:

```
import { connect } from 'react-redux';

import { toJS } from `./to-js';

import DumbComponent from './dumb.component';

const mapStateToProps = (state) => {
   return {
      /**
      obj is an Immutable object in Smart Component, but it’s converted to a plain 
      JavaScript object by toJS, and so passed to DumbComponent as a pure JavaScript 
      object. Because it’s still an Immutable.JS object here in mapStateToProps, though, 
      there is no issue with errant re-renderings.
      */
       obj: getImmutableObjectFromStateTree(state)
   }
};

export default connect(mapStateToProps)(toJS(DumbComponent));
```
By converting Immutable.JS objects to plain JavaScript values within a HOC, we achieve Dumb Component portability, but without the performance hits of using `toJS()` in the Smart Component.

_Note: if your app requires high performance, you may need to avoid `toJS()` altogether, and so will have to use Immutable.JS in your dumb components. However, for most apps this will not be the case, and the benefits of keeping Immutable.JS out of your dumb components (maintainability, portability and easier testing) will far outweigh any perceived performance improvements of keeping it in._

_In addition, using `toJS` in a Higher Order Component should not cause much, if any, performance degradation, as the component will only be called when the connected component’s props change. As with any performance issue, conduct performance checks first before deciding what to optimise._

#### Further Information

**Documentation**
- [React: Higher-Order Components](https://facebook.github.io/react/docs/higher-order-components.html)

**Articles**
- [React Higher Order Components in depth](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.dw2qd1o1g)

**Discussions**
- [Reddit: acemarke and cpsubrian comments on Dan Abramov: Redux is not an architecture or design pattern, it is just a library.](https://www.reddit.com/r/javascript/comments/4rcqpx/dan_abramov_redux_is_not_an_architecture_or/d5rw0p9/?context=3)

**Gists**
- [cpsubrian: React decorators for redux/react-router/immutable ‘smart’ components](https://gist.github.com/cpsubrian/79e97b6116ab68bd189eb4917203242c#file-tojs-js)

### Use the Immutable Object Formatter Chrome Extension to Aid Debugging

Install the [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog) , and inspect your Immutable.JS data without seeing the noise of Immutable.JS's own object properties.

#### Further Information

**Chrome Extension**
- [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)
