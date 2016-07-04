# Structuring Reducers

At its core, Redux is really a fairly simple design pattern: all your "write" logic goes into a single function, and the only way to run that logic is to give Redux a plain object that describes something that has happened.  The Redux store calls that write logic function and passes in the current state tree and the descriptive object, the write logic function returns some new state tree, and the Redux store notifies any subscribers that the state tree has changed.  

Redux puts some basic constraints on how that write logic function should work.  As described in [Reducers](../basics/Reducers.md), this write logic function:

- Should have a signature of `(previousState, action) => newState`.  Because this is the effectively the same type of function you would pass to [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce), we refer to this "write logic function" as a **"reducer"**.
- Should be "pure", which means it does not mutate its arguments, perform side effects like API calls or modifying values outside of the function, or call non-pure functions like `Date.now()` or `Math.random()`.  This also means that updates should be done in an "immutable" fashion, which means always returning new objects with the updated data, rather than directly modifying the original state tree in-place.

Beyond that, Redux does not really care how you actually structure your reducer logic as long as it obeys those basic rules.  This is both a source of freedom and a source of confusion.  However, there are a number of common patterns that are widely used when writing reducers, as well as a number of related topics and concepts to be aware of.  As an application increases in complexity, many of these patterns play a crucial role in managing reducer code complexity, handling real-world data, and optimizing UI performance.


## Basic Reducer Structure

First and foremost, it's important to understand that your entire application really only has **one single reducer function**: the function that you've passed into `createStore` as the first argument.  That one single reducer function ultimately needs to do several things:

- If the incoming `state` value is undefined, it probably needs to return some default state value to initialize the overall state
- It needs to look at the previous state and the dispatched action, and determine what kind of work needs to be done
- Assuming actual changes need to occur, it needs to create new objects and arrays with the updated data and return those
- If no changes are needed, it should return the existing state as-is. 

The simplest possible approach to writing reducer logic is to put everything into a single function declaration, like this:

```js
function counter(state, action) {
  if (typeof state === 'undefined') {
    return 0; // If state is undefined, return the initial application state
  }

  if (action.type === 'INCREMENT') {
    return state + 1;
  } else if (action.type === 'DECREMENT') {
    return state - 1;
  } else {
    return state; // In case an action is passed in we don't understand
  }
}
```

Notice that this simple function fulfills all the basic requirements.  It returns a default value if none exists, initializing the store; it determines what sort of update needs to be done based on the type of the action, and returns new values; and it returns the previous state if no work needs to be done.  

There are some simple tweaks that can be made to this reducer.  First, repeated `if`/`else` statements quickly grow tiresome, so it's very common to use `switch` statements instead.  Second, we can use ES6's default parameter values to handle the initial "no existing data" case.  With those changes, the reducer would look like:

```js
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1;
    case 'DECREMENT':
      return state - 1;
    default:
      return state;
  }
}
```

This is the basic structure that a typical Redux reducer function uses.

## Basic State Shape

Redux encourages you to think about your application in terms of the data you need to manage.  The data at any given point in time is the "*state*" of your application, and the structure and organization of that state is typically referred to as its "*shape*".  The shape of your state plays a major role in how you structure your reducer logic.

A Redux state almost always has a plain Javascript object as the top of the state tree. The most common way to organize data within that top-level object is to further divide data into sub-trees, where each top-level key represents some "domain" or "slice" of related data.  For example, a basic Todo app's state might look like: 

```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

In this example, `todos` and `visibilityFilter` are both top-level keys in the state, and each represents a "slice" of data for some particular concept.


## Splitting Up Reducer Logic

Obviously, for any meaningful application, putting *all* your update logic into a single reducer function is quickly going to become unmaintainable.  While there's no single rule for how long a function should be, it's generally agreed that functions should be relatively short and ideally only do one specific thing.  Because of this, the natural response for any programmer looking at a very large chunk of code is to try to break that code into smaller pieces that are easier to understand.

Since a Redux reducer is *just* a function, the same concept applies.  You can split some of your reducer logic out into another function, and call that new function from the original "higher-level" reducer function.  These new functions would typically fall into one of three categories:

1. Small utility functions containing some reusable chunk of logic that is needed in multiple places
2. Functions for handling a specific update case, which often need parameters other than the typical `(state, action)` pair
3. Functions which handle *all* updates for a given slice of state.  These functions do generally have the typical `(state, action)` parameter signature


Breaking down a complex process into smaller, more understandable parts is usually described with the term ***[functional decomposition](http://stackoverflow.com/questions/947874/what-is-functional-decomposition)***.  This term and concept can be applied generically to any code.  However, in Redux it is *very* common to structure reducer logic using approach #3, where update logic is delegated to other functions based on slice of state.  Redux refers to this concept as ***reducer composition***, and it is by far the most widely-used approach to structuring reducer logic.  However, it's important to note that it is not the *only* pattern that can be used.  In fact, it's entirely possible to use all three approaches for splitting up logic into functions, and usually a good idea as well.