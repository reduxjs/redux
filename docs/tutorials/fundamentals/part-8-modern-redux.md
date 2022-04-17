---
id: part-8-modern-redux
title: 'Redux Fundamentals, Part 8: Modern Redux with Redux Toolkit'
sidebar_label: 'Modern Redux with Redux Toolkit'
description: 'The official Fundamentals tutorial for Redux: learn the modern way to write Redux logic'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

# Redux Fundamentals, Part 8: Modern Redux with Redux Toolkit

:::tip What You'll Learn

- How to simplify your Redux logic using Redux Toolkit
- Next steps for learning and using Redux

:::

Congratulations, you've made it to the last section of this tutorial! We've got one more topic to cover before we're done.

If you'd like a reminder of what we've covered so far, take a look at this summary:

:::info

<DetailedExplanation title="Recap: What You've Learned">

- [Part 1: Overview](./part-1-overview.md):
  - what Redux is, when/why to use it, and the basic pieces of a Redux app
- [Part 2: Concepts and Data Flow](./part-2-concepts-data-flow.md):
  - How Redux uses a "one-way data flow" pattern
- [Part 3: State, Actions, and Reducers](./part-3-state-actions-reducers.md):
  - Redux state is made of plain JS data
  - Actions are objects that describe "what happened" events in an app
  - Reducers take current state and an action, and calculate a new state
  - Reducers must follow rules like "immutable updates" and "no side effects"
- [Part 4: Store](./part-4-store.md):
  - The `createStore` API creates a Redux store with a root reducer function
  - Stores can be customized using "enhancers" and "middleware"
  - The Redux DevTools extension lets you see how your state changes over time
- [Part 5: UI and React](./part-5-ui-and-react.md):
  - Redux is separate from any UI, but frequently used with React
  - React-Redux provides APIs to let React components talk to Redux stores
  - `useSelector` reads values from Redux state and subscribes to updates
  - `useDispatch` lets components dispatch actions
  - `<Provider>` wraps your app and lets components access the store
- [Part 6: Async Logic and Data Fetching](./part-6-async-logic.md):
  - Redux middleware allow writing logic that has side effects
  - Middleware add an extra step to the Redux data flow, enabling async logic
  - Redux "thunk" functions are the standard way to write basic async logic
- [Part 7: Standard Redux Patterns](./part-7-standard-patterns.md):
  - Action creators encapsulate preparing action objects and thunks
  - Memoized selectors optimize calculating transformed data
  - Request status should be tracked with loading state enum values
  - Normalized state makes it easier to look up items by IDs

</DetailedExplanation>

:::

As you've seen, many aspects of Redux involve writing some code that can be verbose, such as immutable updates, action types and action creators, and normalizing state. There's good reasons why these patterns exist, but writing that code "by hand" can be difficult. In addition, the process for setting up a Redux store takes several steps, and we've had to come up with our own logic for things like dispatching "loading" actions in thunks or processing normalized data. Finally, many times users aren't sure what "the right way" is to write Redux logic.

That's why the Redux team created [**Redux Toolkit**: our official, opinionated, "batteries included" toolset for efficient Redux development](https://redux-toolkit.js.org).

Redux Toolkit contains packages and functions that we think are essential for building a Redux app. Redux Toolkit builds in our suggested best practices, simplifies most Redux tasks, prevents common mistakes, and makes it easier to write Redux applications.

Because of this, **Redux Toolkit is the standard way to write Redux application logic**. The "hand-written" Redux logic you've written so far in this tutorial is actual working code, but **you shouldn't write Redux logic by hand** - we've covered those approaches in this tutorial so that you understand _how_ Redux works. However, **for real applications, you should use Redux Toolkit to write your Redux logic.**

When you use Redux Toolkit, all the concepts that we've covered so far (actions, reducers, store setup, action creators, thunks, etc) still exist, but **Redux Toolkit provides easier ways to write that code**.

:::tip

Redux Toolkit _only_ covers the Redux logic - we still use React-Redux to let our React components talk to the Redux store, including `useSelector` and `useDispatch`.

:::

So, let's see how we can use Redux Toolkit to simplify the code we've already written in our example todo application. We'll primarily be rewriting our "slice" files, but we should be able to keep all the UI code the same.

Before we continue, **add the Redux Toolkit package to your app**:

```bash
npm install @reduxjs/toolkit
```

## Store Setup

We've gone through a few iterations of setup logic for our Redux store. Currently, it looks like this:

```js title="src/rootReducer.js"
import { combineReducers } from 'redux'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  todos: todosReducer,
  filters: filtersReducer
})

export default rootReducer
```

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))

const store = createStore(rootReducer, composedEnhancer)
export default store
```

Notice that the setup process takes several steps. We have to:

- Combine the slice reducers together to form the root reducer
- Import the root reducer into the store file
- Import the thunk middleware, `applyMiddleware`, and `composeWithDevTools` APIs
- Create a store enhancer with the middleware and devtools
- Create the store with the root reducer

It would be nice if we could cut down the number of steps here.

### Using `configureStore`

**Redux Toolkit has a `configureStore` API that simplifies the store setup process**. `configureStore` wraps around the Redux core `createStore` API, and handles most of the store setup for us automatically. In fact, we can cut it down to effectively one step:

```js title="src/store.js"
// highlight-next-line
import { configureStore } from '@reduxjs/toolkit'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

// highlight-start
const store = configureStore({
  reducer: {
    // Define a top-level state field named `todos`, handled by `todosReducer`
    todos: todosReducer,
    filters: filtersReducer
  }
})
// highlight-end

export default store
```

That one call to `configureStore` did all the work for us:

- It combined `todosReducer` and `filtersReducer` into the root reducer function, which will handle a root state that looks like `{todos, filters}`
- It created a Redux store using that root reducer
- It automatically added the `thunk` middleware
- It automatically added more middleware to check for common mistakes like accidentally mutating the state
- It automatically set up the Redux DevTools Extension connection

We can confirm this works by opening up our example todo application and using it. All of our existing feature code works fine! Since we're dispatching actions, dispatching thunks, reading state in the UI, and looking at the action history in the DevTools, all those pieces must be working correctly. All we've done is switched out the store setup code.

Let's see what happens now if we accidentally mutate some of the state. What if we change the "todos loading" reducer so that it directly changes the state field, instead of immutably making a copy?

```js title="src/features/todos/todosSlice"
export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // omit other cases
    case 'todos/todosLoading': {
      // ❌ WARNING: example only - don't do this in a normal reducer!
      state.status = 'loading'
      return state
    }
    default:
      return state
  }
}
```

Uh-oh. Our whole app just crashed! What happened?

![Immutability check middleware error](/img/tutorials/fundamentals/immutable-error.png)

**This error message is a _good_ thing - we caught a bug in our app!** `configureStore` specifically added an extra middleware that automatically throws an error whenever it sees an accidental mutation of our state (in development mode only). That helps catch mistakes we might make while writing our code.

### Package Cleanup

Redux Toolkit already includes several of the packages we're using, like `redux`, `redux-thunk`, and `reselect`, and re-exports those APIs. So, we can clean up our project a bit.

First, we can switch our `createSelector` import to be from `'@reduxjs/toolkit'` instead of `'reselect'`. Then, we can remove the separate packages we have listed in our `package.json`:

```js
npm uninstall redux redux-thunk reselect
```

To be clear, **we're still using these packages and need to have them installed**. However, because Redux Toolkit depends on them, they'll be installed automatically when we install `@reduxjs/toolkit`, so we don't need to have the other packages specifically listed in our `package.json` file.

## Writing Slices

As we've added new features to our app, the slice files have gotten bigger and more complicated. In particular, the `todosReducer` has gotten harder to read because of all the nested object spreads for immutable updates, and we've written multiple action creator functions.

**Redux Toolkit has a `createSlice` API that will help us simplify our Redux reducer logic and actions**. `createSlice` does several important things for us:

- We can write the case reducers as functions inside of an object, instead of having to write a `switch/case` statement
- The reducers will be able to write shorter immutable update logic
- All the action creators will be generated automatically based on the reducer functions we've provided

### Using `createSlice`

`createSlice` takes an object with three main options fields:

- `name`: a string that will be used as the prefix for generated action types
- `initialState`: the initial state of the reducer
- `reducers`: an object where the keys are strings, and the values are "case reducer" functions that will handle specific actions

Let's look at a small standalone example first.

```js title="createSlice  example"
import { createSlice } from '@reduxjs/toolkit'

const initialState = []

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      // ✅ This "mutating" code is okay inside of createSlice!
      state.push(action.payload)
    },
    todoToggled(state, action) {
      const todo = state.find(todo => todo.id === action.payload)
      todo.completed = !todo.completed
    },
    todosLoading(state, action) {
      return {
        ...state,
        status: 'loading'
      }
    }
  }
})

export const { todoAdded, todoToggled, todosLoading } = todosSlice.actions

export default todosSlice.reducer
```

There's several things to see in this example:

- We write case reducer functions inside the `reducers` object, and give them readable names
- **`createSlice` will automatically generate action creators** that correspond to each case reducer function we provide
- createSlice automatically returns the existing state in the default case
- **`createSlice` allows us to safely "mutate" our state!**
- But, we can also make immutable copies like before if we want to

The generated action creators will be available as `slice.actions.todoAdded`, and we typically destructure and export those individually like we did with the action creators we wrote earlier. The complete reducer function is available as `slice.reducer`, and we typically `export default slice.reducer`, again the same as before.

So what do these auto-generated action objects look like? Let's try calling one of them and logging the action to see:

```js
console.log(todoToggled(42))
// {type: 'todos/todoToggled', payload: 42}
```

`createSlice` generated the action type string for us, by combining the slice's `name` field with the `todoToggled` name of the reducer function we wrote. By default, the action creator accepts one argument, which it puts into the action object as `action.payload`.

Inside of the generated reducer function, `createSlice` will check to see if a dispatched action's `action.type` matches one of the names it generated. If so, it will run that case reducer function. This is exactly the same pattern that we wrote ourselves using a `switch/case` statement, but `createSlice` does it for us automatically.

It's also worth talking about the "mutation" aspect in more detail.

### Immutable Updates with Immer

Earlier, we talked about "mutation" (modifying existing object/array values) and "immutability" (treating values as something that cannot be changed).

:::warning

In Redux, **our reducers are _never_ allowed to mutate the original / current state values!**

```js
// ❌ Illegal - by default, this will mutate the state!
state.value = 123
```

:::

So if we can't change the originals, how do we return an updated state?

:::tip

**Reducers can only make _copies_ of the original values, and then they can mutate the copies.**

```js
// This is safe, because we made a copy
return {
  ...state,
  value: 123
}
```

:::

As you've seen throughout this tutorial, we can write immutable updates by hand by using JavaScript's array / object spread operators and other functions that return copies of the original values. However, writing immutable update logic by hand _is_ hard, and accidentally mutating state in reducers is the single most common mistake Redux users make.

**That's why Redux Toolkit's `createSlice` function lets you write immutable updates an easier way!**

`createSlice` uses a library called [Immer](https://immerjs.github.io/immer/) inside. Immer uses a special JS tool called a `Proxy` to wrap the data you provide, and lets you write code that "mutates" that wrapped data. But, **Immer tracks all the changes you've tried to make, and then uses that list of changes to return a safely immutably updated value**, as if you'd written all the immutable update logic by hand.

So, instead of this:

```js
function handwrittenReducer(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```

You can write code that looks like this:

```js
function reducerWithImmer(state, action) {
  state.first.second[action.someId].fourth = action.someValue
}
```

That's a lot easier to read!

But, here's something _very_ important to remember:

:::warning

**You can _only_ write "mutating" logic in Redux Toolkit's `createSlice` and `createReducer` because they use Immer inside! If you write mutating logic in reducers without Immer, it _will_ mutate the state and cause bugs!**

:::

Immer still lets us write immutable updates by hand and return the new value ourselves if we want to. You can even mix and match. For example, removing an item from an array is often easier to do with `array.filter()`, so you could call that and then assign the result to `state` to "mutate" it:

```js
// can mix "mutating" and "immutable" code inside of Immer:
state.todos = state.todos.filter(todo => todo.id !== action.payload)
```

### Converting the Todos Reducer

Let's start converting our todos slice file to use `createSlice` instead. We'll pick a couple specific cases from our switch statement first to show how the process works.

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'idle',
  entities: {}
}

// highlight-start
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload
      state.entities[todo.id] = todo
    },
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    }
  }
})

export const { todoAdded, todoToggled } = todosSlice.actions

export default todosSlice.reducer
// highlight-end
```

The todos reducer in our example app is still using normalized state that is nested in a parent object, so the code here is a bit different than the miniature `createSlice` example we just looked at. Remember how we had to [write a lot of nested spread operators to toggle that todo earlier](./part-7-standard-patterns.md#normalized-state)? Now that same code is a _lot_ shorter and easier to read.

Let's add a couple more cases to this reducer.

```js title="src/features/todos/todosSlice.js"
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload
      state.entities[todo.id] = todo
    },
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    },
    // highlight-start
    todoColorSelected: {
      reducer(state, action) {
        const { color, todoId } = action.payload
        state.entities[todoId].color = color
      },
      prepare(todoId, color) {
        return {
          payload: { todoId, color }
        }
      }
    },
    todoDeleted(state, action) {
      delete state.entities[action.payload]
    }
    // highlight-end
  }
})

export const { todoAdded, todoToggled, todoColorSelected, todoDeleted } =
  todosSlice.actions

export default todosSlice.reducer
```

The action creators for `todoAdded` and `todoToggled` only need to take a single parameter, like an entire todo object or a todo ID. But, what if we need to pass in multiple parameters, or do some of that "preparation" logic we talked about like generating a unique ID?

`createSlice` lets us handle those situations by adding a "prepare callback" to the reducer. We can pass an object that has functions named `reducer` and `prepare`. When we call the generated action creator, the `prepare` function will be called with whatever parameters were passed in. It should then create and return an object that has a `payload` field (or, optionally, `meta` and `error` fields), matching the [Flux Standard Action convention](./part-7-standard-patterns.md#flux-standard-actions).

Here, we've used a prepare callback to let our `todoColorSelected` action creator accept separate `todoId` and `color` arguments, and put them together as an object in `action.payload`.

Meanwhile, in the `todoDeleted` reducer, we can use the JS `delete` operator to remove items from our normalized state.

We can use these same patterns to go rewrite the rest of our reducers in `todosSlice.js` and `filtersSlice.js`.

Here's how our code looks with all the slices converted:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-9-createSlice/?fontsize=14&hidenavigation=1&theme=dark&module=%2Fsrc%2Ffeatures%2Ftodos%2FtodosSlice.js&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## Writing Thunks

We've seen how we can [write thunks that dispatch "loading", "request succeeded", and "request failed" actions](./part-7-standard-patterns.md#loading-state-enum-values). We had to write action creators, action types, _and_ reducers to handle those cases.

Because this pattern is so common, **Redux Toolkit has a `createAsyncThunk` API that will generate these thunks for us**. It also generates the action types and action creators for those different request status actions, and dispatches those actions automatically based on the resulting `Promise`.

:::tip

Redux Toolkit has a new [**RTK Query data fetching API**](https://redux-toolkit.js.org/rtk-query/overview). RTK Query is a purpose built data fetching and caching solution for Redux apps, and **can eliminate the need to write _any_ thunks or reducers to manage data fetching**. We encourage you to try it out and see if it can help simplify the data fetching code in your own apps!

We'll be updating the Redux tutorials soon to include sections on using RTK Query. Until then, see [the RTK Query section in the Redux Toolkit docs](https://redux-toolkit.js.org/rtk-query/overview).

:::

### Using `createAsyncThunk`

Let's replace our `fetchTodos` thunk by generating a thunk with `createAsyncThunk`.

`createAsyncThunk` accepts two arguments:

- A string that will be used as the prefix for the generated action types
- A "payload creator" callback function that should return a `Promise`. This is often written using the `async/await` syntax, since `async` functions automatically return a promise.

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// omit imports and state

// highlight-start
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})
// highlight-end

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // omit reducer cases
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const newEntities = {}
        action.payload.forEach(todo => {
          newEntities[todo.id] = todo
        })
        state.entities = newEntities
        state.status = 'idle'
      })
  }
})

// omit exports
```

We pass `'todos/fetchTodos'` as the string prefix, and a "payload creator" function that calls our API and returns a promise containing the fetched data. Inside, `createAsyncThunk` will generate three action creators and action types, plus a thunk function that automatically dispatches those actions when called. In this case, the action creators and their types are:

- `fetchTodos.pending`: `todos/fetchTodos/pending`
- `fetchTodos.fulfilled`: `todos/fetchTodos/fulfilled`
- `fetchTodos.rejected`: `todos/fetchTodos/rejected`

However, these action creators and types are being defined _outside_ of the `createSlice` call. We can't handle those inside of the `createSlice.reducers` field, because those generate new action types too. We need a way for our `createSlice` call to listen for _other_ action types that were defined elsewhere.

**`createSlice` also accepts an `extraReducers` option, where we can have the same slice reducer listen for other action types**. This field should be a callback function with a `builder` parameter, and we can call `builder.addCase(actionCreator, caseReducer)` to listen for other actions.

So, here we've called `builder.addCase(fetchTodos.pending, caseReducer)`. When that action is dispatched, we'll run the reducer that sets `state.status = 'loading'`, same as it did earlier when we wrote that logic in a switch statement. We can do the same thing for `fetchTodos.fulfilled`, and handle the data we received from the API.

As one more example, let's convert `saveNewTodo`. This thunk takes the `text` of the new todo object as its parameter, and saves it to the server. How do we handle that?

```js title="src/features/todos/todosSlice.js"
// omit imports

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

// highlight-start
export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  return response.todo
})
// highlight-end

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // omit case reducers
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const newEntities = {}
        action.payload.forEach(todo => {
          newEntities[todo.id] = todo
        })
        state.entities = newEntities
        state.status = 'idle'
      })
      // highlight-start
      .addCase(saveNewTodo.fulfilled, (state, action) => {
        const todo = action.payload
        state.entities[todo.id] = todo
      })
    // highlight-end
  }
})

// omit exports and selectors
```

The process for `saveNewTodo` is the same as we saw for `fetchTodos`. We call `createAsyncThunk`, and pass in the action prefix and a payload creator. Inside the payload creator, we make an async API call, and return a result value.

In this case, when we call `dispatch(saveNewTodo(text))`, the `text` value will be passed in to the payload creator as its first argument.

While we won't cover `createAsyncThunk` in more detail here, a few other quick notes for reference:

- You can only pass one argument to the thunk when you dispatch it. If you need to pass multiple values, pass them in a single object
- The payload creator will receive an object as its second argument, which contains `{getState, dispatch}`, and some other useful values
- The thunk dispatches the `pending` action before running your payload creator, then dispatches either `fulfilled` or `rejected` based on whether the `Promise` you return succeeds or fails

## Normalizing State

We previously saw how to "normalize" state, by keeping items in an object keyed by item IDs. This gives us the ability to look up any item by its ID without having to loop through an entire array. However, writing the logic to update normalized state by hand was long and tedious. Writing "mutating" update code with Immer makes that simpler, but there's still likely to be a lot of repetition - we might be loading many different types of items in our app, and we'd have to repeat the same reducer logic each time.

**Redux Toolkit includes a `createEntityAdapter` API that has prebuilt reducers for typical data update operations with normalized state**. This includes adding, updating, and removing items from a slice. **`createEntityAdapter` also generates some memoized selectors for reading values from the store**.

### Using `createEntityAdapter`

Let's replace our normalized entity reducer logic with `createEntityAdapter`.

Calling `createEntityAdapter` gives us an "adapter" object that contains several premade reducer functions, including:

- `addOne` / `addMany`: add new items to the state
- `upsertOne` / `upsertMany`: add new items or update existing ones
- `updateOne` / `updateMany`: update existing items by supplying partial values
- `removeOne` / `removeMany`: remove items based on IDs
- `setAll`: replace all existing items

We can use these functions as case reducers, or as "mutating helpers" inside of `createSlice`.

The adapter also contains:

- `getInitialState`: returns an object that looks like `{ ids: [], entities: {} }`, for storing a normalized state of items along with an array of all item IDs
- `getSelectors`: generates a standard set of selector functions

Let's see how we can use these in our todos slice:

```js title="src/features/todos/todosSlice.js"
// highlight-start
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit'
// omit some imports

// highlight-start
const todosAdapter = createEntityAdapter()

const initialState = todosAdapter.getInitialState({
  status: 'idle'
})
// highlight-end

// omit thunks

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // omit some reducers
    // highlight-start
    // Use an adapter reducer function to remove a todo by ID
    todoDeleted: todosAdapter.removeOne,
    // highlight-end
    completedTodosCleared(state, action) {
      const completedIds = Object.values(state.entities)
        .filter(todo => todo.completed)
        .map(todo => todo.id)
      // highlight-start
      // Use an adapter function as a "mutating" update helper
      todosAdapter.removeMany(state, completedIds)
      // highlight-end
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        todosAdapter.setAll(state, action.payload)
        state.status = 'idle'
      })
      // highlight-start
      // Use another adapter function as a reducer to add a todo
      .addCase(saveNewTodo.fulfilled, todosAdapter.addOne)
    // highlight-end
  }
})

// omit selectors
```

The different adapter reducer functions take different values depending on the function, all in `action.payload`. The "add" and "upsert" functions take a single item or an array of items, the "remove" functions take a single ID or array of IDs, and so on.

`getInitialState` allows us to pass in additional state fields that will be included. In this case, we've passed in a `status` field, giving us a final todos slice state of `{ids, entities, status}`, much like we had before.

We can also replace some of our todos selector functions as well. The `getSelectors` adapter function will generate selectors like `selectAll`, which returns an array of all items, and `selectById`, which returns one item. However, since `getSelectors` doesn't know where our data is in the entire Redux state tree, we need to pass in a small selector that returns this slice out of the whole state tree. Let's switch to using these instead. Since this is the last major change to our code, we'll include the whole todos slice file this time to see what the final version of the code looks like using Redux Toolkit:

```js title="src/features/todos/todosSlice.js"
import {
  createSlice,
  createSelector,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit'
import { client } from '../../api/client'
import { StatusFilters } from '../filters/filtersSlice'

const todosAdapter = createEntityAdapter()

const initialState = todosAdapter.getInitialState({
  status: 'idle'
})

// Thunk functions
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  return response.todo
})

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    },
    todoColorSelected: {
      reducer(state, action) {
        const { color, todoId } = action.payload
        state.entities[todoId].color = color
      },
      prepare(todoId, color) {
        return {
          payload: { todoId, color }
        }
      }
    },
    todoDeleted: todosAdapter.removeOne,
    allTodosCompleted(state, action) {
      Object.values(state.entities).forEach(todo => {
        todo.completed = true
      })
    },
    completedTodosCleared(state, action) {
      const completedIds = Object.values(state.entities)
        .filter(todo => todo.completed)
        .map(todo => todo.id)
      todosAdapter.removeMany(state, completedIds)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        todosAdapter.setAll(state, action.payload)
        state.status = 'idle'
      })
      .addCase(saveNewTodo.fulfilled, todosAdapter.addOne)
  }
})

export const {
  allTodosCompleted,
  completedTodosCleared,
  todoAdded,
  todoColorSelected,
  todoDeleted,
  todoToggled
} = todosSlice.actions

export default todosSlice.reducer

// highlight-start
export const { selectAll: selectTodos, selectById: selectTodoById } =
  todosAdapter.getSelectors(state => state.todos)
// highlight-end

export const selectTodoIds = createSelector(
  // First, pass one or more "input selector" functions:
  selectTodos,
  // Then, an "output selector" that receives all the input results as arguments
  // and returns a final result value
  todos => todos.map(todo => todo.id)
)

export const selectFilteredTodos = createSelector(
  // First input selector: all todos
  selectTodos,
  // Second input selector: all filter values
  state => state.filters,
  // Output selector: receives both values
  (todos, filters) => {
    const { status, colors } = filters
    const showAllCompletions = status === StatusFilters.All
    if (showAllCompletions && colors.length === 0) {
      return todos
    }

    const completedStatus = status === StatusFilters.Completed
    // Return either active or completed todos based on filter
    return todos.filter(todo => {
      const statusMatches =
        showAllCompletions || todo.completed === completedStatus
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches
    })
  }
)

export const selectFilteredTodoIds = createSelector(
  // Pass our other memoized selector as an input
  selectFilteredTodos,
  // And derive data in the output selector
  filteredTodos => filteredTodos.map(todo => todo.id)
)
```

We call `todosAdapter.getSelectors`, and pass in a `state => state.todos` selector that returns this slice of state. From there, the adapter generates a `selectAll` selector that takes the _entire_ Redux state tree, as usual, and loops over `state.todos.entities` and `state.todos.ids` to give us the complete array of todo objects. Since `selectAll` doesn't tell us _what_ we're selecting, we can use ES6 destructuring syntax to rename the function to `selectTodos`. Similarly, we can rename `selectById` to `selectTodoById`.

Notice that our other selectors still use `selectTodos` as an input. That's because it's still returning an array of todo objects this whole time, no matter whether we were keeping the array as the entire `state.todos`, keeping it as a nested array, or storing it as a normalized object and converting to an array. Even as we've made all these changes to how we stored our data, the use of selectors allowed us to keep the rest of our code the same, and the use of memoized selectors has helped the UI perform better by avoiding unnecessary rerenders.

## What You've Learned

**Congratulations! You've completed the "Redux Fundamentals" tutorial!**

You should now have a solid understanding of what Redux is, how it works, and how to use it correctly:

- Managing global app state
- Keeping the state of our app as plain JS data
- Writing action objects that describe "what happened" in the app
- Using reducer functions that look at the current state and an action, and create a new state immutably in response
- Reading the Redux state in our React components with `useSelector`
- Dispatching actions from React components with `useDispatch`

In addition, you've seen how **Redux Toolkit simplifies writing Redux logic**, and why **Redux Toolkit is the standard approach for writing real Redux applications**. By seeing how to write Redux code "by hand" first, it should be clear what the Redux Toolkit APIs like `createSlice` are doing for you, so that you don't have to write that code yourself.

:::info

For more info on Redux Toolkit, including usage guides and API references, see:

- The Redux Toolkit docs at **https://redux-toolkit.js.org**

:::

Let's take one final look at the completed todo application, including all the code that's been converted to use Redux Toolkit:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-10-finalCode/?fontsize=14&hidenavigation=1&theme=dark&module=%2Fsrc%2Ffeatures%2Ftodos%2FtodosSlice.js&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

And we'll do a final recap of the key points you learned in this section:

:::tip Summary

- **Redux Toolkit (RTK) is the standard way to write Redux logic**
  - RTK includes APIs that simplify most Redux code
  - RTK wraps around the Redux core, and includes other useful packages
- **`configureStore` sets up a Redux store with good defaults**
  - Automatically combines slice reducers to create the root reducer
  - Automatically sets up the Redux DevTools Extension and debugging middleware
- **`createSlice` simplifies writing Redux actions and reducers**
  - Automatically generates action creators based on slice/reducer names
  - Reducers can "mutate" state inside `createSlice` using Immer
- **`createAsyncThunk` generates thunks for async calls**
  - Automatically generates a thunk + `pending/fulfilled/rejected` action creators
  - Dispatching the thunk runs your payload creator and dispatches the actions
  - Thunk actions can be handled in `createSlice.extraReducers`
- **`createEntityAdapter` provides reducers + selectors for normalized state**
  - Includes reducer functions for common tasks like adding/updating/removing items
  - Generates memoized selectors for `selectAll` and `selectById`

:::

## Next Steps for Learning and Using Redux

Now that you've completed this tutorial, we have several suggestions for what you should try next to learn more about Redux.

This "Fundamentals" tutorial focused on the low-level aspects of Redux: writing action types and immutable updates by hand, how a Redux store and middleware work, and why we use patterns like action creators and normalized state. In addition, our todo example app is fairly small, and not meant as a realistic example of building a full app.

However, our [**"Redux Essentials" tutorial**](../essentials/part-1-overview-concepts.md) specifically teaches you **how to build a "real-world" type application**. It focuses on "how to use Redux the right way" using Redux Toolkit, and talks about more realistic patterns that you'll see in larger apps. It covers many of the same topics as this "Fundamentals" tutorial, such as why reducers need to use immutable updates, but with a focus on building a real working application. **We strongly recommend reading through the "Redux Essentials" tutorial as your next step.**

At the same time, the concepts we've covered in this tutorial should be enough to get you started building your own applications using React and Redux. Now's a great time to try working on a project yourself to solidify these concepts and see how they work in practice. If you're not sure what kind of a project to build, see [this list of app project ideas](https://github.com/florinpop17/app-ideas) for some inspiration.

The [Using Redux](../../usage/index.md) section has information on a number of important concepts, like [how to structure your reducers](../../usage/structuring-reducers/StructuringReducers.md), and [**our Style Guide page**](../../style-guide/style-guide.md) has important information on our recommended patterns and best practices.

If you'd like to know more about _why_ Redux exists, what problems it tries to solve, and how it's meant to be used, see Redux maintainer Mark Erikson's posts on [The Tao of Redux, Part 1: Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) and [The Tao of Redux, Part 2: Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/).

If you're looking for help with Redux questions, come join [the `#redux` channel in the Reactiflux server on Discord](https://www.reactiflux.com).

**Thanks for reading through this tutorial, and we hope you enjoy building applications with Redux!**
