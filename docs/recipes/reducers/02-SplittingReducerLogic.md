# Splitting Up Reducer Logic

Obviously, for any meaningful application, putting *all* your update logic into a single reducer function is quickly going to become unmaintainable.  While there's no single rule for how long a function should be, it's generally agreed that functions should be relatively short and ideally only do one specific thing.  Because of this, the natural response for any programmer looking at a very large chunk of code is to try to break that code into smaller pieces that are easier to understand.

Since a Redux reducer is *just* a function, the same concept applies.  You can split some of your reducer logic out into another function, and call that new function from the original "higher-level" reducer function.  These new functions would typically fall into one of three categories:

1. Small utility functions containing some reusable chunk of logic that is needed in multiple places (which may or may not be actually related to the specific business logic)
2. Functions for handling a specific update case, which often need parameters other than the typical `(state, action)` pair
3. Functions which handle *all* updates for a given slice of state.  These functions do generally have the typical `(state, action)` parameter signature

The initial, "top-level" reducer function is typical referred to as a "*root reducer*", since it handles the top of the state tree.  While there aren't widely used specific terms for the other types of functions, for the purposes of this article we will refer to them as:

1. *utility functions* (reusable logic that is *not* business-related) and *utility reducers* (reusable logic that *is* business-related)
2. *case reducers*
3. *slice reducers*

The term "*sub-reducer*" is also sometimes used for any function that is not the root reducer.


Breaking down a complex process into smaller, more understandable parts is usually described with the term ***[functional decomposition](http://stackoverflow.com/questions/947874/what-is-functional-decomposition)***.  This term and concept can be applied generically to any code.  However, in Redux it is *very* common to structure reducer logic using approach #3, where update logic is delegated to other functions based on slice of state.  Redux refers to this concept as ***reducer composition***, and it is by far the most widely-used approach to structuring reducer logic.  In fact, it's so common that Redux includes a utility function called [`combineReducers()`](../../api/combineReducers.md), which specifically abstracts the process of delegating work to other reducer functions based on slices of state. However, it's important to note that it is not the *only* pattern that can be used.  In fact, it's entirely possible to use all three approaches for splitting up logic into functions, and usually a good idea as well.