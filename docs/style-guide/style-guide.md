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

These rules have been found to improve readability and/or developer experience in most projects. Your code will still run if you violate them, but violations should be rare and well-justified. Follow these rules whenever it is reasonably possible.

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

Reducer functions should _only_ depend on their `state` and `action` arguments, and should only calculate and return a new state value based on those arguments. They must not execute any kind of asynchronous logic (AJAX calls, timeouts, promises), generate random values (`Date.now()`, `Math.random()`), modify variables outside the reducer, or run other code that affects things outside the scope of the reducer function.

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

Wherever possible, try to put as much of the logic for calculating a new state into the appropriate reducer, rather than in the code that prepares and dispatches the action (like a click handler). This helps ensure that more of the actual app logic is easily testable, enables more effective use of time-travel debugging, and helps avoid common mistakes that can lead to mutations and bugs.

There are valid cases where some or all of the new state should be calculated first (such as generating a unique ID), but that should be kept to a minimum.

<details>
<summary>
    <h4>Detailed Explanation</h4>
</summary>

The Redux core does not actually care whether a new state value is calculated in the reducer or in the action creation logic. For example, for a todo app, the logic for a "toggle todo" action requires immutably updating an array of todos. It is legal to have the action contain just the todo ID and calculate the new array in the reducer

```js
// Click handler:
const onTodoClicked = (id) => {
    dispatch({type: "todos/toggleTodo", payload: {id}})
}

// Reducer:
case "todos/toggleTodo": {
    return state.map(todo => {
        if(todo.id !== action.payload.id) return todo;

        return {...todo, id: action.payload.id};
    })
}
```

And also to calculate the new array first and put the entire new array in the action:

```js
// Click handler:
const onTodoClicked = id => {
  const newTodos = todos.map(todo => {
    if (todo.id !== id) return todo

    return { ...todo, id }
  })

  dispatch({ type: 'todos/toggleTodo', payload: { todos: newTodos } })
}


// Reducer:
case "todos/toggleTodo":
    return action.payload.todos;
```

However, doing the logic in the reducer is preferable for several reasons:

- Reducers are always easy to test, because they are pure functions - you just call `const result = reducer(testState, action)`, and assert that the result is what you expected. So, the more logic you can put in a reducer, the more logic you have that is easily testable.
- Redux state updates must always follow [the rules of immutable updates](../recipes/structuring-reducers/ImmutableUpdatePatterns.md). Most Redux users realize they have to follow the rules inside a reducer, but it's not obvious that you _also_ have to do this if the new state is calculated _outside_ the reducer. This can easily lead to mistakes like accidental mutations, or even reading a value from the Redux store and passing it right back inside an action. Doing all of the state calculations in a reducer avoids those mistakes.
- If you are using Redux Toolkit or Immer, it is much easier to write immutable update logic in reducers, and Immer will freeze the state and catch accidental mutations.
- Time-travel debugging works by letting you "undo" a dispatched action, then either do something different or "redo" the action. In addition, hot-reloading of reducers normally involves re-running the new reducer with the existing actions. If you have a correct action but a buggy reducer, you can edit the reducer to fix the bug, hot-reload it, and you should get the correct state right away. If the action itself was wrong, you'd have to re-run the steps that led to that action being dispatched. So, it's easier to debug if more logic is in the reducer.
- Finally, putting logic in reducers means you know where to look for the update logic, instead of having it scattered in random other parts of the application code.
  </details>

### Reducers Should Own the State Shape

The Redux root state is owned and calculated by the single root reducer function. For maintainability, that reducer is intended to be split up by key/value "slices", with each "slice reducer" being responsible for providing an initial value and calculating the updates to that slice of the state.

In addition, slice reducers should exercise control over what other values are returned as part of the calculated state. Minimize the use of "blind spreads/returns" like `return action.payload` or `return {...state, ...action.payload}`, because those rely on the code that dispatched the action to correctly format the contents, and the reducer effectively gives up its ownership of what that state looks like. That can lead to bugs if the action contents are not correct.

<details>
<summary>
    <h4>Detailed Explanation</h4>
</summary>
Picture a "current user" reducer that looks like:

```js
const initialState = {
    firstName: null,
    lastName: null,
    age: null,
};

export default usersReducer = (state = initialState, action) {
    switch(action.type) {
        case "users/userLoggedIn": {
            return action.payload;
        }
        default: return state;
    }
}
```

In this example, the reducer completely assumes that `action.payload` is going to be a correctly formatted object.

However, imagine if some part of the code were to dispatch a "todo" object inside the action, instead of a "user" object:

```js
dispatch({
  type: 'users/userLoggedIn',
  payload: {
    id: 42,
    text: 'Buy milk'
  }
})
```

The reducer would blindly return the todo, and now the rest of the app would likely break when it tries to read the user from the store.

This could be at least partly fixed if the reducer has some validation checks to ensure that `action.payload` actually has the right fields, or tries to read the right fields out by name. That does add more code, though, so it's a question of trading off more code for safety.

Use of static typing does make this kind of code safer and somewhat more acceptable. If the reducer knows that `action` is a `PayloadAction<User>`, then it _should_ be safe to do `return action.payload`.

</details>

### Treat Reducers as State Machines

Many Redux reducers are written "unconditionally". They only look at the dispatched action and calculate a new state value, without basing any of the logic on what the current state might be. This can cause bugs, as some actions may not be "valid" conceptually at certain times depending on the rest of the app logic. For example, a "request succeeded" action should only have a new value calculated if the state says that it's already "loading".

To fix this, treat reducers as "state machines", where the combination of both the current state _and_ the dispatched action determines whether a new state value is actually calculated, not just the action itself unconditionally.

### Normalize Complex Nested/Relational State

Many applications need to cache complex data in the store. That data is often received in a nested form from an API, or has relations between different entities in the data (such as a blog that contains Users, Posts, and Comments).

Prefer storing that data in [a "normalized" form](../recipes/structuring-reducers/NormalizingStateShape.md) in the store. This makes it easier to look up items based on their ID and update a single item in the store, and ultimately leads to better performance patterns.

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
