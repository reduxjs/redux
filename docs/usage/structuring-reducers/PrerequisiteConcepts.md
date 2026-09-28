---
id: prerequisite-concepts
title: Prerequisite Concepts
sidebar_label: Prerequisite Concepts
description: 'Structuring Reducers > Prerequisite Concepts: Key concepts to understand when using Redux'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Prerequisite Reducer Concepts

<HandWrittenReducersNote />

As described in ["Redux Fundamentals" Part 3: State, Actions, and Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md), a Redux reducer function:

- Should have a signature of `(previousState, action) => newState`, similar to the type of function you would pass to [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
- Should be "pure", which means the reducer:
  - Does not _perform side effects_ (such as calling API's or modifying non-local objects or variables).
  - Does not _call non-pure functions_ (like `Date.now` or `Math.random`).
  - Does not _mutate_ its arguments. If the reducer updates state, it should not _modify_ the **existing** state object in-place. Instead, it should generate a **new** object containing the necessary changes. The same approach should be used for any sub-objects within state that the reducer updates.

> ##### Note on immutability, side effects, and mutation
>
> Mutation is discouraged because it generally breaks time-travel debugging, and React Redux's `useSelector` hook:
>
> - For time traveling, the Redux DevTools expect that replaying recorded actions would output a state value, but not change anything else. **Side effects like mutation or asynchronous behavior will cause time travel to alter behavior between steps, breaking the application**.
> - For React Redux, `useSelector` compares the value returned by your selector against the previous value by reference to decide whether a component needs to update. This means that **changes made to objects and arrays by direct mutation will not be detected, and components will not re-render**. See [Why isn't my component re-rendering?](../../faq/ReactRedux.md#why-isnt-my-component-re-rendering) in the FAQ.
>
> Other side effects like generating unique IDs or timestamps in a reducer also make the code unpredictable and harder to debug and test.

Because of these rules, it's important that the following core concepts are fully understood before moving on to other specific techniques for organizing Redux reducers:

#### Redux Reducer Basics

**Key concepts**:

- Thinking in terms of state and state shape
- Delegating update responsibility by slice of state (_reducer composition_)
- Higher order reducers
- Defining reducer initial state

**Reading list**:

- ["Redux Fundamentals" Part 3: State, Actions, and Reducers](../../tutorials/fundamentals/part-3-state-actions-reducers.md)
- [Redux Docs: Reducing Boilerplate](../ReducingBoilerplate.md)
- [Redux Docs: Implementing Undo History](../ImplementingUndoHistory.md)
- [Redux Docs: `combineReducers`](../../api/combineReducers.md)
- [The Power of Higher-Order Reducers](https://slides.com/omnidan/hor#/)
- [Stack Overflow: Store initial state and `combineReducers`](https://stackoverflow.com/questions/33749759/read-stores-initial-state-in-redux-reducer)
- [Stack Overflow: State key names and `combineReducers`](https://stackoverflow.com/questions/35667775/state-in-redux-react-app-has-a-property-with-the-name-of-the-reducer)

#### Pure Functions and Side Effects

**Key Concepts**:

- Side effects
- Pure functions
- How to think in terms of combining functions

**Reading List**:

- [Redux Style Guide: Reducers Must Not Have Side Effects](../../style-guide/style-guide.md#reducers-must-not-have-side-effects)
- [Learning Functional Programming in Javascript](https://youtu.be/e-5obm1G_FY)
- [An Introduction to Reasonably Pure Functional Programming](https://www.sitepoint.com/an-introduction-to-reasonably-pure-functional-programming/)

#### Immutable Data Management

**Key Concepts**:

- Mutability vs immutability
- Immutably updating objects and arrays safely
- Avoiding functions and statements that mutate state
- How Immer lets you write "mutating" code that produces immutable updates

**Reading List**:

- [Redux Docs: Immutable Update Patterns](./ImmutableUpdatePatterns.md)
- [React docs: Updating Objects in State](https://react.dev/learn/updating-objects-in-state) and [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state)
- [Immer docs](https://immerjs.github.io/immer/) and [Redux Toolkit: Writing Reducers with Immer](/toolkit/usage/immer-reducers)
- [Dave Ceddia: The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/)
- [Immutable Data using ES6 and Beyond](https://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)

#### Normalizing Data

**Key Concepts**:

- Database structure and organization
- Splitting relational/nested data up into separate tables
- Storing a single definition for a given item
- Referring to items by IDs
- Using objects keyed by item IDs as lookup tables, and arrays of IDs to track ordering
- Associating items in relationships

**Reading List**:

- [Database Normalization in Simple English](https://www.essentialsql.com/get-ready-to-learn-sql-database-normalization-explained-in-simple-english/)
- [Idiomatic Redux: Normalizing the State Shape](https://egghead.io/lessons/javascript-redux-normalizing-the-state-shape)
- [Redux Toolkit: `createEntityAdapter`](/toolkit/api/createEntityAdapter)
- [Essentials: Performance and Normalizing Data](../../tutorials/essentials/part-6-performance-normalization.md)
- [Normalizr Documentation](https://github.com/paularmstrong/normalizr) (stable, but no longer actively maintained)
- [Querying a Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)
- [Wikipedia: Associative Entity](https://en.wikipedia.org/wiki/Associative_entity)
