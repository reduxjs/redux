---
id: reducers
title: Reducers
sidebar_label: Reducers
hide_title: true
---

# Redux FAQ: Reducers

## Table of Contents

- [How do I share state between two reducers? Do I have to use combineReducers?](#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)
- [Do I have to use the switch statement to handle actions?](#do-i-have-to-use-the-switch-statement-to-handle-actions)

## Reducers

### How do I share state between two reducers? Do I have to use `combineReducers`?

The suggested structure for a Redux store is to split the state object into multiple “slices” or “domains” by key, and provide a separate reducer function to manage each individual data slice. This is similar to how the standard Flux pattern has multiple independent stores, and Redux provides the [`combineReducers`](../api/combineReducers.md) utility function to make this pattern easier. However, it's important to note that `combineReducers` is _not_ required—it is simply a utility function for the common use case of having a single reducer function per state slice, with plain JavaScript objects for the data.

Many users later want to try to share data between two reducers, but find that `combineReducers` does not allow them to do so. There are several approaches that can be used:

- If a reducer needs to know data from another slice of state, the state tree shape may need to be reorganized so that a single reducer is handling more of the data.
- You may need to write some custom functions for handling some of these actions. This may require replacing `combineReducers` with your own top-level reducer function. You can also use a utility such as [reduce-reducers](https://github.com/acdlite/reduce-reducers) to run `combineReducers` to handle most actions, but also run a more specialized reducer for specific actions that cross state slices.
- [Async action creators](../advanced/AsyncActions.md#async-action-creators) such as [redux-thunk](https://github.com/gaearon/redux-thunk) have access to the entire state through `getState()`. An action creator can retrieve additional data from the state and put it in an action, so that each reducer has enough information to update its own state slice.

In general, remember that reducers are just functions—you can organize them and subdivide them any way you want, and you are encouraged to break them down into smaller, reusable functions (“reducer composition”). While you do so, you may pass a custom third argument from a parent reducer if a child reducer needs additional data to calculate its next state. You just need to make sure that together they follow the basic rules of reducers: `(state, action) => newState`, and update state immutably rather than mutating it directly.

#### Further information

**Documentation**

- [API: combineReducers](../api/combineReducers.md)
- [Recipes: Structuring Reducers](../recipes/structuring-reducers/StructuringReducers.md)

**Discussions**

- [#601: A concern on combineReducers, when an action is related to multiple reducers](https://github.com/reduxjs/redux/issues/601)
- [#1400: Is passing top-level state object to branch reducer an anti-pattern?](https://github.com/reduxjs/redux/issues/1400)
- [Stack Overflow: Accessing other parts of the state when using combined reducers?](http://stackoverflow.com/questions/34333979/accessing-other-parts-of-the-state-when-using-combined-reducers)
- [Stack Overflow: Reducing an entire subtree with redux combineReducers](http://stackoverflow.com/questions/34427851/reducing-an-entire-subtree-with-redux-combinereducers)
- [Sharing State Between Redux Reducers](https://invalidpatent.wordpress.com/2016/02/18/sharing-state-between-redux-reducers/)

### Do I have to use the `switch` statement to handle actions?

No. You are welcome to use any approach you'd like to respond to an action in a reducer. The `switch` statement is the most common approach, but it's fine to use `if` statements, a lookup table of functions, or to create a function that abstracts this away. In fact, while Redux does require that action objects contain a `type` field, your reducer logic doesn't even have to rely on that to handle the action. That said, the standard approach is definitely using a switch statement or a lookup table based on `type`.

#### Further information

**Documentation**

- [Recipes: Reducing Boilerplate](../recipes/ReducingBoilerplate.md)
- [Recipes: Structuring Reducers - Splitting Reducer Logic](../recipes/structuring-reducers/SplittingReducerLogic.md)

**Discussions**

- [#883: take away the huge switch block](https://github.com/reduxjs/redux/issues/883)
- [#1167: Reducer without switch](https://github.com/reduxjs/redux/issues/1167)
