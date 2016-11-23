# Redux FAQ: Immutable Data

## Table of Contents
- [What are the benefits of Immutability?](#benefits-of-immutability)
- [Why is immutability required in Redux?](#why-is-immutability-required)
- [Do I have to use Immutable.JS?](#do-i-have-to-use-immutable-js)
- [What are the issues with using ES6 for immutable operations?](#issues-with-es6-for-immutable-ops)
- [Why should I use an immutable-focused library such as Immutable.JS?](#why-use-immutable-library)
- [Why should I choose Immutable.JS as an immutable library?](#why-choose-immutable-js)
- [What are the issues with using Immutable.JS?](#issues-with-immutable-js)
- [Is Immutable.JS worth the effort?](#is-immutable-js-worth-effort)
- [What are the Recommended Best Practices for using Immutable.JS with Redux?](#immutable-js-best-practices)

<a id="benefits-of-immutability"></a>
## What are the benefits of immutability?

Immutability can bring increased performance to your app, and leads to simpler programming and debugging, as data that never changes is easier to reason about than data that is free to be changed arbitrarily throughout your app.

In particular, immutability in the context of a Web app enables sophisticated change detection techniques to be implemented simply and cheaply, ensuring the computationally expensive process of updating the DOM occurs only when it absolutely has to (a cornerstone of React’s performance improvements over other libraries).
<a id="why-is-immutability-required"></a>
## Why is immutability required in Redux?

In the context of Redux, if your reducers mutate their arguments and directly modify the state tree, you will cause React Redux’s `connect` function to break, as it will be unable to detect changes made to objects and arrays. You MUST therefore use immutable operations in your reducers when using Redux.
<a id="do-i-have-to-use-immutable-js"></a>
## Do I have to use Immutable.JS?

You do not need to use Immutable.JS with Redux. ES6, if written correctly, is perfectly capable of providing immutability without having to use an immutable-focused library. However, guaranteeing immutability with ES6 is difficult, and it can be easy to mutate an object accidentally, causing bugs in your app that are extremely difficult to locate. For this reason, using a library such as Immutable.JS can significantly improve the reliability of your app, and make your app’s development much easier.
<a id="issues-with-es6-for-immutable-ops"></a>
## What are the issues with using ES6 for immutable operations?
ES6 was never designed to provide guaranteed immutable operations. Accordingly, there are several issues you need to be aware of if you choose to use ES6 for your Immutable operations in your Redux app.
#### Accidental Object Mutation
With ES6, you can accidentally mutate an object (such as the Redux state tree) quite easily without realising it. For example, updating deeply nested properties, creating a new *reference* to an object instead of a new object, or performing a shallow copy rather than a deep copy, can all lead to inadvertent object mutations, and can trip up even the most experienced JavaScript coder. 

To avoid these issues, ensure you follow the recommended [Immutable Update Patterns for ES6](http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html).

#### Verbose Code
Updating complex nested state trees can lead to verbose code that is tedious to write and difficult to debug.

#### Poor Performance
Operating on ES6 objects and arrays in an immutable way can be slow, particularly as your state tree grows larger.

**Documentation**
- [Immutable Update Patterns for ES6](http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html)

<a id="why-use-immutable-library"></a>
## Why should I use an immutable-focused library such as Immutable.JS?

Immutable-focused libraries such as Immutable.js have been designed to overcome the issues with immutability inherent within ES6, providing all the benefits of immutability with the performance your app requires. Whether you choose to use such a library, or stick with ES6, depends on how comfortable you are with adding another dependency to your app, or how sure you are that you can avoid the pitfalls inherent within ES6’s approach to immutability.

Whichever option you choose, make sure you’re familiar with the concepts of [immutability, side effects and mutation](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation). In particular, ensure you have a deep understanding of what ES6 does when updating and copying values in order to guard against accidental mutations that will degrade you app’s performance, or break it altogether.

**Documentation**
- [immutability, side effects and mutation](http://redux.js.org/docs/recipes/reducers/PrerequisiteConcepts.html#note-on-immutability-side-effects-and-mutation)

<a id="why-choose-immutable-js"></a>
## Why should I choose Immutable.JS as an immutable library?

Immutable.JS was designed to provide immutability in a performant manner in an effort to overcome the limitations of immutability with ES6. Its principle advantages include:

#### Guaranteed immutability

Data encapsulated in an Immutable.JS object is never mutated. A new copy is always returned. This contrasts with ES6, in which some operations do not mutate your data (e.g. some Array methods, inlcuding map, filter, forEach, etc.), but some do (Array’s pop, push, concat, splice, etc.).

#### Rich API

Immutable.JS provides a rich set of immutable objects to encapsulate your data (e.g. Maps, Lists, Sets, Records, etc.), and an extensive set of methods to manipulate it, including methods to sort, filter, and group the data, reverse it, flatten it, and create subsets.

#### Performance

Immutable.JS does a lot work behind the scenes to optimize performance. This is the key to its power, as using immutable data structures can involve a lot of expensive copying. In particular, immutably manipulating large, complex data sets, such as a nested Redux state tree, can generate many intermediate copies of objects, which consume memory and slow down performance as the browser’s garbage collector fights to clean things up.

Immutable.JS avoids this by cleverly sharing data structures under the surface, minimizing the need to copy data. It also enables complex chains of operations to be carried out without creating unnecessary (and costly) cloned intermediate data that will quickly be thrown away. 

You never see this, of course - the data you give to an Immutable.JS object is never mutated. Rather, it’s the *intermediate* data generated within Immutable.JS from a chained sequence of method calls that is free to be mutated. You therefore get all the benefits of immutable data structures with none (or very little) of the potential performance hits.
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

Once you encapsulate your data with Immutable.JS, you have to use Immutable.JS’s `get()` or `getIn()` property accessors to access it. This has the effect of spreading Immutable.JS across your entire codebase, including potentially your components, where you may prefer not to have such external dependencies. Your entire codebase must know what is, and what is not, an Immutable.JS object. It also makes removing Immutable.JS from your app difficult in the future, should you ever need to.

This issue can be avoided with careful coding techniques, as outlined in the [best practices section](#immutable-js-best-practices) below.

### No ES6 Destructuring or Spread Operators

Because you have to access your data via Immutable.JS’s own `get()` and `getIn()` methods, you can no longer use ES6’s destructuring and spread operators, making your code more verbose.

### Not suitable for small values that change often

Immutable.JS works best for collections of data, and the larger the better. It can be slow when your data comprises lots of small, simple JavaScript objects, with each comprising a few keys of primitive values. Note, however, that this does not apply to the Redux state tree, which is represented as a large collection of data.

### Difficult to Debug

Immutable.JS objects, such as `Map`, `List`, etc., can be difficult to debug, as inspecting such an object will reveal an entire nested hierarchy of Immutable.JS-specific properties that you don’t care about, while your actual data that you do care about is encapsulated several layers deep. 

Fortunately, this can be easily overcome with the use of a browser extension such as the [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog), which surfaces your data in Chrome Dev Tools, and hides Immutable.JS’s properties when inspecting your data.

### Breaks object references, causing poor performance

One of the key advantages of immutability is that it enables shallow equality checking, which dramatically improves performance. If two different variables reference the same immutable object, then a simple equality check of the two variables is enough to determine that they are equal, and that the object they both reference is unchanged. The equality check never has to check the values of any of the object’s properties, as it is, of course, immutable.

However, such shallow checking of object equality will not work if your data encapsulated within an Immutable.JS object is itself an object. This is because Immutable.JS’s `toJS()` method, which returns the data contained within an Immutable.js object as a JavaScript value, will create a new object every time it’s called, and so break the reference with the encapsulated data. Accordingly, calling `.toJS()` twice, for example, and assigning the result to two different variables will cause an equality check on those two variables to fail, even though the object values themselves haven’t changed.

This, in turn, causes React’s `shouldComponentUpdate` method (and hence Redux’s `connect` function) to return true every time, causing an unchanged component to be re-rendered every time a change elsewhere in the app is detected, and so  severely degrading performance.

Again, though, this can be prevented quite easily with careful coding, as described in the [Best Practices section](#immutable-js-best-practices) below.
<a id="is-immutable-js-worth-effort"></a>
## Is Using Immutable.JS worth the effort?

Yes. Do not underestimate the difficulty of trying to track down a property of your state tree that has been inadvertently mutated. Components will both re-render when they shouldn’t, and refuse to render when they should, and tracking down the bug causing the rendering issue is hard, as the component rendering incorrectly is not necessarily the one whose properties are being accidentally mutated.

This problem is caused predominantly by bugs in a Redux reducer, which requires immutability. If you mutate your state in a reducer, it can affect a completely different part of your app in seemingly arbitrary ways.

With Immutable.JS, this problem simply does not exist, thereby removing a whole class of bugs from your app. This, together with its performance and rich API for data manipulation, is why Immutable.JS is worth the effort.
<a id="immutable-js-best-practices"></a>
## What are the Recommended Best Practices for using Immutable.JS with Redux?

Immutable.JS can provide significant reliability and performance improvements to your app, but it must be used correctly. Follow these best practices, and you’ll be able to get the most out of it, without tripping up on any of the issues it can potentially cause.

#### Never mix plain JavaScript objects with Immutable.JS  

Never let a plain JavaScript object contain Immutable.JS properties. Equally, never let an Immutable.JS object contain a plain JavaScript object.

#### Make your entire Redux state tree an Immutable.js object

For a Redux app, your entire state tree should be an Immutable.JS object, with no plain JavaScript objects used at all. 

* Create the tree using Immutable.JS’s `fromJS()` function. 

* Use an Immutable.js-aware version of the `combineReducers` function, such as the one in [redux-immutable](https://www.npmjs.com/package/redux-immutable), as Redux itself expects the state tree to be a plain JavaScript object.

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

#### Use Immutable.JS everywhere except your dumb components

Using Immutable.JS everywhere keeps your code performant. Use it in your smart components, your selectors, your sagas or thunks, action creators, and especially your reducers. 

Do NOT, however, use Immutable.JS in your dumb components.

#### Limit your use of `toJS()`

`toJS()` is an expensive function and negates the purpose of using Immutable.JS. Avoid its use.

#### Your selectors should return Immutable.JS objects

Always.

#### Use Immutable.JS objects in your Smart Components

Smart components that access the store via React Redux’s `connect` function must use the Immutable.JS values returned by your selectors. 

#### Never use `toJS()` in `mapStateToProps`

Converting an Immutable.JS object to a JavaScript object using `toJS()` will return a new object every time. If you use do this in `mapSateToProps`, you will cause the component to believe that the object has changed every time the state tree changes, and so trigger an unnecessary re-render.

#### Never use Immutable.JS in your Dumb Components

Your dumb components should rely solely on JavaScript. Using Immutable.JS in your components adds an extra dependency and stops them from being portable.

#### Use a Higher Order Component to convert your Smart Component’s Immutable.JS props to your Dumb Component’s JavaScript props

Something needs to map the Immutable.JS props in your Smart Component to the pure JavaScript props used in your Dumb Component. That something is a Higher Order Component (HOC) that simply takes the Immutable.JS props from your Smart Component, and converts them using `toJS()` to plain JavaScript props, which are then passed to  your Dumb Compnent.

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

#### Use the Immutable Object Formatter Chrome Extension to Aid Debugging

Install the [Immutable Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog) , and inspect your Immutable.JS data without seeing the noise of Immutable.JS's own object properties.

