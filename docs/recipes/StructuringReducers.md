# Structuring Reducers

At its core, Redux is really a fairly simple design pattern: all your "write" logic goes into a single function, and the only way to run that logic is to give Redux a plain object that describes something that has happened.  The Redux store calls that write logic function and passes in the current state tree and the descriptive object, the write logic function returns some new state tree, and the Redux store notifies any subscribers that the state tree has changed.  

Redux puts some basic constraints on how that write logic function should work.  As described in [Reducers](../basics/Reducers.md), this write logic function:

- Should have a signature of `(previousState, action) => newState`.  Because this is the effectively the same type of function you would pass to [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce), we refer to this "write logic function" as a **"reducer"**.
- Should be "pure", which means it does not mutate its arguments, perform side effects like API calls or modifying values outside of the function, or call non-pure functions like `Date.now()` or `Math.random()`.  This also means that updates should be done in an ***"immutable"*** fashion, which means **always returning new objects with the updated data**, rather than directly modifying the original state tree in-place.

>##### Note on immutability, side effects, and mutation
> Mutation is discouraged because it generally breaks time-travel debugging, and React Redux's `connect` function.  For time traveling, the Redux DevTools expect that replaying recorded actions would output a state value, but not change anything else.  For React Redux, `connect` checks to see if the values returned from a `mapStateToProps` function have changed in order to see if a component needs to update.  Direct mutation can cause both of these scenarios to not work correctly.  Other side effects like generating unique IDs or timestamps also make the code unpredictable and harder to debug.  

Beyond that, Redux does not really care how you actually structure your reducer logic as long as it obeys those basic rules.  This is both a source of freedom and a source of confusion.  However, there are a number of common patterns that are widely used when writing reducers, as well as a number of related topics and concepts to be aware of.  As an application increases in complexity, these patterns play a crucial role in managing reducer code complexity, handling real-world data, and optimizing UI performance.  This document describes many of those patterns and concepts.


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


## Basic Immutable Data Updates

One of the most common problems for someone learning Redux is the concept of updating data "immutably", rather than directly mutating the existing data.  Most people have learned how to program using mutable data, so both the idea of "immutable updates" and the details of how to do so can be confusing.

First, here's an example of what direct mutation looks like:

```js
const firstObject = {a : 42};
const secondObject = firstObject;

// Direct mutation - we are overwriting the previous value inside of firstObject
firstObject.a = 123;

console.log(firstObject.a); 
// 123
console.log(secondObject.a); 
// 123, because both variables are pointing to the same object in memory
```

If we did something like this in a reducer, it would break the rule against direct mutations and side effects.  In order to properly return a new value without modifying the original, we need to make *copies* of the original data, modify the copies, and return the newly updated copies.  This generally means making *shallow copies* (a new reference that still points to all the old data inside), rather than *deep copies* (copying every level of nested data).

There's a variety of functions and syntax that can be used to do immutable updates with plain Javascript objects and arrays:

- Arrays:
  - `Array.slice()` will return a shallow copy of the array
  - The Array spread operator acts the same as `slice`: `const newArray = [...oldArray]`
  - `Array.concat()` will return a new array with all the old items, plus the old items at the end
  - `Array.map()` runs a callback function once for each item in the original array, and returns a new array containing the return value from each call
  - `Array.filter()` runs a callback function once for each item in the original array, and returns a new array containing *only* the items the callback returned truthy for
  
  
You should ***never*** call methods like `push`, `pop`, `shift`, `unshift`, or `splice` on the **original** array.  You *can* safely call those methods on a *copy* of the array, because that isn't the original.
####TODO

- Objects
  - `Object.assign()` takes multiple parameter objects.  The first parameter acts as a target object, and `assign` will copy all fields from the second parameter onto the target object, copy fields from the third parameter onto the target object, and so on for all parameters.  This means that in order to safely copy an object, you should pass a new empty object as the first parameter.  You can also pass the "new" data as a later parameter: `const newObject = Object.assign({}, oldObject, {fieldToOverwrite : newValue})`.
  - The Object spread operator is not yet an official part of the Javascript language (it is currently a Stage 2 proposal).  However, the syntax has been enabled with a compiler such as Babel, it acts the same as `assign`:  `const newObject = {...oldObject, {fieldToOverwrite : newValue}`.
  
  
Here are some examples of what 
  
  
- Other approaches:
  - There are several specialized data structure libraries, like Immutable.js, that enforce this kind of behavior through their own APIs
  - There are a number of utility libraries that abstract out the process of making copies and applying updates.  
####TODO



## Splitting Up Reducer Logic

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


Breaking down a complex process into smaller, more understandable parts is usually described with the term ***[functional decomposition](http://stackoverflow.com/questions/947874/what-is-functional-decomposition)***.  This term and concept can be applied generically to any code.  However, in Redux it is *very* common to structure reducer logic using approach #3, where update logic is delegated to other functions based on slice of state.  Redux refers to this concept as ***reducer composition***, and it is by far the most widely-used approach to structuring reducer logic.  In fact, it's so common that Redux includes a utility function called [`combineReducers()`](../api/combineReducers.md), which specifically abstracts the process of delegating work to other reducer functions based on slices of state. However, it's important to note that it is not the *only* pattern that can be used.  In fact, it's entirely possible to use all three approaches for splitting up logic into functions, and usually a good idea as well.


## Splitting Reducers Using Functional Decomposition and Reducer Composition

Let's say that our initial reducer looks like this:

```js
const initialState = {
    visibilityFilter : 'SHOW_ALL',
    todos : []
};


function appReducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : { 
            return Object.assign({}, state, {
                visibilityFilter : action.filter
            });
        }
        case 'ADD_TODO' : {
            return Object.assign({}, state, {
                todos : state.todos.concat({
                    id: action.id,
                    text: action.text,
                    completed: false
                })
            });
        }
        case 'TOGGLE_TODO' : {
            return Object.assign({}, state, {
                todos : state.todos.map(todo => {
                    if (todo.id !== action.id) {
                      return todo;
                    }

                    return Object.assign({}, todo, {
                        completed : !todo.completed
                    })
                  })
            });
        } 
        default : return state;
    }
}

```

That function is fairly short, but already becoming pretty hard to read.  We're dealing with two different areas of concern (filtering vs our list of todos), the nesting is making the update logic harder to read, and it's not exactly clear what's going on everywhere.

A good first step might be to break out a utility function to return a new object with updated fields:

```js
function updateObject(oldObject, newValues) {
    // Copy fields from oldObject to a new empty object.
    // Then copy fields from newValues to the new object, overwriting any existing fields.
    // This gives us a new updated copy, without modifying the original
    return Object.assign({}, oldObject, newValues);
}

function appReducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : { 
            return updateObject(state, {visibilityFilter : action.filter });
        }
        case 'ADD_TODO' : {
            const newTodos = state.todos.concat({
                id: action.id,
                text: action.text,
                completed: false
            });
            
            return updateObject(state, {todos : newTodos});
        }
        case 'TOGGLE_TODO' : {
            const newTodos = state.todos.map(todo => {
                if (todo.id !== action.id) {
                  return todo;
                }
                
                return updateObject(todo, {completed : !todo.completed});
            });
            
            return updateObject(state, {todos : newTodos});
        } 
        default : return state;
    }
}
```

That reduced the duplication and made things a bit easier to read.  Next, we can split each specific case into its own function:

```js
function updateObject(oldObject, newValues) {
    // Copy fields from oldObject to a new empty object.
    // Then copy fields from newValues to the new object, overwriting any existing fields.
    // This gives us a new updated copy, without modifying the original
    return Object.assign({}, oldObject, newValues);
}

function setVisibilityFilter(state, action) {
    return updateObject(state, {visibilityFilter : action.filter });
}

function addTodo(state, action) {
    const newTodos = state.todos.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return updateObject(state, {todos : newTodos});
}

function toggleTodo(state, action) {
    const newTodos = state.todos.map(todo => {
        if (todo.id !== action.id) {
          return todo;
        }
        
        return updateObject(todo, {completed : !todo.completed});
    });

    return updateObject(state, {todos : newTodos});
}

function appReducer(state = initialState, action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : return setVisibilityFilter(state, action);
        case 'ADD_TODO' : return addTodo(state, action);
        case 'TOGGLE_TODO' : return addTodo(state, action);
        default : return state;
    }
}
```

Now it's _very_ clear what's happening in each case.  We can also start to see some patterns emerging.  Now, let's try splitting things up so that the filter logic and the todo logic are separated:

```js
function updateObject(oldObject, newValues) {
    // Copy fields from oldObject to a new empty object.
    // Then copy fields from newValues to the new object, overwriting any existing fields.
    // This gives us a new updated copy, without modifying the original
    return Object.assign({}, oldObject, newValues);
}

function setVisibilityFilter(visibilityState, action) {
    // Technically, we don't even care about the previous state
    return action.filter;
}

function visibilityReducer(visibilityState = 'SHOW_ALL', action) {
    switch(action.type) {
        case 'SET_VISIBILITY_FILTER' : return setVisibilityFilter(visibilityState, action);
        default : return visibilityState;
    }
};

function addTodo(todosState, action) {
    const newTodos = todosState.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return newTodos;
}

function toggleTodo(todosState, action) {
    const newTodos = todosState.map(todo => {
        if (todo.id !== action.id) {
          return todo;
        }
        
        return updateObject(todo, {completed : !todo.completed});
    });

    return newTodos;
}

function todosReducer(todosState = [], action) {
    switch(action.type) {
        case 'ADD_TODO' : return addTodo(todosState, action);
        case 'TOGGLE_TODO' : return toggleTodo(todosState, action);
        default : return todosState;
    }
}

function appReducer(state = initialState, action) {
    return {
        todos : todosReducer(state.todos, action),
        visibilityFilter : visibilityReducer(state.visibilityFilter, action)
    };
}

```

Notice that because the two "slice of state" reducers are now getting only their own part of the whole state as arguments, they no longer need to return complex nested state objects, and are now simpler as a result.

Now, we can use Redux's built-in `combineReducers` utility to handle the "slice-of-state" logic.  Also, since the "per-action" reducer functions are following a consistent pattern, and many people don't like using switch statements, we can define a helper function that lets us organize them with a lookup table:

```js
// Reusable utilities
function updateObject(oldObject, newValues) {
    // Copy fields from oldObject to a new empty object.
    // Then copy fields from newValues to the new object, overwriting any existing fields.
    // This gives us a new updated copy, without modifying the original
    return Object.assign({}, oldObject, newValues);
}

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}


// Handler for a specific case
function setVisibilityFilter(visibilityState, action) {
    // Technically, we don't even care about the previous state
    return action.filter;
}

// Handler for an entire slice of state
const visibilityReducer = createReducer('SHOW_ALL', {
    'SET_VISIBILITY_FILTER' : setVisibilityFilter
});


function addTodo(todosState, action) {
    const newTodos = todosState.concat({
        id: action.id,
        text: action.text,
        completed: false
    });
    
    return newTodos;
}

function toggleTodo(todosState, action) {
    const newTodos = todosState.map(todo => {
        if (todo.id !== action.id) {
          return todo;
        }
        
        return updateObject(todo, {completed : !todo.completed});
    });

    return newTodos;
}

const todosReducer = createReducer([], {
    'ADD_TODO' : addTodo,
    'TOGGLE_TODO' : toggleTodo
});

// Root reducer
const appReducer = combineReducers({
    visibilityFilter : visibilityReducer,
    todos : todosReducer
});
```

We now have examples of all three kinds of split-up reducer functions:  helper utilities like `updateObject` and `createReducer`; handlers for specific cases like `setVisibilityFilter` and `addTodo`; and slice-of-state handlers like `visibilityReducer` and `todosReducer`.  We also can see that `appReducer` is an example of a "root reducer".