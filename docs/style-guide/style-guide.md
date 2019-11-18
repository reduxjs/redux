---
id: style-guide
title: Style Guide
sidebar_label: Style Guide
hide_title: true
---

<div class="style-guide">

# Redux Style Guide

## Introduction

This is the official style guide for writing Redux code. **It lists our recommended patterns, best practices, and suggested approaches for writing Redux applications.**

Both the Redux core library and most of the Redux documentation are unopinionated. There are many ways to use Redux, and much of the time there is no single "right" way to do things.

However, time and experience have shown that for some topics, certain approaches work better than others. In addition, many developers have asked us to provide official guidance to reduce decision fatigue.

With that in mind, **we've put together this list of recommendations to help you avoid errors, bikeshedding, and anti-patterns**. We also understand that team preferences vary and different projects have different requirements, so no style guide will fit all sizes. **You are encouraged to follow these recommendations, but take the time to evaluate your own situation and decide if they fit your needs**.

Finally, we'd like to thank the Vue documentation authors for writing the [Vue Style Guide page](https://vuejs.org/v2/style-guide/), which was the inspiration for this page.

## Rule Categories

We've divided these rules into three categories:

### Priority A: Essential

These rules help prevent errors, so learn and abide by them at all costs. Exceptions may exist, but should be very rare and only be made by those with expert knowledge of both JavaScript and Redux.

### Priority B: Strongly Recommended

These rules have been found to improve readability and/or developer experience in most projects. Your code will still run if you violate them, but violations should be rare and well-justified.

### Priority C: Recommended

Where multiple, equally good options exist, an arbitrary choice can be made to ensure consistency. In these rules, we describe each acceptable option and suggest a default choice. That means you can feel free to make a different choice in your own codebase, as long as you're consistent and have a good reason. Please do have a good reason though!

<div class="priority-rules priority-essential">

## Priority A Rules: Essential

### Do Not Mutate State

Mutating state is the most common cause of bugs in Redux applications, including components failing to re-render properly, and will also break time-travel debugging in the Redux DevTools. Actual mutation of state values should always be avoided, both inside reducers and in all other application code.

Use tools such as [`redux-immutable-state-invariant`](https://github.com/leoasis/redux-immutable-state-invariant) to catch mutations during development, and [Immer](https://immerjs.github.io/immer/docs/introduction) to avoid accidental mutations in state updates.

> **Note**: it is okay to modify _copies_ of existing values - that is a normal part of writing immutable update logic. Also, if you are using the Immer library for immutable updates, writing "mutating" logic is acceptable because the real data isn't being mutated - Immer safely tracks changes and generates immutably-updated values internally.

<details>
<summary>
    <h4>Detailed Explanation</h4>
</summary>
test text
**bold text**
- bullet
- points

```ts
const value: string = 'blah'
```

</details>

### Reducers Must Not Have Side Effects

Reducer functions should _only_ depend on their `state` and `action` arguments, and should only calculate and return a new state value based on those arguments. They must not execute any kind of asynchronous logic (AJAX calls, timeouts, promises), modify variables outside the reducer, or run other code that affects things outside the scope of the reducer function.

> **Note**: It is acceptable to have a reducer call other functions that are defined outside of itself, such as imports from libraries or utility functions, as long as they follow the same rules.

<details>
<summary>
    <h4>Detailed Explanation</h4>
</summary>
The purpose of this rule is to guarantee that reducers will behave predictably when called.  For example, if you are doing time-travel debugging, reducer functions may be called many times with earlier actions to produce the "current" state value.  If a reducer has side effects, this would cause those effects to be executed during the debugging process, and result in the application behaving in unexpected ways.

There are some gray areas to this rule. Strictly speaking, code such as `console.log(state)` is a side effect, but in practice has no effect on how the application behaves.

</details>

### Do Not Put Non-Serializable Values in State or Actions

Avoid putting non-serializable values such as Promises, Symbols, functions, or class instances into the Redux store state or dispatched actions. This ensures that capabilities such as debugging via the Redux DevTools will work as expected.

> **Exception**: you may put non-serializable values in actions _if_ the action will be intercepted and stopped by a middleware before it reaches the reducers. Middleware such as `redux-thunk` and `redux-promise` are examples of this.

### Only One Redux Store Per App

A standard Redux application should only have a single Redux store instance, which will be used by the whole application. It should typically be defined in a separate file such as `store.js`.

Ideally, no app logic will import the store directly. It should be passed to a React component tree via `<Provider>`, or referenced indirectly via middleware such as thunks. In rare cases, you may need to import it into other logic files, but this should be a last resort.

</div>

<div class="priority-rules priority-stronglyrecommended">

## Priority B Rules: Strongly Recommended

### Use Redux Toolkit for Writing Redux Logic

[Redux Toolkit](../redux-toolkit/overview.md) is our recommended toolset for using Redux. It has functions that build in our suggested best practices, including setting up the store to catch mutations and enable the Redux DevTools Extension, simplifying immutable update logic with Immer, and more.

You are not required to use RTK with Redux, and you are free to use other approaches if desired, but using RTK will simplify your logic and ensure that your application is set up with good defaults.

### Use Immer for Writing Immutable Updates

Writing immutable update logic by hand is frequently difficult and prone to errors. [Immer](https://immerjs.github.io/immer/docs/introduction) allows you to write simpler immutable updates using "mutative" logic, and even freezes your state in development to catch mutations elsewhere in the app. We recommend using Immer for writing immutable update logic, preferably as part of [Redux Toolkit](../redux-toolkit/overview.md).

### Structure Files as "Feature Folders" or "Ducks"

Redux itself does not care about how your application's folders and files are structured. However, co-locating logic for a given feature in one place typically makes it easier to maintain that code.

Because of this, we recommend that most applications should structure files using a "feature folder" approach (all files for a feature in the same folder) or the ["ducks" pattern](https://github.com/erikras/ducks-modular-redux) (all Redux logic for a feature in a single file), rather than splitting logic across separate folders by "type" of code (reducers, actions, etc).

<details>
<summary>
    <h4>Detailed Explanation</h4>
</summary>
An example folder structure might look something like:

- `/src`
  - `index.tsx`
  - `/app`
    - `store.ts`
    - `rootReducer.ts`
    - `App.tsx`
  - `/common`
    - hooks, generic components, utils, etc
  - `/features`
    - `/todos`
      - `todosSlice.ts`
      - `Todos.tsx`

`/app` contains app-wide setup and layout that depends on all the other folders.

`/common` contains truly generic and reusable utilities and components.

`/features` has folders that contain all functionality related to a specific feature. In this example, `todosSlice.ts` is a "duck"-style file that contains a call to RTK's `createSlice()` function, and exports the slice reducer and action creators.

</details>

### Put as Much Logic as Possible in Reducers

### Reducers Should Own the State Shape

Minimize "blind spreads/returns" like return action.payload or return {...state, ...action.payload}

### Treat Reducers as State Machines

Try to treat reducers as state machines that only update if appropriate based on the current state.

### Normalize Complex Nested/Relational State

### Model Actions as "Events", Not "Setters"

### Write Meaningful Action Names

Define many meaningful actions for a readable history log, vs just a "SET_DATA" or "UPDATE_STORE" action

### Allow Many Reducers to Respond to the Same Action

### Avoid Dispatching Many Actions Sequentially

Minimize multi-dispatch sequences (batch if necessary)

### Evaluate Where Each Piece of State Should Live

### Connect More Components to Read Data from the Store

### Use the "Object Shorthand" Form of `mapDispatch` with `connect`

### Call `useSelector` Multiple Times in Function Components

### Use Static Typing

### Use the Redux DevTools Extension for Debugging

</div>

<div class="priority-rules priority-recommended">

## Priority C Rules: Recommended

### Write Action Types as `domain/eventName`

### Write Actions Using the "Flux Standard Action" Convention

May model actions with separate error types vs error: true

### Use Action Creators

### Use Thunks for Async Logic

Default to thunks; add sagas or observables if you have truly complex async workflows

### Move Complex Logic Outside Components

Prefer putting more complex sync/async logic outside the component (thunks, etc)

### Use Selector Functions to Read from Store State

Use Reselect. But, find a middle ground for granularity - don't define selectors for every field

### Avoid Putting Form State In Redux

</div>

</div>
