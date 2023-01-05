---
id: deriving-data-selectors
title: Deriving Data with Selectors
description: 'Usage > Redux Logic > Selectors: deriving data from the Redux state'
---

:::tip What You'll Learn

- Why good Redux architecture keeps state minimal and derives additional data
- Principles of using selector functions to derive data and encapsulate lookups
- How to use the Reselect library to write memoized selectors for optimization
- Advanced techniques for using Reselect
- Additional tools and libraries for creating selectors
- Best practices for writing selectors

:::

## Deriving Data

We specifically recommend that Redux apps should [keep the Redux state minimal, and derive additional values from that state whenever possible](../style-guide/style-guide.md#keep-state-minimal-and-derive-additional-values).

This includes things like calculating filtered lists or summing up values. As an example, a todo app would keep an original list of todo objects in state, but derive a filtered list of todos outside the state whenever the state is updated. Similarly, a check for whether all todos have been completed, or number of todos remaining, can be calculated outside the store as well.

This has several benefits:

- The actual state is easier to read
- Less logic is needed to calculate those additional values and keep them in sync with the rest of the data
- The original state is still there as a reference and isn't being replaced

:::tip

This is _also_ a good principle for React state as well! Many times users tried to define a `useEffect` hook that waits for a state value to change, and then sets state with some derived value like `setAllCompleted(allCompleted)`. Instead, that value can be derived during the rendering process and used directly, without having to save the value into state at all:

```js
function TodoList() {
  const [todos, setTodos] = useState([])

  // highlight-start
  // Derive the data while rendering
  const allTodosCompleted = todos.every(todo => todo.completed)
  // highlight-end

  // render with this value
}
```

:::

## Calculating Derived Data with Selectors

In a typical Redux application, the logic for deriving data is usually written as functions we call **_selectors_**.

Selectors are primarily used to encapsulate logic for looking up specific values from state, logic for actually deriving values, and improving performance by avoiding unnecessary recalculations.

You are not _required_ to use selectors for all state lookups, but they are a standard pattern and widely used.

### Basic Selector Concepts

**A "selector function" is any function that accepts the Redux store state (or part of the state) as an argument, and returns data that is based on that state.**

**Selectors don't have to be written using a special library**, and it doesn't matter whether you write them as arrow functions or the `function` keyword. For example, all of these are valid selector functions:

```js
// Arrow function, direct lookup
const selectEntities = state => state.entities

// Function declaration, mapping over an array to derive values
function selectItemIds(state) {
  return state.items.map(item => item.id)
}

// Function declaration, encapsulating a deep lookup
function selectSomeSpecificField(state) {
  return state.some.deeply.nested.field
}

// Arrow function, deriving values from an array
const selectItemsWhoseNamesStartWith = (items, namePrefix) =>
  items.filter(item => item.name.startsWith(namePrefix))
```

A selector function can have any name you want. However, [**we recommend prefixing selector function names with the word `select` combined with a description of the value being selected**](../style-guide/style-guide.md#name-selector-functions-as-selectthing). Typical examples of this would look like **`selectTodoById`**, **`selectFilteredTodos`**, and **`selectVisibleTodos`**.

If you've used [the `useSelector` hook from React-Redux](../tutorials/fundamentals/part-5-ui-and-react.md), you're probably already familiar with the basic idea of a selector function - the functions that we pass to `useSelector` must be selectors:

```js
function TodoList() {
  // highlight-start
  // This anonymous arrow function is a selector!
  const todos = useSelector(state => state.todos)
  // highlight-end
}
```

Selector functions are typically defined in two different parts of a Redux application:

- In slice files, alongside the reducer logic
- In component files, either outside the component, or inline in `useSelector` calls

A selector function can be used anywhere you have access to the entire Redux root state value. This includes the `useSelector` hook, the `mapState` function for `connect`, middleware, thunks, and sagas. For example, thunks and middleware have access to the `getState` argument, so you can call a selector there:

```js
function addTodosIfAllowed(todoText) {
  return (dispatch, getState) => {
    const state = getState()
    const canAddTodos = selectCanAddTodos(state)

    if (canAddTodos) {
      dispatch(todoAdded(todoText))
    }
  }
}
```

It's not typically possible to use selectors inside of reducers, because a slice reducer only has access to its own slice of the Redux state, and most selectors expect to be given the _entire_ Redux root state as an argument.

### Encapsulating State Shape with Selectors

The first reason to use selector functions is for encapsulation and reusability when dealing with your Redux state shape.

Let's say that one of your `useSelector` hooks makes a very specific lookup into part of your Redux state:

```js
const data = useSelector(state => state.some.deeply.nested.field)
```

That is legal code, and will run fine. But, it might not be the best idea architecturally. Imagine that you've got several components that need to access that field. What happens if you need to make a change to where that piece of state lives? You would now have to go change _every_ `useSelector` hook that references that value. So, in the same way that [we recommend using action creators to encapsulate details of creating actions](../style-guide/style-guide.md#use-action-creators), we recommend defining reusable selectors to encapsulate the knowledge of where a given piece of state lives. Then, you can use a given selector function many times in the codebase, anywhere that your app needs to retrieve that particular data.

**Ideally, only your reducer functions and selectors should know the exact state structure, so if you change where some state lives, you would only need to update those two pieces of logic**.

Because of this, it's often a good idea to define reusable selectors directly inside slice files, rather than always defining them inside of a component.

One common description of selectors is that they're like **"queries into your state"**. You don't care about exactly how the query came up with the data you needed, just that you asked for the data and got back a result.

### Optimizing Selectors with Memoization

Selector functions often need to perform relatively "expensive" calculations, or create derived values that are new object and array references. This can be a concern for application performance, for several reasons:

- Selectors used with `useSelector` or `mapState` will be re-run after every dispatched action, regardless of what section of the Redux root state was actually updated. Re-running expensive calculations when the input state sections didn't change is a waste of CPU time, and it's very likely that the inputs won't have changed most of the time anyway.
- `useSelector` and `mapState` rely on `===` reference equality checks of the return values to determine if the component needs to re-render. If a selector _always_ returns new references, it will force the component to re-render even if the derived data is effectively the same as last time. This is especially common with array operations like `map()` and `filter()`, which return new array references.

As an example, this component is written badly, because its `useSelector` call _always_ returns a new array reference. That means the component will re-render after _every_ dispatched action, even if the input `state.todos` slice hasn't changed:

```js
function TodoList() {
  // highlight-start
  // ❌ WARNING: this _always_ returns a new reference, so it will _always_ re-render!
  const completedTodos = useSelector(state =>
    state.todos.map(todo => todo.completed)
  )
  // highlight-end
}
```

Another example is a component that needs to do some "expensive" work to transform data:

```js
function ExampleComplexComponent() {
  const data = useSelector(state => {
    const initialData = state.data
    const filteredData = expensiveFiltering(initialData)
    const sortedData = expensiveSorting(filteredData)
    const transformedData = expensiveTransformation(sortedData)

    return transformedData
  })
}
```

Similarly, this "expensive" logic will re-run after _every_ dispatched action. Not only will it probably create new references, but it's work that doesn't need to be done unless `state.data` actually changes.

Because of this, we need a way to write optimized selectors that can avoid recalculating results if the same inputs are passed in. This is where the idea of **_memoization_** comes in.

**Memoization is a form of caching**. It involves tracking inputs to a function, and storing the inputs and the results for later reference. If a function is called with the same inputs as before, the function can skip doing the actual work, and return the same result it generated the last time it received those input values. This optimizes performance by only doing work if inputs have changed, and consistently returning the same result references if the inputs are the same.

Next, we'll look at some options for writing memoized selectors.

## Writing Memoized Selectors with Reselect

The Redux ecosystem has traditionally used a library called [**Reselect**](https://github.com/reduxjs/reselect) to create memoized selector functions. There also are other similar libraries, as well as multiple variations and wrappers around Reselect - we'll look at those later.

### `createSelector` Overview

Reselect provides a function called [`createSelector`](https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc) to generate memoized selectors. `createSelector` accepts one or more "input selector" functions, plus an "output selector" function, and returns a new selector function for you to use.

`createSelector` is included as part of [our official Redux Toolkit package](https://redux-toolkit.js.org), and is re-exported for ease of use.

`createSelector` can accept multiple input selectors, which can be provided as separate arguments or as an array. The results from all the input selectors are provided as separate arguments to the output selector:

```js
const selectA = state => state.a
const selectB = state => state.b
const selectC = state => state.c

const selectABC = createSelector([selectA, selectB, selectC], (a, b, c) => {
  // do something with a, b, and c, and return a result
  return a + b + c
})

// Call the selector function and get a result
const abc = selectABC(state)

// could also be written as separate arguments, and works exactly the same
const selectABC2 = createSelector(selectA, selectB, selectC, (a, b, c) => {
  // do something with a, b, and c, and return a result
  return a + b + c
})
```

When you call the selector, Reselect will run your input selectors with all of the arguments you gave, and looks at the returned values. If any of the results are `===` different than before, it will re-run the output selector, and pass in those results as the arguments. If all of the results are the same as the last time, it will skip re-running the output selector, and just return the cached final result from before.

This means that **"input selectors" should usually just extract and return values, and the "output selector" should do the transformation work**.

:::caution

A somewhat common mistake is to write an "input selector" that extracts a value or does some derivation, and an "output selector" that just returns its result:

```js
// ❌ BROKEN: this will not memoize correctly, and does nothing useful!
const brokenSelector = createSelector(
  state => state.todos,
  todos => todos
)
```

**Any "output selector" that just returns its inputs is incorrect!** The output selector should always have the transformation logic.

Similarly, a memoized selector should _never_ use `state => state` as an input! That will force the selector to always recalculate.
:::

In typical Reselect usage, you write your top-level "input selectors" as plain functions, and use `createSelector` to create memoized selectors that look up nested values:

```js
const state = {
  a: {
    first: 5
  },
  b: 10
}

const selectA = state => state.a
const selectB = state => state.b

const selectA1 = createSelector([selectA], a => a.first)

const selectResult = createSelector([selectA1, selectB], (a1, b) => {
  console.log('Output selector running')
  return a1 + b
})

const result = selectResult(state)
// Log: "Output selector running"
console.log(result)
// 15

const secondResult = selectResult(state)
// No log output
console.log(secondResult)
// 15
```

Note that the second time we called `selectResult`, the "output selector" didn't execute. Because the results of `selectA1` and `selectB` were the same as the first call, `selectResult` was able to return the memoized result from the first call.

### `createSelector` Behavior

It's important to note that by default, **`createSelector` only memoizes the most recent set of parameters**. That means that if you call a selector repeatedly with different inputs, it will still return a result, but it will have to keep re-running the output selector to produce the result:

```js
const a = someSelector(state, 1) // first call, not memoized
const b = someSelector(state, 1) // same inputs, memoized
const c = someSelector(state, 2) // different inputs, not memoized
const d = someSelector(state, 1) // different inputs from last time, not memoized
```

Also, you can pass multiple arguments into a selector. Reselect will call all of the input selectors with those exact inputs:

```js
const selectItems = state => state.items
const selectItemId = (state, itemId) => itemId

const selectItemById = createSelector(
  [selectItems, selectItemId],
  (items, itemId) => items[itemId]
)

const item = selectItemById(state, 42)

/*
Internally, Reselect does something like this:

const firstArg = selectItems(state, 42);  
const secondArg = selectItemId(state, 42);  
  
const result = outputSelector(firstArg, secondArg);  
return result;  
*/
```

Because of this, **it's important that all of the "input selectors" you provide should accept the same types of parameters**. Otherwise, the selectors will break.

```js
const selectItems = state => state.items

// expects a number as the second argument
const selectItemId = (state, itemId) => itemId

// expects an object as the second argument
const selectOtherField = (state, someObject) => someObject.someField

const selectItemById = createSelector(
  [selectItems, selectItemId, selectOtherField],
  (items, itemId, someField) => items[itemId]
)
```

In this example, `selectItemId` expects that its second argument will be some simple value, while `selectOtherField` expects that the second argument is an object. If you call `selectItemById(state, 42)`, `selectOtherField` will break because it's trying to access `42.someField`.

### Reselect Usage Patterns and Limitations

#### Nesting Selectors

It's possible to take selectors generated with `createSelector`, and use them as inputs for other selectors as well. In this example, the `selectCompletedTodos` selector is used as an input to `selectCompletedTodoDescriptions`:

```js
const selectTodos = state => state.todos

const selectCompletedTodos = createSelector([selectTodos], todos =>
  todos.filter(todo => todo.completed)
)

const selectCompletedTodoDescriptions = createSelector(
  [selectCompletedTodos],
  completedTodos => completedTodos.map(todo => todo.text)
)
```

#### Passing Input Parameters

A Reselect-generated selector function can be called with as many arguments as you want: `selectThings(a, b, c, d, e)`. However, what matters for re-running the output is not the number of arguments, or whether the arguments themselves have changed to be new references. Instead, it's about the "input selectors" that were defined, and whether _their_ results have changed. Similarly, the arguments for the "output selector" are solely based on what the input selectors return.

This means that if you want to pass additional parameters through to the output selector, you must define input selectors that extract those values from the original selector arguments:

```js
const selectItemsByCategory = createSelector(
  [
    // Usual first input - extract value from `state`
    state => state.items,
    // Take the second arg, `category`, and forward to the output selector
    (state, category) => category
  ],
  // Output selector gets (`items, category)` as args
  (items, category) => items.filter(item => item.category === category)
)
```

For consistency, you may want to consider passing additional parameters to a selector as a single object, such as `selectThings(state, otherArgs)`, and then extracting values from the `otherArgs` object.

#### Selector Factories

**`createSelector` only has a default cache size of 1, and this is per each unique instance of a selector**. This creates problems when a single selector function needs to get reused in multiple places with differing inputs.

One option is to create a "selector factory" - a function that runs `createSelector()` and generates a new unique selector instance every time it's called:

```js
const makeSelectItemsByCategory = () => {
  const selectItemsByCategory = createSelector(
    [state => state.items, (state, category) => category],
    (items, category) => items.filter(item => item.category === category)
  )
  return selectItemsByCategory
}
```

This is particularly useful when multiple similar UI components need to derive different subsets of the data based on props.

## Alternative Selector Libraries

While Reselect is the most widely used selector library with Redux, there are many other libraries that solve similar problems, or expand on Reselect's capabilities.

### `proxy-memoize`

`proxy-memoize` is a relatively new memoized selector library that uses a unique implementation approach. It relies on ES6 `Proxy` objects to track attempted reads of nested values, then compares only the nested values on later calls to see if they've changed. This can provide better results than Reselect in some cases.

A good example of this is a selector that derives an array of todo descriptions:

```js
import { createSelector } from 'reselect'

const selectTodoDescriptionsReselect = createSelector(
  [state => state.todos],
  todos => todos.map(todo => todo.text)
)
```

Unfortunately, this will recalculate the derived array if any other value inside of `state.todos` changes, such as toggling a `todo.completed` flag. The _contents_ of the derived array are identical, but because the input `todos` array changed, it has to calculate a new output array, and that has a new reference.

The same selector with `proxy-memoize` might look like:

```js
import { memoize } from 'proxy-memoize'

const selectTodoDescriptionsProxy = memoize(state =>
  state.todos.map(todo => todo.text)
)
```

Unlike Reselect, `proxy-memoize` can detect that only the `todo.text` fields are being accessed, and will only recalculate the rest if one of the `todo.text` fields changed.

It also has a built-in `size` option, which lets you set the desired cache size for a single selector instance.

It has some tradeoffs and differences from Reselect:

- All values are passed in as a single object argument
- It requires that the environment supports ES6 `Proxy` objects (no IE11)
- It's more magical, whereas Reselect is more explicit
- There are some edge cases regarding the `Proxy`-based tracking behavior
- It's newer and less widely used

All that said, **we officially encourage considering using `proxy-memoize` as a viable alternative to Reselect**.

### `re-reselect`

https://github.com/toomuchdesign/re-reselect improves Reselect's caching behavior, by allowing you to define a "key selector". This is used to manage multiple instances of Reselect selectors internally, which can help simplify usage across multiple components.

```js
import { createCachedSelector } from 're-reselect'

const getUsersByLibrary = createCachedSelector(
  // inputSelectors
  getUsers,
  getLibraryId,

  // resultFunc
  (users, libraryId) => expensiveComputation(users, libraryId)
)(
  // re-reselect keySelector (receives selectors' arguments)
  // Use "libraryName" as cacheKey
  (_state_, libraryName) => libraryName
)
```

### `reselect-tools`

Sometimes it can be hard to trace how multiple Reselect selectors relate to each other, and what caused a selector to recalculate. https://github.com/skortchmark9/reselect-tools provides a way to trace selector dependencies, and its own DevTools to help visualize those relationships and check selector values.

### `redux-views`

https://github.com/josepot/redux-views is similar to `re-reselect`, in that it provides a way to select unique keys for each item for consistent caching. It was designed as a near-drop-in replacement for Reselect, and actually proposed as an option for a potential Reselect version 5.

### Reselect v5 Proposal

We've opened up a roadmap discussion in the Reselect repo to figure out potential enhancements to a future version of Reselect, such as improving the API to better support larger cache sizes, rewriting the codebase in TypeScript, and other possible improvements. We'd welcome additional community feedback in that discussion:

[**Reselect v5 Roadmap Discussion: Goals and API Design**](https://github.com/reduxjs/reselect/discussions/491)

## Using Selectors with React-Redux

### Calling Selectors with Parameters

It's common to want to pass additional arguments to a selector function. However, `useSelector` always calls the provided selector function with one argument - the Redux root `state`.

The simplest solution is to pass an anonymous selector to `useSelector`, and then immediately call the real selector with both `state` and any additional arguments:

```js
import { selectTodoById } from './todosSlice'

function TodoListitem({ todoId }) {
  // highlight-start
  // Captures `todoId` from scope, gets `state` as an arg, and forwards both
  // to the actual selector function to extract the result
  const todo = useSelector(state => selectTodoById(state, todoId))
  // highlight-end
}
```

### Creating Unique Selector Instances

There are many cases where a selector function needs to be reused across multiple components. If the components will all be calling the selector with different arguments, it will break memoization - the selector never sees the same arguments multiple times in a row, and thus can never return a cached value.

The standard approach here is to create a unique instance of a memoized selector in the component, and then use that with `useSelector`. That allows each component to consistently pass the same arguments to its own selector instance, and that selector can correctly memoize the results.

For function components, this is normally done with `useMemo` or `useCallback`:

```js
import { makeSelectItemsByCategory } from './categoriesSlice'

function CategoryList({ category }) {
  // Create a new memoized selector, for each component instance, on mount
  const selectItemsByCategory = useMemo(makeSelectItemsByCategory, [])

  const itemsByCategory = useSelector(state =>
    selectItemsByCategory(state, category)
  )
}
```

For class components with `connect`, this can be done with an advanced "factory function" syntax for `mapState`. If the `mapState` function returns a new function on its first call, that will be used as the real `mapState` function. This provides a closure where you can create a new selector instance:

```js
import { makeSelectItemsByCategory } from './categoriesSlice'

const makeMapState = (state, ownProps) => {
  // Closure - create a new unique selector instance here,
  // and this will run once for every component instance
  const selectItemsByCategory = makeSelectItemsByCategory()

  const realMapState = (state, ownProps) => {
    return {
      itemsByCategory: selectItemsByCategory(state, ownProps.category)
    }
  }

  // Returning a function here will tell `connect` to use it as
  // `mapState` instead of the original one given to `connect`
  return realMapState
}

export default connect(makeMapState)(CategoryList)
```

## Using Selectors Effectively

While selectors are a common pattern in Redux applications, they are often misused or misunderstood. Here are some guidelines for using selector functions correctly.

### Define Selectors Alongside Reducers

Selector functions are often defined in the UI layer, directly inside of `useSelector` calls. However, this means that there can be repetition between selectors defined in different files, and the functions are anonymous.

Like any other function, you can extract an anonymous function outside the component to give it a name:

```js
// highlight-next-line
const selectTodos = state => state.todos

function TodoList() {
  // highlight-next-line
  const todos = useSelector(selectTodos)
}
```

However, multiple parts of the application may want to use the same lookups. Also, conceptually, we may want to keep the knowledge of how the `todos` state is organized as an implementation detail inside the `todosSlice` file, so that it's all in one place.

Because of this, **it's a good idea to define reusable selectors alongside their corresponding reducers**. In this case, we could export `selectTodos` from the `todosSlice` file:

```js title="src/features/todos/todosSlice.js"
import { createSlice } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded(state, action) {
      state.push(action.payload)
    }
  }
})

export const { todoAdded } = todosSlice.actions
export default todosSlice.reducer

// highlight-start
// Export a reusable selector here
export const selectTodos = state => state.todos
// highlight-end
```

That way, if we happen to make an update to the structure of the todos slice state, the relevant selectors are right here and can be updated at the same time, with minimal changes to any other parts of the app.

### Balance Selector Usage

It's possible to add _too many_ selectors to an application. **Adding a separate selector function for every single field is not a good idea!** That ends up turning Redux into something resembling a Java class with getter/setter functions for every field. It's not going to _improve_ the code, and it's probably going to make the code _worse_ - maintaining all those extra selectors is a lot of additional effort, and it will be harder to trace what values are being used where.

Similarly, **don't make every single selector memoized!**. Memoization is only needed if you are truly _deriving_ results, _and_ if the derived results would likely create new references every time. **A selector function that does a direct lookup and return of a value should be a plain function, not memoized**.

Some examples of when and when not to memoize:

```js
// ❌ DO NOT memoize: will always return a consistent reference
const selectTodos = state => state.todos
const selectNestedValue = state => state.some.deeply.nested.field
const selectTodoById = (state, todoId) => state.todos[todoId]

// ❌ DO NOT memoize: deriving data, but will return a consistent result
const selectItemsTotal = state => {
  return state.items.reduce((result, item) => {
    return result + item.total
  }, 0)
}
const selectAllCompleted = state => state.todos.every(todo => todo.completed)

// ✅ SHOULD memoize: returns new references when called
const selectTodoDescriptions = state => state.todos.map(todo => todo.text)
```

### Reshape State as Needed for Components

Selectors do not have to limit themselves to direct lookups - they can perform _any_ needed transformation logic inside. This is especially valuable to help prepare data that is needed by specific components.

A Redux state often has data in a "raw" form, because [the state should be kept minimal](#deriving-data), and many components may need to present the same data differently. You can use selectors to not only _extract_ state, but to _reshape_ it as needed for this specific component's needs. That could include pulling data from multiple slices of the root state, extracting specific values, merging different pieces of the data together, or any other transformations that are helpful.

It's fine if a component has some of this logic too, but it can be beneficial to pull all of this transformation logic out into separate selectors for better reuse and testability.

### Globalize Selectors if Needed

There's an inherent imbalance between writing slice reducers and selectors. Slice reducers only know about their one portion of the state - to the reducer, its `state` is all that exists, such as the array of todos in a `todoSlice`. Selectors, on the other hand, _usually_ are written to take the entire Redux root state as their argument. This means that they have to know where in the root state this slice's data is kept, such as `state.todos`, even though that's not really defined until the root reducer is created (typically in the app-wide store setup logic).

A typical slice file often has both of these patterns side-by-side. That's fine, especially in small or midsize apps. But, depending on your app's architecture, you may want to further abstract the selectors so that they _don't_ know where the slice state is kept - it has to be handed to them.

We refer to this pattern as "globalizing" selectors. A **"globalized" selector** is one that accepts the Redux root state as an argument, and knows how to find the relevant slice of state to perform the real logic. A **"localized" selector** is one that expects _just a piece_ of the state as an argument, without knowing or caring where that is in the root state:

```js
// "Globalized" - accepts root state, knows to find data at `state.todos`
const selectAllTodosCompletedGlobalized = state =>
  state.todos.every(todo => todo.completed)

// "Localized" - only accepts `todos` as argument, doesn't know where that came from
const selectAllTodosCompletedLocalized = todos =>
  todos.every(todo => todo.completed)
```

"Localized" selectors can be turned into "globalized" selectors by wrapping them in a function that knows how to retrieve the right slice of state and pass it onwards.

Redux Toolkit's [`createEntityAdapter` API](https://redux-toolkit.js.org/api/createEntityAdapter#selector-functions) is an example of this pattern. If you call `todosAdapter.getSelectors()`, with no argument, it returns a set of "localized" selectors that expect the _entity slice state_ as their argument. If you call `todosAdapter.getSelectors(state => state.todos)`, it returns a set of "globalized" selectors that expect to be called with the _Redux root state_ as their argument.

There may also be other benefits to having "localized" versions of selectors as well. For example, say we have an advanced scenario of keeping multiple copies of `createEntityAdapter` data nested in the store, such as a `chatRoomsAdapter` that tracks rooms, and each room definition then has a `chatMessagesAdapter` state to store the messages. We can't directly look up the messages for each room - we first have to retrieve the room object, then select the messages out of that. This is easier if we have a set of "localized" selectors for the messages.

## Further Information

- Selector libraries:
  - Reselect: https://github.com/reduxjs/reselect
  - `proxy-memoize`: https://github.com/dai-shi/proxy-memoize
  - `re-reselect`: https://github.com/toomuchdesign/re-reselect
  - `reselect-tools`: https://github.com/skortchmark9/reselect-tools
  - `redux-views`: https://github.com/josepot/redux-views
- [Reselect v5 Roadmap Discussion: Goals and API Design](https://github.com/reduxjs/reselect/discussions/491)
- Randy Coulman has an excellent series of blog posts on selector architecture and different approaches for globalizing Redux selectors, with tradeoffs:
  - [Encapsulating the Redux State Tree](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
  - [Redux Reducer/Selector Asymmetry](https://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
  - [Modular Reducers and Selectors](https://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
  - [Globalizing Redux Selectors](https://randycoulman.com/blog/2016/11/29/globalizing-redux-selectors/)
  - [Globalizing Curried Selectors](https://randycoulman.com/blog/2016/12/27/globalizing-curried-selectors/)
  - [Solving Circular Dependencies in Modular Redux](https://randycoulman.com/blog/2018/06/12/solving-circular-dependencies-in-modular-redux/)
