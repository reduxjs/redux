# Using `combineReducers`

## Core Concepts


The most common state shape for a Redux app is a plain Javascript object containing "slices" of domain-specific data at each top-level key.  Similarly, the most common approach to writing reducer logic for that state shape is to have "slice reducer" functions, each with the same `(state, action)` signature, and each responsible for managing all updates to that specific slice of state.  Multiple slice reducers can respond to the same action, independently update their own slice as needed, and the updated slices are combined into the new state object.

Because this pattern is so common, Redux provides the `combineReducers` utility to implement that behavior.  It is an example of a _higher-order reducer_, which takes an object full of slice reducer functions, and returns a new reducer function.

There are several important ideas to be aware of when using `combineReducers`:

- First and foremost, `combineReducers` is simply **a utility function to simplify the most common use case when writing Redux reducers**.  You are *not* required to use it in your own application, and it does *not* handle every possible scenario.  It is entirely possible to write reducer logic without using it, and it is quite common to need to write custom reducer logic for cases that `combineReducer` does not handle.  (See [Beyond `combineReducers`](./05-BeyondCombineReducers.md) for examples and suggestions.)  
- While Redux itself is not opinionated about how your state is organized, `combineReducers` enforces several rules to help users avoid common errors.  (See [`combineReducers`](../../api/combineReducers.md) for details.)
- One frequently asked question is whether Redux "calls all reducers" when dispatching an action.  Since there really is only one root reducer function, the default answer is "no, it does not".  However, `combineReducers` has specific behavior that _does_ work that way.  In order to assemble the new state tree, `combineReducers` will call each slice reducer with its current slice of state and the current action, giving the slice reducer a chance to respond and update its slice of state if needed.  So, in that sense, using `combineReducers` _does_ "call all reducers", or at least all of the slice reducers it is wrapping.
- You can use it at all levels of your reducer structure, not just to create the root reducer.  It's very common to have multiple combined reducers in various places, which are composed together to create the root reducer.


## Defining State Shape

There are two ways to define the initial shape and contents of your store's state.  First, the `createStore` function can take `preloadedState` as its second argument.  This is primarily intended for initializing the store with state that was previously persisted elsewhere, such as the browser's localStorage.  The other way is for the root reducer to return the initial state value when the state argument is `undefined`.  If neither of these is done, the default store state will also be undefined.  If the `preloadedState` argument is provided, then the `state` argument in the root reducer will _not_ be `undefined`, and `preloadedState` will effectively "override" whatever the reducer intended to use as its default value.  This example demonstrates the basic interactions:

```js
import {createStore} from "redux";

const noDefaultStateReducer = state => state;

// No second argument, so the preloadedState parameter is undefined
const emptyStore = createStore(noInitialStateReducer);
console.log(emptyStore.getState());
// undefined

const defaultStateReducer = (state = 5) => state;

const defaultStateStore = createStore(defaultStateReducer);
console.log(defaultStateStore.getState());
// 5

// This time, provide the preloadedState argument
const initializedStore = createStore(defaultStateReducer, 42);

console.log(initializedStore.getState());
// 42

```

As discussed in [Reducers](../../basics/Reducers.md), Redux will dispatch a "dummy" action during startup, which is intended to force the root reducer to return its desired initial state.  The returned initial state value also effectively defines the desired shape of the state, which is generally an object with specific keys and values.


`combineReducers` takes an object full of slice reducer functions, and creates a function that returns a function that outputs a corresponding state object.  This means that the naming of the keys in the input slice reducer object will define the naming of the keys in the output state object.  The correlation between these names is not always apparent, especially when using ES6 features such as default module exports and object literal shorthands.

Also, `combineReducers` will provide its own initial state value if appropriate, which is an empty object.  It will then call each slice reducer with their individual state slices to request their initial data.  Since the object is empty, all of the slices will also be `undefined`, and each slice reducer should then return their own initial state.  However, if an existing object is provided to `combineReducers` as the initial state, then the keys in the existing object will be used as the initial values for the corresponding slice reducers.

This example demonstrates these behaviors:

```js
// reducers.js
export default theDefaultReducer = (state = 0, action) => state;

export const firstNamedReducer = (state = 1, action) => state;

export const secondNamedReducer = (state = 2, action) => state;


// rootReducer.js
import {combineReducers, createStore} from "redux";

// The "default" export can be given any local name we want to use
import renamedDefaultReducerfrom "./reducers";

// Named exports can use the original names, or be renamed
import {firstNamedReducer, secondNamedReducer as renamedSecondReducer} from "./reducers"; 

const rootReducer = combineReducers({
    renamedDefaultReducer,                          // key name same as the variable name
    secondNamedReducer,                             // key name same as the variable name
    someSpecificStateKeyName : firstNamedReducer    // specific key name instead of the variable name
});

const store = createStore(rootReducer);
console.log(store.getState());
// {renamedDefaultReducer : 0, secondNamedReducer : 1, someSpecificStateKeyName : 2}
```

Notice that because we used the ES6 shorthand for defining an object literal, the key names in the resulting state are the same as the variable names from the imports.  However, the resulting names are a bit odd.  It's generally not a good practice to actually include words like "reducer" in your state key names - the keys should simply reflect the domain or type of data they hold.  This means we should either explicitly specify the names of the keys in the slice reducer object to define the keys in the output state object, or carefully rename the variables for the imported slice reducers to set up the keys when using the shorthand object literal syntax.

A better usage might look like:

```js
import {combineReducers, createStore} from "redux";

import defaultState, {firstNamedReducer, secondNamedReducer as secondState} from "./reducers";

const rootReducer = combineReducers({
    defaultState,                   // key name same as the carefully renamed default export
    firstState : firstNamedReducer, // specific key name instead of the variable name
    secondState,                    // key name same as the carefully renamed named export
});

const reducerInitializedStore = createStore(rootReducer);
console.log(reducerInitializedStore.getState());
// {defaultState : 0, firstState : 1, secondState : 2}

// We can also set up initial values for some of the slice reducers
const partiallyPreloadedStore = createStore(rootReducer, {secondState : 123});
console.log(partiallyPreloadedStore.getState());
// {defaultState : 0, firstState : 1, secondState : 123}
```

This state shape better reflects the data involved, because we took care to set up the keys we passed to `combineReducers`.


