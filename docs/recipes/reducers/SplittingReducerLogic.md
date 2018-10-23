# Splitting Up Reducer Logic

For any meaningful application, putting _all_ your update logic into a single reducer function is quickly going to become unmaintainable. While there's no single rule for how long a function should be, it's generally agreed that functions should be relatively short and ideally only do one specific thing. Because of this, it's good programming practice to take pieces of code that are very long or do many different things, and break them into smaller pieces that are easier to understand.

Since a Redux reducer is _just_ a function, the same concept applies. You can split some of your reducer logic out into another function, and call that new function from the parent function.

These new functions would typically fall into one of three categories:

1. Small utility functions containing some reusable chunk of logic that is needed in multiple places (which may or may not be actually related to the specific business logic)
2. Functions for handling a specific update case, which often need parameters other than the typical `(state, action)` pair
3. Functions which handle _all_ updates for a given slice of state. These functions do generally have the typical `(state, action)` parameter signature

For clarity, these terms will be used to distinguish between different types of functions and different use cases:

- **_reducer_**: any function with the signature `(state, action) -> newState` (ie, any function that _could_ be used as an argument to `Array.prototype.reduce`)
- **_root reducer_**: the reducer function that is actually passed as the first argument to `createStore`. This is the only part of the reducer logic that _must_ have the `(state, action) -> newState` signature.
- **_slice reducer_**: a reducer that is being used to handle updates to one specific slice of the state tree, usually done by passing it to `combineReducers`
- **_case function_**: a function that is being used to handle the update logic for a specific action. This may actually be a reducer function, or it may require other parameters to do its work properly.
- **_higher-order reducer_**: a function that takes a reducer function as an argument, and/or returns a new reducer function as a result (such as `combineReducers`, or `redux-undo`)

The term "_sub-reducer_" has also been used in various discussions to mean any function that is not the root reducer, although the term is not very precise. Some people may also refer to some functions as "_business logic_" (functions that relate to application-specific behavior) or "_utility functions_" (generic functions that are not application-specific).

Breaking down a complex process into smaller, more understandable parts is usually described with the term **_[functional decomposition](http://stackoverflow.com/questions/947874/what-is-functional-decomposition)_**. This term and concept can be applied generically to any code. However, in Redux it is _very_ common to structure reducer logic using approach #3, where update logic is delegated to other functions based on slice of state. Redux refers to this concept as **_reducer composition_**, and it is by far the most widely-used approach to structuring reducer logic. In fact, it's so common that Redux includes a utility function called [`combineReducers()`](../../api/combineReducers.md), which specifically abstracts the process of delegating work to other reducer functions based on slices of state. However, it's important to note that it is not the _only_ pattern that can be used. In fact, it's entirely possible to use all three approaches for splitting up logic into functions, and usually a good idea as well. The [Refactoring Reducers](./RefactoringReducersExample.md) section shows some examples of this in action.
