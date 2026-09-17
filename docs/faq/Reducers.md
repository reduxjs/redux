---
id: reducers
title: Reducers
sidebar_label: Reducers
---

## Redux FAQ: Reducers

### How do I share state between two reducers? Do I have to use `combineReducers`?

The suggested structure for a Redux store is to split the state object into multiple “slices” or “domains” by key, and provide a separate reducer function to manage each individual data slice. This is similar to how the standard Flux pattern has multiple independent stores, and Redux provides the [`combineReducers`](../api/combineReducers.md) utility function to make this pattern easier. However, it's important to note that `combineReducers` is _not_ required—it is simply a utility function for the common use case of having a single reducer function per state slice, with plain JavaScript objects for the data.

Many users later want to try to share data between two reducers, but find that `combineReducers` does not allow them to do so. There are several approaches that can be used:

- First, check whether you need to _share_ state at all, or whether several slices just need to _respond to the same action_. The latter is the common case, and it needs no special handling: each `createSlice` can handle actions from other slices (or from `createAsyncThunk`) in its [`extraReducers`](https://redux-toolkit.js.org/api/createSlice#extrareducers) field. See [Allow Many Reducers to Respond to the Same Action](../style-guide/style-guide.md#allow-many-reducers-to-respond-to-the-same-action) in the Style Guide.
- If a reducer needs to know data from another slice of state, the state tree shape may need to be reorganized so that a single reducer is handling more of the data.
- You may need to write some custom functions for handling some of these actions. This may require replacing `combineReducers` with your own top-level reducer function. You can also use a utility such as [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) to run `combineReducers` to handle most actions, but also run a more specialized reducer for specific actions that cross state slices. [Beyond `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md) shows this approach.
- [Thunks](../usage/writing-logic-thunks.mdx) and [listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) effects have access to the entire state through `getState()`. A thunk can retrieve additional data from the state and put it in the action it dispatches, so that each reducer has enough information to update its own state slice.

In general, remember that reducers are just functions—you can organize them and subdivide them any way you want, and you are encouraged to break them down into smaller, reusable functions (“reducer composition”). While you do so, you may pass a custom third argument from a parent reducer if a child reducer needs additional data to calculate its next state. You just need to make sure that together they follow the basic rules of reducers: `(state, action) => newState`, and update state immutably rather than mutating it directly.

#### Further information

**Documentation**

- [API: combineReducers](../api/combineReducers.md)
- [Using Redux: Structuring Reducers](../usage/structuring-reducers/StructuringReducers.md)

**Discussions**

- [#601: A concern on combineReducers, when an action is related to multiple reducers](https://github.com/reduxjs/redux/issues/601)
- [#1400: Is passing top-level state object to branch reducer an anti-pattern?](https://github.com/reduxjs/redux/issues/1400)
- [Stack Overflow: Accessing other parts of the state when using combined reducers?](https://stackoverflow.com/questions/34333979/accessing-other-parts-of-the-state-when-using-combined-reducers)
- [Stack Overflow: Reducing an entire subtree with redux combineReducers](https://stackoverflow.com/questions/34427851/reducing-an-entire-subtree-with-redux-combinereducers)
- [Sharing State Between Redux Reducers](https://invalidpatent.wordpress.com/2016/02/18/sharing-state-between-redux-reducers/)

### Do I have to use the `switch` statement to handle actions?

No. You are welcome to use any approach you'd like to respond to an action in a reducer. The `switch` statement was the most common approach in hand-written reducers, but it's fine to use `if` statements, a lookup table of functions, or to create a function that abstracts this away. In fact, while Redux does require that action objects contain a `type` field, your reducer logic doesn't even have to rely on that to handle the action.

Today the standard approach is [`createSlice`](https://redux-toolkit.js.org/api/createSlice), which is a lookup table: each function in its `reducers` field handles one action type, and the slice generates the matching action creators and the combined reducer for you. The [`createReducer`](https://redux-toolkit.js.org/api/createReducer) builder callback does the same for reducers that aren't part of a slice.

#### Further information

**Documentation**

- [Style Guide: Use Redux Toolkit for Writing Redux Logic](../style-guide/style-guide.md#use-redux-toolkit-for-writing-redux-logic)
- [Using Redux: Reducing Boilerplate](../usage/ReducingBoilerplate.md)
- [Using Redux: Structuring Reducers - Splitting Reducer Logic](../usage/structuring-reducers/SplittingReducerLogic.md)

**Discussions**

- [#883: take away the huge switch block](https://github.com/reduxjs/redux/issues/883)
- [#1167: Reducer without switch](https://github.com/reduxjs/redux/issues/1167)
