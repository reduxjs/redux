# Prerequisite Reducer Concepts


As described in [Reducers](../../basics/Reducers.md), a Redux reducer function:

- Should have a signature of `(previousState, action) => newState`, similar to the type of function you would pass to [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
- Should be "pure", which means the reducer:
  - Does not _perform side effects_ (such as calling API's or modifying non-local objects or variables).
  - Does not _call non-pure functions_ (like `Date.now` or `Math.random`).
  - Does not _mutate_ its arguments. If the reducer updates state, it should not _modify_ the **existing** state object in-place.  Instead, it should generate a **new** object containing the necessary changes. The same approach should be used for any sub-objects within state that the reducer updates.

>##### Note on immutability, side effects, and mutation
> Mutation is discouraged because it generally breaks time-travel debugging, and React Redux's `connect` function:
> - For time traveling, the Redux DevTools expect that replaying recorded actions would output a state value, but not change anything else. **Side effects like mutation or asynchronous behavior will cause time travel to alter behavior between steps, breaking the application**.
> - For React Redux, `connect` checks to see if the props returned from a `mapStateToProps` function have changed in order to determine if a component needs to update.  To improve performance, `connect` takes some shortcuts that rely on the state being immutable, and uses shallow reference equality checks to detect changes. This means that **changes made to objects and arrays by direct mutation will not be detected, and components will not re-render**.
>
> Other side effects like generating unique IDs or timestamps in a reducer also make the code unpredictable and harder to debug and test.


Because of these rules, it's important that the following core concepts are fully understood before moving on to other specific techniques for organizing Redux reducers:

#### Redux Reducer Basics

**Key concepts**:

- Thinking in terms of state and state shape
- Delegating update responsibility by slice of state (*reducer composition*)
- Higher order reducers
- Defining reducer initial state

**Reading list**:

- [Redux Docs: Reducers](../../basics/Reducers.md)
- [Redux Docs: Reducing Boilerplate](../ReducingBoilerplate.md)
- [Redux Docs: Implementing Undo History](../ImplementingUndoHistory.md)
- [Redux Docs: `combineReducers`](../../api/combineReducers.md)
- [The Power of Higher-Order Reducers](http://slides.com/omnidan/hor#/)
- [Stack Overflow: Store initial state and `combineReducers`](http://stackoverflow.com/questions/33749759/read-stores-initial-state-in-redux-reducer)
- [Stack Overflow: State key names and `combineReducers`](http://stackoverflow.com/questions/35667775/state-in-redux-react-app-has-a-property-with-the-name-of-the-reducer)


#### Pure Functions and Side Effects

**Key Concepts**:

- Side effects
- Pure functions
- How to think in terms of combining functions

**Reading List**:

- [The Little Idea of Functional Programming](http://jaysoo.ca/2016/01/13/functional-programming-little-ideas/)
- [Understanding Programmatic Side-Effects](http://c2fo.io/c2fo/programming/2016/05/11/understanding-programmatic-side-effects/)
- [Learning Functional Programming in Javascript](https://youtu.be/e-5obm1G_FY)
- [An Introduction to Reasonably Pure Functional Programming](https://www.sitepoint.com/an-introduction-to-reasonably-pure-functional-programming/)



#### Immutable Data Management

**Key Concepts**:

- Mutability vs immutability
- Immutably updating objects and arrays safely
- Avoiding functions and statements that mutate state

**Reading List**:

- [Pros and Cons of Using Immutability With React](http://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)
- [Immutable Data using ES6 and Beyond](http://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)
- [Immutable Data from Scratch](https://ryanfunduk.com/articles/immutable-data-from-scratch/)
- [Redux Docs: Using the Object Spread Operator](../UsingObjectSpreadOperator.md)


#### Normalizing Data

**Key Concepts**:

- Database structure and organization
- Splitting relational/nested data up into separate tables
- Storing a single definition for a given item
- Referring to items by IDs
- Using objects keyed by item IDs as lookup tables, and arrays of IDs to track ordering
- Associating items in relationships


**Reading List**:

- [Database Normalization in Simple English](http://www.essentialsql.com/get-ready-to-learn-sql-database-normalization-explained-in-simple-english/)
- [Idiomatic Redux: Normalizing the State Shape](https://egghead.io/lessons/javascript-redux-normalizing-the-state-shape)
- [Normalizr Documentation](https://github.com/paularmstrong/normalizr)
- [Redux Without Profanity: Normalizr](https://tonyhb.gitbooks.io/redux-without-profanity/content/normalizer.html)
- [Querying a Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)
- [Wikipedia: Associative Entity](https://en.wikipedia.org/wiki/Associative_entity)
- [Database Design: Many-to-Many](http://www.tomjewett.com/dbdesign/dbdesign.php?page=manymany.php)
- [Avoiding Accidental Complexity When Structuring Your App State](https://medium.com/@talkol/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a)
