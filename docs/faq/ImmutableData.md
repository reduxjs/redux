---
id: immutable-data
title: Immutable Data
sidebar_label: Immutable Data
---

## Redux FAQ: Immutable Data

## What are the benefits of immutability?

Immutability can bring increased performance to your app, and leads to simpler programming and debugging, as data that never changes is easier to reason about than data that is free to be changed arbitrarily throughout your app.

In particular, immutability in the context of a Web app enables sophisticated change detection techniques to be implemented simply and cheaply, ensuring the computationally expensive process of updating the DOM occurs only when it absolutely has to (a cornerstone of React’s performance improvements over other libraries).

#### Further information

**Documentation**

- [Redux Toolkit: Writing Reducers with Immer - Immutability and Redux](/toolkit/usage/immer-reducers#immutability-and-redux)
- [React docs: Updating Objects in State](https://react.dev/learn/updating-objects-in-state)

**Articles**

- [Dave Ceddia: The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/)

## Why is immutability required by Redux?

- Both Redux and React-Redux employ [shallow equality checking](#how-do-shallow-and-deep-equality-checking-differ). In particular:
  - Redux's `combineReducers` utility [shallowly checks for reference changes](#how-does-redux-use-shallow-equality-checking) caused by the reducers that it calls.
  - React-Redux's `useSelector` hook [compares the value returned by your selector against the previous value by reference](#how-does-react-redux-use-shallow-equality-checking) to decide whether the component needs to re-render. Such [shallow checking requires immutability](#why-will-shallow-equality-checking-not-work-with-mutable-objects) to function correctly.
- Immutable data management ultimately makes data handling safer.
- Time-travel debugging requires that reducers be pure functions with no side effects, so that you can correctly jump between different states.

#### Further Information

**Documentation**

- [Using Redux: Prerequisite Reducer Concepts](../usage/structuring-reducers/PrerequisiteConcepts.md)

**Discussions**

- [Reddit: Why Redux Needs Reducers To Be Pure Functions](https://www.reddit.com/r/reactjs/comments/5ecqqv/why_redux_need_reducers_to_be_pure_functions/dacmmjh/?context=3)

## Why does Redux’s use of shallow equality checking require immutability?

Redux's use of shallow equality checking requires immutability if any subscribed components are to be updated correctly. To see why, we need to understand the difference between shallow and deep equality checking in JavaScript.

### How do shallow and deep equality checking differ?

Shallow equality checking (or _reference equality_) simply checks that two different _variables_ reference the same object; in contrast, deep equality checking (or _value equality_) must check every _value_ of two objects' properties.

A shallow equality check is therefore as simple (and as fast) as `a === b`, whereas a deep equality check involves a recursive traversal through the properties of two objects, comparing the value of each property at each step.

It's for this improvement in performance that Redux uses shallow equality checking.

#### Further Information

**Articles**

- [Pros and Cons of using immutability with React.js](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### How does Redux use shallow equality checking?

Redux uses shallow equality checking in its `combineReducers` function to return either a new mutated copy of the root state object, or, if no mutations have been made, the current root state object.

#### Further Information

**Documentation**

- [API: combineReducers](../api/combineReducers.md)

#### How does `combineReducers` use shallow equality checking?

The [suggested structure](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers) for a Redux store is to split the state object into multiple "slices" or "domains" by key, and provide a separate reducer function to manage each individual data slice.

`combineReducers` makes working with this style of structure easier by taking a `reducers` argument that’s defined as a hash table comprising a set of key/value pairs, where each key is the name of a state slice, and the corresponding value is the reducer function that will act on it.

So, for example, if your state shape is `{ todos, counter }`, the call to `combineReducers` would be:

```js
combineReducers({ todos: myTodosReducer, counter: myCounterReducer })
```

where:

- the keys `todos` and `counter` each refer to a separate state slice;
- the values `myTodosReducer` and `myCounterReducer` are reducer functions, with each acting on the state slice identified by the respective key.

`combineReducers` iterates through each of these key/value pairs. For each iteration, it:

- creates a reference to the current state slice referred to by each key;
- calls the appropriate reducer and passes it the slice;
- creates a reference to the possibly-mutated state slice that's returned by the reducer.

As it continues through the iterations, `combineReducers` will construct a new state object with the state slices returned from each reducer. This new state object may or may not be different from the current state object. It is here that `combineReducers` uses shallow equality checking to determine whether the state has changed.

Specifically, at each stage of the iteration, `combineReducers` performs a shallow equality check on the current state slice and the state slice returned from the reducer. If the reducer returns a new object, the shallow equality check will fail, and `combineReducers` will set a `hasChanged` flag to true.

After the iterations have completed, `combineReducers` will check the state of the `hasChanged` flag. If it’s true, the newly-constructed state object will be returned. If it’s false, the _current_ state object is returned.

This is worth emphasizing: _If the reducers all return the same `state` object passed to them, then `combineReducers` will return the *current* root state object, not the newly updated one._

#### Further Information

**Documentation**

- [API: combineReducers](../api/combineReducers.md)
- [Redux FAQ - How do I share state between two reducers? do I have to use `combineReducers`?](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)

**Video**

- [Egghead.io: Redux: Implementing combineReducers() from Scratch](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

### How does React-Redux use shallow equality checking?

After every dispatched action, React-Redux runs the selector you passed to `useSelector` against the new root state, and compares the result to the previous result with `===`. If the two values are the same reference, the component does not re-render. If they are different, it does.

That single comparison is why immutability matters on the React side. If a reducer mutates an existing object and returns it, the selector returns the same reference as before, the check passes, and the component does not update even though the data changed. If a selector builds a new object or array on every call (for example, with `array.filter()`), the check fails on every dispatch and the component re-renders even when nothing relevant changed. Both failure modes, and how to fix them, are covered in the React Redux FAQ.

#### Further Information

**Documentation**

- [Redux FAQ: Why isn't my component re-rendering?](./ReactRedux.md#why-isnt-my-component-re-rendering)
- [Redux FAQ: Why is my component re-rendering too often?](./ReactRedux.md#why-is-my-component-re-rendering-too-often)
- [React Redux: `useSelector`](/react-redux/api/hooks#useselector)

### Why will shallow equality checking not work with mutable objects?

Shallow equality checking cannot be used to detect if a function mutates an object passed into it if that object is mutable.

This is because two variables that reference the same object will _always_ be equal, regardless of whether the object’s values changes or not, as they're both referencing the same object. Thus, the following will always return true:

```js
function mutateObj(obj) {
  obj.key = 'newValue'
  return obj
}

const param = { key: 'originalValue' }
const returnVal = mutateObj(param)

param === returnVal
//> true
```

The shallow check of `param` and `returnValue` simply checks whether both variables reference the same object, which they do.`mutateObj()` may return a mutated version of `obj`, but it's still the same object as that passed in. The fact that its values have been changed within `mutateObj` matters not at all to a shallow check.

#### Further Information

**Articles**

- [Pros and Cons of using immutability with React.js](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### Does shallow equality checking with a mutable object cause problems with Redux?

Shallow equality checking with a mutable object will not cause problems with Redux, but [it will cause problems with libraries that depend on the store, such as React-Redux](./ReactRedux.md#why-isnt-my-component-re-rendering).

Specifically, if the state slice passed to a reducer by `combineReducers` is a mutable object, the reducer can modify it directly and return it.

If it does, the shallow equality check that `combineReducers` performs will always pass, as the values of the state slice returned by the reducer may have been mutated, but the object itself has not - it’s still the same object that was passed to the reducer.

Accordingly, `combineReducers` will not set its `hasChanged` flag, even though the state has changed. If none of the other reducers return a new, updated state slice, the `hasChanged` flag will remain set to false, causing `combineReducers` to return the _existing_ root state object.

The store will still be updated with the new values for the root state, but because the root state object itself is still the same object, libraries that bind to Redux, such as React-Redux, will not be aware of the state’s mutation, and so will not re-render the subscribed components.

Redux Toolkit's `configureStore` adds a development-only immutability check middleware that throws an error when a reducer mutates state, so this class of bug is caught immediately rather than showing up as a component that does not update.

#### Further Information

**Documentation**

- [Using Redux: Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [Troubleshooting: The reducer mutated the state](../usage/Troubleshooting.md#the-reducer-mutated-the-state)
- [Redux Toolkit: Immutability Middleware](/toolkit/api/immutabilityMiddleware)

### How does immutability enable a shallow check to detect object mutations?

If an object is immutable, any changes that need to be made to it within a function must be made to a _copy_ of the object.

This mutated copy is a _separate_ object from that passed into the function, and so when it is returned, a shallow check will identify it as being a different object from that passed in, and so will fail.

#### Further Information

**Articles**

- [Pros and Cons of using immutability with React.js](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### How can immutability in your reducers cause components to render unnecessarily?

You cannot mutate an immutable object; instead, you must mutate a copy of it, leaving the original intact.

That’s perfectly OK when you mutate the copy, but in the context of a reducer, if you return a copy that _hasn’t_ been mutated, Redux’s `combineReducers` function will still think that the state needs to be updated, as you're returning an entirely different object from the state slice object that was passed in.

`combineReducers` will then return this new root state object to the store. The new object will have the same values as the current root state object, but because it's a different object, it will cause the store to be updated. Every `useSelector` hook in the app will re-run its selector, and any selector that reads from the copied slice and returns a new reference will re-render its component unnecessarily.

To prevent this from happening, you must _always return the state slice object that’s passed into a reducer if the reducer does not mutate the state._ Reducers generated by `createSlice` do this automatically: Immer returns the original object when no changes were made to the draft.

The same problem applies on the selector side, where a selector that returns a new array or object on every call causes a re-render on every dispatch. See [Why is my component re-rendering too often?](./ReactRedux.md#why-is-my-component-re-rendering-too-often) for that case.

#### Further Information

**Articles**

- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.5hmnwygsy)

## What approaches are there for handling data immutability? Do I have to use Immer?

Redux itself only requires that reducers return new values instead of mutating the existing ones. How you produce those values is up to you.

Redux Toolkit's `createSlice` and `createReducer` use [Immer](https://immerjs.github.io/immer/) internally, so case reducers written with them can use "mutating" syntax and Immer produces the immutable result. This is the approach we recommend, and it is what all of the current Redux tutorials use. Immer is not optional in Redux Toolkit; [Writing Reducers with Immer](/toolkit/usage/immer-reducers) explains how it works, the patterns to follow, the gotchas to avoid, and why it is built in.

If you write reducers by hand without Redux Toolkit, you need to copy every level of nesting that changes using object spreads and non-mutating array methods. [Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md) shows how to do that correctly and lists the mistakes that most often cause accidental mutations. You can also call Immer's `produce` directly inside a hand-written reducer.

#### Further Information

**Documentation**

- [Redux Toolkit: Writing Reducers with Immer](/toolkit/usage/immer-reducers)
- [Using Redux: Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [Redux Toolkit: Immutability Middleware](/toolkit/api/immutabilityMiddleware)

## What are the issues with writing immutable updates by hand?

Writing immutable updates by hand in plain JavaScript has two problems, both of which Immer removes:

- **Accidental mutation.** It is easy to update a nested property, reuse a reference instead of copying, or copy only the top level of an object without realizing it. Accidental mutation is the most common cause of Redux bugs, and it usually shows up as a component that does not re-render. Redux Toolkit's `configureStore` includes a development-only immutability check middleware that throws when a reducer mutates state.
- **Verbose code.** Correctly copying every level of a nested update takes several lines of spreads per level, which hides the intent of the update and gives more places to make a mistake.

See [Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md) for the hand-written patterns and the common mistakes, and [Writing Reducers with Immer](/toolkit/usage/immer-reducers) for how Immer handles the same updates.
