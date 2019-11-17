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

### Reducers Must Not Have Side Effects

### Do Not Put Non-Serializable Values in State or Actions

(Exception: you may put non-serializable values in actions _if_ the action will be intercepted and stopped by a middleware before it reaches the reducers.)

### Only One Redux Store Per App

</div>

<div class="priority-rules priority-stronglyrecommended">

## Priority B Rules: Strongly Recommended

### Use Redux Toolkit for Writing Redux Logic

<div class="tags">
    <span class="tag">tag1</span>
    <span class="tag">tag2</span>
</div>

### Use Immer for Writing Immutable Updates

Preferably as part of RTK.

### Structure Files as "Feature Folders" or "Ducks"

Prefer use of feature folders or ducks, vs folder-by-type.

Suggest naming "duck files" as someFeatureSlice.js

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
