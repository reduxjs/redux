# Reducers

**Reducers** specify how the application's state changes in response to [actions](./Actions.md) sent to the store. Remember that actions only describe _what happened_, but don't describe how the application's state changes.

## Designing the State Shape

In Redux, all the application state is stored as a single object. It's a good idea to think of its shape before writing any code. What's the minimal representation of your app's state as an object?

For our todo app, we simply want to store: the actual list of todos.

You'll often find that you need to store some data, as well as some UI state, in the state tree. This is fine, but try to keep the data separate from the UI state.

```js
{
  todos: [
    {
      text: 'Consider using Redux',
      completed: true
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

> ##### Note on Relationships

> In a more complex app, you're going to want different entities to reference each other. We suggest that you keep your state as normalized as possible, without any nesting. Keep every entity in an object stored with an ID as a key, and use IDs to reference it from other entities, or lists. Think of the app's state as a database. This approach is described in [normalizr's](https://github.com/paularmstrong/normalizr) documentation in detail. To keep this app simple, we're using array index as id, but you'll often use a string or other serializable type as an id.

## Handling Actions

Now that we've decided what our state object looks like, we're ready to write a reducer for it. The reducer is a pure function that takes the previous state and an action, and returns the next state.

```js
;(previousState, action) => newState
```

Reducers are a concept from functional programming. For more information check out the MDN article on [`Array.prototype.reduce(reducer, ?initialValue)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce). It's very important that the reducer stays pure. Things you should **never** do inside a reducer:

* Mutate its arguments;
* Perform side effects like API calls and routing transitions;
* Call non-pure functions, e.g. `Date.now()` or `Math.random()`.
* Dispatch a new action
* Block or sleep
* setTimeout
* Mutate an object. For example: `state.foo =` ` '``bar``' `

We'll explore how to perform side effects in the [advanced walkthrough](../advanced/README.md). For now, just remember that the reducer must be pure. **Given the same arguments, it should calculate the next state and return it. No surprises. No side effects. No API calls. No mutations. Just a calculation.**

With this out of the way, let's start writing our reducer by gradually teaching it to understand the [actions](Actions.md) we defined earlier.

We'll start by specifying the initial state. Redux will call our reducer with an `undefined` state for the first time. This is our chance to return the initial state of our app:

```js
import { VisibilityFilters } from './actions'

const initialState = {
  todos: []
}

function todoApp(state = initialState, action) {
  // For now, don't handle any actions
  // and just return the state given to us.
  return state
}
```

Now let's handle `ADD_TODO`. All we need to do is to append to the existing todo's object.

```js
import {
  ADD_TODO,
  TOGGLE_TODO,  
  VisibilityFilters
} from './actions'

...

function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      return {
        todos: [
          ...state.todos,
         {
            text: action.text,
            completed: false
          }
        ]
      }
    }
    default: {
      return state
    }
  }
}
```

Note that:

1.  **We don't mutate the `state`.** We create a copy with the [`... spread operator`](../recipes/UsingObjectSpreadOperator.md).

2.  **We return the previous `state` in the `default` case.** It's important to return the previous `state` for any unknown action. This is because the only way Redux knows to notify consumers is if a **reference** changes. No reference change, no updates.

## Handling More Actions

We have one more action to handle! Just like we did with `ADD_TODO`, we'll import the `TOGGLE_TODO` action and then extend our reducer to handle it.

Just like before, we never write directly to `state` or its fields, and instead we return new objects. The new `todos` is equal to the old `todos` with a single updated index.

Finally, the implementation of the `TOGGLE_TODO` handler shouldn't come as a complete surprise:

```js
case TOGGLE_TODO: {
  return {
    ...state,
    todos: state.todos.map((todo, index) => {
      if (index === action.index) {
        return {...todo, completed: !todo.completed}
      }
      return todo
    })
  }
}
```

Because we want to update a specific item in the array without resorting to mutations, we have to create a new array with the same items except the item at the index. If you find yourself often writing such operations, it's a good idea to use a helper like [immutability-helper](https://github.com/kolodny/immutability-helper), [updeep](https://github.com/substantial/updeep), or even a library like [Immutable](http://facebook.github.io/immutable-js/) that has native support for deep updates. Just remember to never assign to anything inside the `state` unless you clone it first.

## Splitting Reducers

Here is our code so far. It is rather verbose:

```js
function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      }
    }
    case TOGGLE_TODO: {
      return {
        ...state,
        todos: state.todos.map((todo, index) => {
          if (index === action.index) {
            return { ...todo, completed: !todo.completed }
          }
          return todo
        })
      }
    }
    default: {
      return state
    }
  }
}
```

That function for toggling todo's is a bit ugly. Well we can just refactor that out!

```js
function toggleTodoAtIndex(state, index) {
  return state.map((todo, index) => {
    if (index === action.index) {
      return { ...todo, completed: !todo.completed }
    }
    return todo
  })
}

function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO: {
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      }
    }
    case TOGGLE_TODO: {
      return {
        ...state,
        todos: toggleTodoAtIndex(state.todos)
      }
    }
    default: {
      return state
    }
  }
}
```

Note that `toggleTodoAtIndex` also accepts `state`—but it's an array! Now `todoApp` just gives it the slice of the state to manage, and `toggleTodoAtIndex` knows how to update just that slice. **This is called _reducer composition_, and it's the fundamental pattern of building Redux apps.**

Let's explore reducer composition more. What if we want a way to toggle which todos are visible? We can do this with a second reducer.

Can we also extract a reducer managing just `visibilityFilter`? We can.

Below our imports, let's use [ES6 Object Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to declare `SHOW_ALL`:

```js
const { SHOW_ALL } = VisibilityFilters
```

Then:

```js
function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}
```

Now we can rewrite the main reducer as a function that calls the reducers managing parts of the state, and combines them into a single object. It also doesn't need to know the complete initial state anymore. It's enough that the child reducers return their initial state when given `undefined` at first.

```js
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

**Note that each of these reducers is managing its own part of the global state. The `state` parameter is different for every reducer, and corresponds to the part of the state it manages.**

This is already looking good! When the app is larger, we can split the reducers into separate files and keep them completely independent and managing different data domains.

Finally, Redux provides a utility called [`combineReducers()`](../api/combineReducers.md) that does the same boilerplate logic that the `todoApp` above currently does. With its help, we can rewrite `todoApp` like this:

```js
import { combineReducers } from 'redux'

const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp
```

Note that this is equivalent to:

```js
export default function todoApp(state = {}, action) {
  return {
    visibilityFilter: visibilityFilter(state.visibilityFilter, action),
    todos: todos(state.todos, action)
  }
}
```

You could also give them different keys, or call functions differently. These two ways to write a combined reducer are equivalent:

```js
const reducer = combineReducers({
  a: doSomethingWithA,
  b: processB,
  c: c
})
```

```js
function reducer(state = {}, action) {
  return {
    a: doSomethingWithA(state.a, action),
    b: processB(state.b, action),
    c: c(state.c, action)
  }
}
```

All [`combineReducers()`](../api/combineReducers.md) does is generate a function that calls your reducers **with the slices of state selected according to their keys**, and combining their results into a single object again. [It's not magic.](https://github.com/reduxjs/redux/issues/428#issuecomment-129223274) And like other reducers, `combineReducers()` does not create a new object if all of the reducers provided to it do not change state.

> ##### Note for ES6 Savvy Users

> Because `combineReducers` expects an object, we can put all top-level reducers into a separate file, `export` each reducer function, and use `import * as reducers` to get them as an object with their names as the keys:

> ```js
> import { combineReducers } from 'redux'
> import * as reducers from './reducers'
>
> const todoApp = combineReducers(reducers)
> ```
>
> Because `import *` is still new syntax, we don't use it anymore in the documentation to avoid [confusion](https://github.com/reduxjs/redux/issues/428#issuecomment-129223274), but you may encounter it in some community examples.

## Source Code

#### `reducers.js`

```js
import { combineReducers } from 'redux'
import {
  ADD_TODO,
  TOGGLE_TODO,
  SET_VISIBILITY_FILTER,
  VisibilityFilters
} from './actions'
const { SHOW_ALL } = VisibilityFilters

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp
```

## Next Steps

Next, we'll explore how to [create a Redux store](Store.md) that holds the state and takes care of calling your reducer when you dispatch an action.
