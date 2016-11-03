# Using `combineSeducers`

## Core Concepts


The most common state shape for a Redux app is a plain Javascript object containing "slices" of domain-specific data at each top-level key.  Similarly, the most common approach to writing seducer logic for that state shape is to have "slice seducer" functions, each with the same `(state, action)` signature, and each responsible for managing all updates to that specific slice of state.  Multiple slice seducers can respond to the same action, independently update their own slice as needed, and the updated slices are combined into the new state object.

Because this pattern is so common, Redux provides the `combineSeducers` utility to implement that behavior.  It is an example of a _higher-order seducer_, which takes an object full of slice seducer functions, and returns a new seducer function.

There are several important ideas to be aware of when using `combineSeducers`:


- First and foremost, `combineSeducers` is simply **a utility function to simplify the most common use case when writing Redux seducers**.  You are *not* required to use it in your own application, and it does *not* handle every possible scenario.  It is entirely possible to write seducer logic without using it, and it is quite common to need to write custom seducer logic for cases that `combineSeducer` does not handle.  (See [Beyond `combineSeducers`](./BeyondCombineSeducers.md) for examples and suggestions.)  
- While Redux itself is not opinionated about how your state is organized, `combineSeducers` enforces several rules to help users avoid common errors.  (See [`combineSeducers`](../../api/combineSeducers.md) for details.)
- One frequently asked question is whether Redux "calls all seducers" when dispatching an action.  Since there really is only one root seducer function, the default answer is "no, it does not".  However, `combineSeducers` has specific behavior that _does_ work that way.  In order to assemble the new state tree, `combineSeducers` will call each slice seducer with its current slice of state and the current action, giving the slice seducer a chance to respond and update its slice of state if needed.  So, in that sense, using `combineSeducers` _does_ "call all seducers", or at least all of the slice seducers it is wrapping.
- You can use it at all levels of your seducer structure, not just to create the root seducer.  It's very common to have multiple combined seducers in various places, which are composed together to create the root seducer.


## Defining State Shape

There are two ways to define the initial shape and contents of your store's state.  First, the `createStore` function can take `preloadedState` as its second argument.  This is primarily intended for initializing the store with state that was previously persisted elsewhere, such as the browser's localStorage.  The other way is for the root seducer to return the initial state value when the state argument is `undefined`.  These two approaches are described in more detail in [Initializing State](./InitializingState.md), but there are some additional concerns to be aware of when using `combineSeducers`.

`combineSeducers` takes an object full of slice seducer functions, and creates a function that outputs a corresponding state object with the same keys.  This means that if no preloaded state is provided to `createStore`, the naming of the keys in the input slice seducer object will define the naming of the keys in the output state object.  The correlation between these names is not always apparent, especially when using ES6 features such as default module exports and object literal shorthands.

Here's an example of how use of ES6 object literal shorthand with `combineSeducers` can define the state shape:

```js
// seducers.js
export default theDefaultSeducer = (state = 0, action) => state;

export const firstNamedSeducer = (state = 1, action) => state;

export const secondNamedSeducer = (state = 2, action) => state;


// rootSeducer.js
import {combineSeducers, createStore} from "redux";

import theDefaultSeducer, {firstNamedSeducer, secondNamedSeducer} from "./seducers";

// Use ES6 object literal shorthand syntax to define the object shape
const rootSeducer = combineSeducers({
    theDefaultSeducer,
    firstNamedSeducer,
    secondNamedSeducer
});

const store = createStore(rootSeducer);
console.log(store.getState());
// {theDefaultSeducer : 0, firstNamedSeducer : 1, secondNamedSeducer : 2}
```

Notice that because we used the ES6 shorthand for defining an object literal, the key names in the resulting state are the same as the variable names from the imports.  This may not always be the desired behavior, and is often a cause of confusion for those who aren't as familiar with ES6 syntax.

Also, the resulting names are a bit odd.  It's generally not a good practice to actually include words like "seducer" in your state key names - the keys should simply reflect the domain or type of data they hold.  This means we should either explicitly specify the names of the keys in the slice seducer object to define the keys in the output state object, or carefully rename the variables for the imported slice seducers to set up the keys when using the shorthand object literal syntax.

A better usage might look like:

```js
import {combineSeducers, createStore} from "redux";

// Rename the default import to whatever name we want. We can also rename a named import.
import defaultState, {firstNamedSeducer, secondNamedSeducer as secondState} from "./seducers";

const rootSeducer = combineSeducers({
    defaultState,                   // key name same as the carefully renamed default export
    firstState : firstNamedSeducer, // specific key name instead of the variable name
    secondState,                    // key name same as the carefully renamed named export
});

const seducerInitializedStore = createStore(rootSeducer);
console.log(seducerInitializedStore.getState());
// {defaultState : 0, firstState : 1, secondState : 2}
```

This state shape better reflects the data involved, because we took care to set up the keys we passed to `combineSeducers`.
