# Redux FAQ: Immutable Data

## Table of Contents
- [What are the benefits of immutability?](#benefits-of-immutability)
- [Why is immutability required in Redux?](#why-is-immutability-required)
- [Do I have to use Immutable.JS?](#do-i-have-to-use-immutable-js)
- [What are the issues with using JavaScript for immutable operations?](#issues-with-es6-for-immutable-ops)

<a id="benefits-of-immutability"></a>
## What are the benefits of immutability?

Immutability can bring increased performance to your app, and leads to simpler programming and debugging, as data that never changes is easier to reason about than data that is free to be changed arbitrarily throughout your app.

In particular, immutability in the context of a Web app enables sophisticated change detection techniques to be implemented simply and cheaply, ensuring the computationally expensive process of updating the DOM occurs only when it absolutely has to (a cornerstone of React’s performance improvements over other libraries).


<a id="why-is-immutability-required"></a>
## Why is immutability required by Redux?
There are four key reasons why Redux requires immutability:

- Redux's `combineReducers` utility shallowly checks for reference changes.
- React-Redux's `connect` method generates components that shallowly check reference changes to the root state with the return values from the `mapStateToProps` function to see if the wrapped components actually need to re-render.
- Immutable data management ultimately makes data handling safer.
- Time-travel debugging requires that reducers be pure functions with no side effects, so that you can correctly jump between different states.

In particular, Redux's use of shallow equality checking requires immutability if the store, and any connected components, are to be updated correctly. To see why, we need to understand the difference between shallow and deep equality checking in JavaScript.

### How do shallow and deep equality checking differ?
Shallow equality checking simply checks that two different _variables_ reference the same object; in contrast, deep equality checking must check every _value_ of two objects' properties.

A shallow equality check is therefore as simple (and as fast) as `a === b`, whereas a deep equality check involves a recursive traversal through the properties of two objects, comparing the value of each property at each step. 

It's for this improvement in performance that Redux uses shallow equality checking.

### How does Redux uses shallow equality checking?
Redux shallowly compares the value returned from a reducer with the `state` parameter passed into it. If both objects are the same (i.e. the `state` parameter passed in references the same object as that returned by the reducer), then Redux assumes that the state has not been changed and so will leave the state tree unchanged.

If, however, the returned value differs from the `state` object passed in (i.e. the `state` parameter passed in references a different object from that returned by the reducer), then Redux assumes a change has been made, and so will apply that change to the state tree.

### How does React-Redux uses shallow equality checking?
React-Redux shallowly compares the root state with the return values from the `mapStatToProps` function that is passed to its `connect` method in order to trigger the re-rendering of any affected components when the state is mutated.

If a shallow check of these values is true, React-Redux assumes the state has not changed, and so will not re-render the connected component.

### Why will shallow equality checking not work with mutable objects?
Shallow equality checking cannot be used to detect if a function mutates an object passed into it if that object is mutable.

This is self-evident if you think about it: if two variables reference the same object, they will _always_ be equal, regardless of whether the object changes or not, as they're both referencing the same object. Thus, the following will always return true:


```
function mutateObj(obj) {
	obj.key = 'newValue';
	return obj;
}

const param = { key: 'originalValue' };
const returnVal = mutateObj(param);

param === returnVal;
//> true
```

The shallow check of `param` and `returnValue` simply checks whether both variables reference the same object, which they do.`mutateObj()` may return a mutated version of `obj`, but it's still the same object as that passed in. The fact that its values have been changed within `mutateObj` matters not at all to a shallow check.

### How does shallow equality checking with a mutable object cause problems with Redux?
Redux holds a reference to the `state` object that’s passed into a reducer function, and compares it with the reference that's returned.

Thus, if a reducer mutates any of the properties of the `state` object that's passed in, and then returns a reference to the same _newly mutated_ `state` object, Redux's shallow check of the two references will show them as being equal (although the _values_ within the `state` object have changed, the object reference itself has not - it's still the same `state` object, just with different values.) 

_In this case, Redux will not be aware of any changes in your reducer, and the store will not update._

### How does shallow equality checking with a mutable object cause problems with React-Redux?
React-Redux will be affected if `mapStateToProps` returns an object with a property that references an object whose value has changed, when the object itself has not.

_In this case,  the component will not re-render when it should._

React-Redux performs a shallow check on the values referenced by the props object that is returned from the  `mapStateToProps` function. React-Redux will only re-render the component  if this check is false,  

If, however, these values always reference the same mutable object, then the component will never be re-rendered, regardless of how the mutable object is mutated.

For example, the following `mapStateToProps` function will  never trigger a re-render:

```
let record = { id: 0 };

const getNewRecord = () => {
  ++record.id;
  return record;
}

const mapStateToProps = (state) => ({
	// The object returned from getNewRecord() is always
	// the same object, so this connected
	// component will never re-render
	record: getNewRecord()
});


const a = mapStateToProps();
const b = mapStateToProps();

a.record === b.record
//> true

```



### How does immutability enable a shallow check to detect object mutations?
If an object is immutable, any changes that need to be made to it within a function must be made to a _copy_ of the object. 

This mutated copy is a _separate_ object from that passed into the function, and so when it is returned, a shallow check will identify it as being a different object from that passed in, and so return false.

### What issues can immutability cause with Redux?
If you make a copy of the `state` object that's passed into a reducer, and return this copy, then Redux will think that the state has been updated, as you're returning an entirely different object from the `state` object that was passed in.

However, if you always return a copy of the `state` object passed into your reducer, then Redux will always think the state has been changed, even if it has not, as the object reference that's returned from your reducer is to a _different_ object (the clone) from the `state` object passed in.

### What issues can immutability cause with React-Redux?
If the properties returned from the `mapStateToProps` function always reference a new object, then the connected component will always be re-rendered, even if the values of that new object have not changed. 

<a id="do-i-have-to-use-immutable-js"></a>
## What approaches are there for handling data immutably? Do I have to use Immutable.js? 

You do not need to use Immutable.JS with Redux. Plain JavaScript, if written correctly, is perfectly capable of providing immutability without having to use an immutable-focused library. However, guaranteeing immutability with JavaScript is difficult, and it can be easy to mutate an object accidentally, causing bugs in your app that are extremely difficult to locate. For this reason, using a library such as Immutable.JS can significantly improve the reliability of your app, and make your app’s development much easier.


<a id="issues-with-es6-for-immutable-ops"></a>
## What are the issues with using plain JavaScript for immutable operations?
JavaScript was never designed to provide guaranteed immutable operations. Accordingly, there are several issues you need to be aware of if you choose to use it for your immutable operations in your Redux app.

#### Accidental Object Mutation
With JavaScript, you can accidentally mutate an object (such as the Redux state tree) quite easily without realising it. For example, updating deeply nested properties, creating a new *reference* to an object instead of a new object, or performing a shallow copy rather than a deep copy, can all lead to inadvertent object mutations, and can trip up even the most experienced JavaScript coder. 

To avoid these issues, ensure you follow the recommended [immutable update patterns for ES6](http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html).

#### Verbose Code
Updating complex nested state trees can lead to verbose code that is tedious to write and difficult to debug.

#### Poor Performance
Operating on JavaScript objects and arrays in an immutable way can be slow, particularly as your state tree grows larger.

**Documentation**
- [Immutable Update Patterns for ES6](http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html)
