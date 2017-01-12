# Redux FAQ: Immutable Data

## Table of Contents
- [What are the benefits of immutability?](#benefits-of-immutability)
- [Why is immutability required by Redux?](#why-is-immutability-required)
- [Why does Redux’s use of shallow equality checking require immutability?](#redux-shallow-checking-requires-immutability)
	- [How do Shallow and Deep Equality Checking differ?](#shallow-and-deep-equality-checking)
	- [How does Redux use shallow equality checking?](#how-redux-uses-shallow-checking)
	- [How does `combineReducers` use shallow equality checking?](#how-combine-reducers-uses-shallow-checking)
	- [How does React-Redux use shallow equality checking?](#how-react-redux-uses-shallow-checking)
	- [How does React-Redux use shallow equality checking to determine whether a component needs re-rendering?](#how-react-redux-determines-need-for-re-rendering)
	- [Why will shallow equality checking not work with mutable objects?](#no-shallow-equality-checking-with-mutable-objects)
	- [How does shallow equality checking with a mutable object cause problems with Redux?](#shallow-checking-problems-with-redux)
	- [How does shallow equality checking with a mutable object cause problems with React-Redux?](#shallow-checking-problems-with-react-redux)
		- [How does shallow equality checking stop a component from re-rendering when it should?](#shallow-checking-stops-component-re-rendering)
	- [How does immutability enable a shallow check to detect object mutations?](#immutability-enables-shallow-checking)
- [What issues can immutability cause with Redux?](#immutability-issues-with-redux)
- [What issues can immutability cause with React-Redux?](#immutability-issues-with-react-redux)
- [Do I have to use Immutable.JS?](#do-i-have-to-use-immutable-js)
- [What are the issues with using JavaScript for immutable operations?](#issues-with-es6-for-immutable-ops)


<a id="benefits-of-immutability"></a>
## What are the benefits of immutability?
Immutability can bring increased performance to your app, and leads to simpler programming and debugging, as data that never changes is easier to reason about than data that is free to be changed arbitrarily throughout your app.

In particular, immutability in the context of a Web app enables sophisticated change detection techniques to be implemented simply and cheaply, ensuring the computationally expensive process of updating the DOM occurs only when it absolutely has to (a cornerstone of React’s performance improvements over other libraries).


<a id="why-is-immutability-required"></a>
## Why is immutability required by Redux?
- Both Redux and React-Redux employ [shallow equality checking](#shallow-and-deep-equality-checking) to determine whether the store needs updating, or a component needs re-rendering. In particular:
	- Redux's `combineReducers` utility [shallowly checks for reference changes] (#how-redux-uses-shallow-checking)  caused by the reducers that it calls.
	- React-Redux's `connect` method generates components that [shallowly check reference changes to the root state](#how-react-redux-uses-shallow-checking) with the return values from the `mapStateToProps` function to see if the wrapped components actually need to re-render.
Such [shallow checking requires immutability](#￼redux-shallow-checking-requires-immutability) to function correctly.
- Immutable data management ultimately makes data handling safer.
- Time-travel debugging requires that reducers be pure functions with no side effects, so that you can correctly jump between different states.


<a id="redux-shallow-checking-requires-immutability"></a>
## Why does Redux’s use of shallow equality checking require immutability?
Redux's use of shallow equality checking requires immutability if any connected components are to be updated correctly. To see why, we need to understand the difference between shallow and deep equality checking in JavaScript.


<a id="shallow-and-deep-equality-checking"></a>
### How do shallow and deep equality checking differ?
Shallow equality checking simply checks that two different _variables_ reference the same object; in contrast, deep equality checking must check every _value_ of two objects' properties.

A shallow equality check is therefore as simple (and as fast) as `a === b`, whereas a deep equality check involves a recursive traversal through the properties of two objects, comparing the value of each property at each step. 

It's for this improvement in performance that Redux uses shallow equality checking.


<a id="how-redux-uses-shallow-checking"></a>
### How does Redux use shallow equality checking?
Redux uses shallow equality checking in its `combineReducers` function, in order to determine whether to return a new mutated root state object, or, if no mutations have been made, the current root state object.  

*If the current root state object is returned by `combineReducers`, the store will not be updated.*


<a id=“how-combine-reducers-uses-shallow-checking”></a>
#### How does `combineReducers` use shallow equality checking?
The [suggested structure](http://redux.js.org/docs/faq/Reducers.html#reducers-share-state) for a Redux store is to split the state object into multiple "slices" or "domains" by key, and provide a separate reducer function to manage each individual data slice.

`combineReducers` makes working with this style of structure easier by taking a  `reducers` argument that’s defined as a hash table comprising a set of key/value pairs, where each key is the name of a state slice, and the corresponding value is the reducer function that will act on it.

So, for example, if your state shape is `{ todos, counter }`, the call to `combineReducers` would be:
```
 combineReducers({ todos: myTodosReducer, counter: myCounterReducer })
```

where:
- the keys  `todos` and `counter` each refer to a separate state slice;
- the values `myTodosReducer` and `myCounterReducer` are reducer functions, with each acting on the state slice identified by the respective key.

`combineReducers` iterates through each of these key/value pairs. For each iteration, it:
- creates a reference to the current state slice referred to by each key;
- calls the  appropriate reducer and passes it the slice;
- creates a reference to the possibly-mutated state slice that's returned by the reducer.

As  it continues through the iterations, `combineReducers` will construct a new state object with the state slices returned from each reducer. This new state object may or may not be different from the current state object. It is here that `combineReducers` uses shallow equality checking to determine whether the state has changed.

Specifically, at each stage of the iteration, `combineReducers` performs a shallow equality check on the current state slice and the state slice returned from the reducer. If the reducer returns a new object, the shallow equality check will fail, and `combineReducers` will set a `hasChanged` flag to true. 

After the iterations have completed, `combineReducers` will check the state of the `hasChanged` flag. If it’s true, the newly-constructed state object will be returned. If it’s false, the _current_ state object is returned.

This is worth emphasising: *If the reducers all return the same `state` object passed to them, then `combineReducers` will return the current root state object, not the newly updated one, and the store will not be updated.*


<a id="how-react-redux-uses-shallow-checking"></a>
### How does React-Redux use shallow equality checking?
React-Redux uses shallow equality checking in its `connect` function to determine whether the component it is wrapping needs to be re-rendered.

To do this, it assumes that the wrapped component is pure; that is, that the component will produce the [same results given the same props and state](https://github.com/reactjs/react-redux/blob/f4d55840a14601c3a5bdc0c3d741fc5753e87f66/docs/troubleshooting.md#my-views-arent-updating-when-something-changes-outside-of-redux)

By assuming the wrapped component is pure, `connect` need only check whether the root state object or the values returned from `mapStateToProps` have changed. If they haven’t, the wrapped component does not need re-rendering.

`connect` performs this check by first keeping a reference to the root state object, and a reference to _each value_ in the props object that's returned from the `mapStateToProps` function.

This is an important point worth noting:  *`connect` performs a shallow equality check on each value within the props object, not on the props object itself.*

It does this because the object returned  from `mapStateToProps` is actually a hash of prop names and either prop values or selector functions that are used to retrieve or generate the values, such as in this example:

```
function mapStateToProps(state) {
  return { 
		todos: state.todos, // prop value
		visibleTodos: getVisibleTodos(state) // selector
	}
}

export default connect(mapStateToProps)(TodoApp)
```

As such, a shallow equality check of the object returned from repeated calls to `mapStateToProps` would always fail, as a new object would be returned each time.

`connect` therefore maintains separate references to each _value_ in the returned object. When deciding whether or not the component needs re-rendering, it will perform a shallow equality check on each value within the object individually, and only re-render if one of those checks fails.

For example, if `state.todos` and the value returned from `getVisibleTodos()` do not change on successive calls to `connect` in the example above, then the component will not re-render .

Conversely,  in the following example, the component will always re-render, as the value of `todos` is always a new object, regardless of whether or not its values change:

```
// AVOID - will always cause a re-render
function mapStateToProps(state) {
  return { 
		// todos always references a newly-created object
		todos: {
			all: state.todos,
			visibleTodos: getVisibleTodos(state)
		}
	}
}

export default connect(mapStateToProps)(TodoApp)
```


<a id=“how-react-redux-determines-need-for-re-rendering"></a>
### How does React-Redux use shallow equality checking to determine whether a component needs re-rendering?
Each time  `connect` is called, it will perform a shallow equality check on its stored reference to the root state object, and the current root state object passed to it from the store. If the check passes, the root state object has not been updated, and so there is no need to re-render the component, or even call `mapStateToProps`.

If the check fails, however, the root state object _has_ been updated, and so `connect` will call `mapStateToProps`to see if the props for the wrapped component have been updated. 

It will perform a final shallow equality check on the new values returned from  `mapStateToProps`, and the previous values it kept a reference to, and will only permit the component to be re-rendered if the check fails. 


<a id="no-shallow-equality-checking-with-mutable-objects"></a>
### Why will shallow equality checking not work with mutable objects?
Shallow equality checking cannot be used to detect if a function mutates an object passed into it if that object is mutable.

This is because two variables that reference the same object will _always_ be equal, regardless of whether the object changes or not, as they're both referencing the same object. Thus, the following will always return true:


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


<a id="shallow-checking-problems-with-redux"></a>
### How does shallow equality checking with a mutable object cause problems with Redux?
If the state slice passed to a reducer by `combineReducers` is a mutable object, the reducer can modify it directly and return it. 

If it does, the shallow equality check that `combineReducers` performs will always pass, as the values of the state slice returned by the reducer may have been mutated, but the object itself has not - it’s still the same object that was passed to the reducer.

Accordingly, `combineReducers` will not set its `hasChanged` flag, even though the state has changed. If none of the other reducers return a new, updated state slice, the `hasChanged` flag will remain set to false, causing `combineReducers` to return the _existing_ unmodified state object.

*The state, therefore, will not be updated, even though its values should have changed.*


<a id="shallow-checking-problems-with-react-redux"></a>
### How does shallow equality checking with a mutable object cause problems with React-Redux?
React-Redux performs a shallow check on each of the values of the props object returned from the  `mapStateToProps` function. React-Redux will only re-render the component if this check fails.

If, however, a mutable object is used, then the component may not re-render when it should. Note that, conversely, if an immutable object is used, the [component may re-render when it should not](#immutability-issues-with-react-redux).


<a id="shallow-checking-stops-component-re-rendering"></a>
####  How can shallow equality checking stop a component from re-rendering when it should?
If each value in the props object references its own mutable object, and each mutable object never changes, then the component will never be re-rendered, regardless of whether or not the object’s values have been mutated.

As we’ve seen, the values in the mutable objects may have changed, but the objects themselves have not, and shallow equality checking only compares the objects themselves, not their values.

For example, the following `mapStateToProps` function will  never trigger a re-render:

```
let record = { id: 0 };

const getNewRecord = () => {
  ++record.id;
  return record;
}

const mapStateToProps = (state) => ({
	// The object returned from getNewRecord() is always
	// the same object, so this wrapped
	// component will never re-render
	record: getNewRecord()
});


const a = mapStateToProps();
const b = mapStateToProps();

a.record === b.record
//> true

```


<a id="immutability-enables-shallow-checking"></a>
### How does immutability enable a shallow check to detect object mutations?
If an object is immutable, any changes that need to be made to it within a function must be made to a _copy_ of the object. 

This mutated copy is a _separate_ object from that passed into the function, and so when it is returned, a shallow check will identify it as being a different object from that passed in, and so return false.


<a id="immutability-issues-with-redux"></a>
### What issues can immutability cause with Redux?
You cannot mutate an immutable object; instead, you must mutate a copy of it, leaving the original intact.

That’s perfectly OK when you mutate the copy, but in the context of a reducer, if you return a copy that _hasn’t_ been mutated, Redux’s `combineReducers` function will still think that the state needs to be updated, as you're returning an entirely different object from the state slice object that was passed in.

`combineReducers` will then return this new root state object to the store. The new object will have the same values as the current root state object, but because it's a different object, it will cause the store to be updated, which will ultimately cause all connected components to be re-rendered unnecessarily.

To prevent this from happening, you must *always return the state slice object that’s passed into a reducer if the reducer does not mutate the state.*


<a id="immutability-issues-with-react-redux"></a>
### What issues can immutability cause with React-Redux?
If the values in the props object that’s returned from the `mapStateToProps` function always reference a new object (or Array), then the wrapped component will always be re-rendered, even if the values of that new object have not changed. 

For example, the following  will always trigger a re-render:

```
// A JavaScript array's 'filter' method treats the array as immutable,
// and returns a filtered copy of the array
const getVisibleTodos = (todos) => todos.filter(t => !t.completed);

const state = {
  todos: [
    {
      text: 'do todo 1',
      completed: false
    },
    {
 	  text: 'do todo 2',
      completed: true
    }]
}
    
      
const mapStateToProps = (state) => ({
	// getVisibleTodos() always returns a new array, and so the 
	// 'visibleToDos' prop will always reference a different array, 
    // causing the wrapped component to re-render, even if the array's
    // values haven't changed
	visibleToDos: getVisibleTodos(state.todos)
})

const a = mapStateToProps(state);
const b = mapStateToProps(state);

a.visibleToDos;
//> { "completed": false, "text": "do todo 1" }

b.visibleToDos;
//> { "completed": false, "text": "do todo 1" }

a.visibleToDos === b.visibleToDos;
//> false
```


Note that, conversely, if the values in your props object refer to mutable objects, [your component may not render when it should](#shallow-checking-stops-component-re-rendering).


<a id="do-i-have-to-use-immutable-js"></a>
## What approaches are there for handling data immutably? Do I have to use Immutable.js? 
You do not need to use Immutable.JS with Redux. Plain JavaScript, if written correctly, is perfectly capable of providing immutability without having to use an immutable-focused library. 

However, guaranteeing immutability with JavaScript is difficult, and it can be easy to mutate an object accidentally, causing bugs in your app that are extremely difficult to locate. For this reason, using an immutable update utility library such as Immutable.JS can significantly improve the reliability of your app, and make your app’s development much easier.


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

Remember, to change an immutable object, you must mutate a _copy_ of it, and copying large objects can be slow as every property must be copied.

In contrast, immutable libraries such as Immutable.js can employ sophisticated optimization techniques such as [structural sharing]( http://www.slideshare.net/mohitthatte/a-deep-dive-into-clojures-data-structures-euroclojure-2015) , which effectively returns a new object that reuses much of the existing object being copied from.

For copying very large objects, [plain JavaScript can be over 100 times slower](https://medium.com/@dtinth/immutable-js-persistent-data-structures-and-structural-sharing-6d163fbd73d2#.z1g1ofrsi) than an optimized immutable library.

**Documentation**
- [Immutable Update Patterns for ES6](http://redux.js.org/docs/recipes/reducers/ImmutableUpdatePatterns.html)
