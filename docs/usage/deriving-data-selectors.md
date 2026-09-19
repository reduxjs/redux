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

A selector function can be used anywhere you have access to the entire Redux root state value. This includes the `useSelector` hook, middleware, thunks, listeners, and sagas. For example, thunks and middleware have access to the `getState` argument, so you can call a selector there:

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

### Reading State Once

React components should normally use `useSelector`, because it subscribes to the store and updates the component when the selected value changes. Sometimes code outside React only has access to `dispatch` and needs a one-time read of the latest state without subscribing. In that case, you can dispatch a small thunk that calls the selector with `getState()` and returns its result:

```ts
const selectFromState = <Selected>(
  selector: (state: RootState) => Selected
): AppThunk<Selected> => {
  return (_dispatch, getState) => selector(getState())
}

const users = dispatch(selectFromState(selectUsers))
```

This reads the state at the moment the thunk runs. The returned value does not stay updated, so use a subscription API such as `useSelector` when the caller needs to react to later state changes.

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

- Selectors used with `useSelector` will be re-run after every dispatched action, regardless of what section of the Redux root state was actually updated. Re-running expensive calculations when the input state sections didn't change is a waste of CPU time, and it's very likely that the inputs won't have changed most of the time anyway.
- `useSelector` relies on `===` reference equality checks of the return values to determine if the component needs to re-render. If a selector _always_ returns new references, it will force the component to re-render even if the derived data is effectively the same as last time. This is especially common with array operations like `map()` and `filter()`, which return new array references.

As an example, this component is written badly, because its `useSelector` call _always_ returns a new array reference. That means the component will re-render after _every_ dispatched action, even if the input `state.todos` slice hasn't changed:

```js
function TodoList() {
  // highlight-start
  // ❌ WARNING: this _always_ returns a new reference, so it will _always_ re-render!
  const completedTodos = useSelector(state =>
    state.todos.filter(todo => todo.completed)
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

The Redux ecosystem has traditionally used a library called [**Reselect**](https://reselect.js.org) to create memoized selector functions. There also are other similar libraries, as well as multiple variations and wrappers around Reselect - we'll look at those later.

### `createSelector` Overview

Reselect provides a function called [`createSelector`](https://reselect.js.org/api/createselector/) to generate memoized selectors. `createSelector` accepts one or more "input selector" functions, plus an "output selector" function, and returns a new selector function for you to use.

`createSelector` is included as part of [our official Redux Toolkit package](/toolkit), and is re-exported for ease of use.

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

In typical Reselect usage, you write your top-level "input selectors" as simple functions that just return values nested somewhere inside the state object. Then, you use `createSelector` to create memoized selectors that take one or more of these values as input and produce new derived values:

```js
const selectTodos = state => state.todos.items
const selectCurrentUser = state => state.users.currentUser

const selectTodosForCurrentUser = createSelector(
  [selectTodos, selectCurrentUser],
  (todos, currentUser) => {
    console.log('Output selector running')
    return todos.filter(todo => todo.ownerId === currentUser.userId)
  }
)

const todosForCurrentUser1 = selectTodosForCurrentUser(state)
// Log: "Output selector running"

const todosForCurrentUser2 = selectTodosForCurrentUser(state)
// No log output

console.log(todosForCurrentUser1 === todosForCurrentUser2)
// true
```

Note that the second time we called `selectTodosForCurrentUser`, the "output selector" didn't execute. Because the results of `selectTodos` and `selectCurrentUser` were the same as the first call, `selectTodosForCurrentUser` was able to return the memoized result from the first call.

### `createSelector` Behavior

Reselect 5 memoizes with [`weakMapMemoize`](https://reselect.js.org/api/weakmapmemoize/) by default. It keeps a separate cache entry for each distinct set of arguments, keyed by reference, so calling a selector with several different inputs in a row does not evict earlier results:

```ts
const a = someSelector(state, 1) // first call: runs the output selector
const b = someSelector(state, 1) // same inputs: cached
const c = someSelector(state, 2) // new inputs: runs the output selector
const d = someSelector(state, 1) // still cached from the first call
```

Cache entries are held in `WeakMap`s keyed by the argument objects, so they are released when those objects are garbage collected. There is no size limit to configure.

Reselect 4 and earlier used `lruMemoize` with a cache size of 1, which only remembered the most recent set of arguments. In that version, `c` would have evicted the result for `(state, 1)`, and `d` would have recalculated. `lruMemoize` is still available if you want a bounded cache, and the ["Selector Factories"](#selector-factories) section below explains when it still matters.

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

You can then use the selector like this:

```js
const electronicItems = selectItemsByCategory(state, 'electronics')
```

For consistency, you may want to consider passing additional parameters to a selector as a single object, such as `selectThings(state, otherArgs)`, and then extracting values from the `otherArgs` object.

#### Selector Factories

With Reselect 4's `lruMemoize` and its default cache size of 1, a single selector instance could only remember one set of arguments. If several components called `selectItemsByCategory(state, category)` with different categories, each call evicted the previous result and the output selector re-ran every time. The workaround was a "selector factory" - a function that calls `createSelector()` and returns a fresh selector instance for each component:

```ts
const makeSelectItemsByCategory = () =>
  createSelector(
    [(state: RootState) => state.items, (state, category: string) => category],
    (items, category) => items.filter(item => item.category === category)
  )
```

With Reselect 5's default `weakMapMemoize`, one shared selector already keeps a cache entry per distinct argument set, so **you usually do not need a factory**. A factory is still useful if you have opted back into `lruMemoize` for a bounded cache, or if you want a component's cached results released as soon as it unmounts rather than when the argument objects are garbage collected. See ["Creating Unique Selector Instances"](#creating-unique-selector-instances) for how to use one with `useSelector`.

### Reselect 5

Reselect 5 (released December 2023) is written in TypeScript and changes a few defaults that are worth knowing about:

- **`weakMapMemoize` is the default memoizer.** As described above, it caches per distinct argument set with no size limit. To get the previous behavior, pass `memoize: lruMemoize` (and optionally `memoizeOptions: { maxSize: 10 }`) to `createSelector` or build a custom `createSelector` with [`createSelectorCreator`](https://reselect.js.org/api/createselectorcreator/).
- **`createSelector.withTypes<RootState>()`** returns a `createSelector` whose input selectors are pre-typed to receive your root state, so you do not have to annotate `state` in every input selector.
- **Development-mode checks** warn about the two common mistakes shown earlier on this page: an input selector that returns a new reference on every call, and an output selector that just returns its input. They run on the first call to each selector in development and are disabled in production. See [Development-only checks](https://reselect.js.org/api/development-only-checks/).

```ts title="src/app/selectors.ts"
import { createSelector, lruMemoize } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const createAppSelector = createSelector.withTypes<RootState>()

// Input selectors receive `RootState` without annotations
export const selectCompletedTodos = createAppSelector(
  [state => state.todos],
  todos => todos.filter(todo => todo.completed)
)

// Opt back into a bounded LRU cache for one selector
export const selectItemsByCategory = createAppSelector(
  [state => state.items, (state, category: string) => category],
  (items, category) => items.filter(item => item.category === category),
  { memoize: lruMemoize, memoizeOptions: { maxSize: 10 } }
)
```

Redux Toolkit re-exports `createSelector`, `createSelectorCreator`, `lruMemoize`, and `weakMapMemoize` from Reselect, so you do not need to install Reselect separately. The [Reselect docs](https://reselect.js.org) cover the full API.

## Alternative Selector Libraries

While Reselect is the most widely used selector library with Redux, there are many other libraries that solve similar problems, or expand on Reselect's capabilities.

### `proxy-memoize`

[`proxy-memoize`](https://github.com/dai-shi/proxy-memoize) uses a different implementation approach. It relies on `Proxy` objects to track which nested values a selector actually reads, then compares only those values on later calls to see if they've changed. This can provide better results than Reselect in some cases.

A good example of this is a selector that derives an array of todo descriptions:

```ts
import { createSelector } from '@reduxjs/toolkit'

const selectTodoDescriptionsReselect = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.map(todo => todo.text)
)
```

Unfortunately, this will recalculate the derived array if any other value inside of `state.todos` changes, such as toggling a `todo.completed` flag. The _contents_ of the derived array are identical, but because the input `todos` array changed, it has to calculate a new output array, and that has a new reference.

The same selector with `proxy-memoize` might look like:

```ts
import { memoize } from 'proxy-memoize'

const selectTodoDescriptionsProxy = memoize((state: RootState) =>
  state.todos.map(todo => todo.text)
)
```

Unlike Reselect, `proxy-memoize` can detect that only the `todo.text` fields are being accessed, and will only recalculate if one of the `todo.text` fields changed.

It has some tradeoffs and differences from Reselect:

- All values are passed in as a single object argument
- It's more magical, whereas Reselect is more explicit
- There are some edge cases regarding the `Proxy`-based tracking behavior
- It's less widely used

`proxy-memoize` is a reasonable alternative to Reselect if you have selectors that read only a small part of a large input and want to avoid recalculating when unrelated fields change.

### `re-reselect`

[`re-reselect`](https://github.com/toomuchdesign/re-reselect) wraps Reselect and adds a "key selector" that picks a cache key from the selector arguments, managing a separate Reselect selector instance per key. With Reselect 5's `weakMapMemoize` already caching per argument set, this is mostly useful when you want an explicit key (such as a string ID) rather than reference identity to decide which cache entry to use.

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

A memoized selector is often shared across many components that each call it with different arguments. With Reselect 5's default `weakMapMemoize`, that works as-is: the shared selector keeps a cache entry per distinct argument set, so the components do not evict each other's results.

If you have opted into `lruMemoize` with a small cache, or want a component's cached results released as soon as it unmounts, create a unique selector instance per component with a [selector factory](#selector-factories) and `useMemo`:

```tsx
import { useMemo } from 'react'
import { makeSelectItemsByCategory } from './categoriesSlice'
import { useAppSelector } from '../../app/hooks'

function CategoryList({ category }: { category: string }) {
  // Create a new memoized selector, for each component instance, on mount
  const selectItemsByCategory = useMemo(makeSelectItemsByCategory, [])

  const itemsByCategory = useAppSelector(state =>
    selectItemsByCategory(state, category)
  )
}
```

If you still use the legacy `connect` API, the equivalent is the ["factory function" form of `mapStateToProps`](/react-redux/api/connect#factory-functions), where `mapState` returns a new `mapState` function on its first call.

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

Similarly, **don't make every single selector memoized!**. Memoization is only needed if the selector returns a new reference every time it runs, or if the calculation logic it executes is expensive. **A selector function that does a direct lookup and return of a value should be a plain function, not memoized**.

Some examples of when and when not to memoize:

```js
// ❌ DO NOT memoize: will always return a consistent reference
const selectTodos = state => state.todos
const selectNestedValue = state => state.some.deeply.nested.field
const selectTodoById = (state, todoId) => state.todos[todoId]

// 🤔 MAYBE memoize: deriving data, but will return a consistent result.
//    Memoization might be useful if the selector is used in many places
//    or the list being iterated over is long.
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

Redux Toolkit's [`createEntityAdapter` API](/toolkit/api/createEntityAdapter#selector-functions) is an example of this pattern. If you call `todosAdapter.getSelectors()`, with no argument, it returns a set of "localized" selectors that expect the _entity slice state_ as their argument. If you call `todosAdapter.getSelectors(state => state.todos)`, it returns a set of "globalized" selectors that expect to be called with the _Redux root state_ as their argument.

There may also be other benefits to having "localized" versions of selectors as well. For example, say we have an advanced scenario of keeping multiple copies of `createEntityAdapter` data nested in the store, such as a `chatRoomsAdapter` that tracks rooms, and each room definition then has a `chatMessagesAdapter` state to store the messages. We can't directly look up the messages for each room - we first have to retrieve the room object, then select the messages out of that. This is easier if we have a set of "localized" selectors for the messages.

## Further Information

- Selector libraries:
  - Reselect: https://reselect.js.org
  - `proxy-memoize`: https://github.com/dai-shi/proxy-memoize
  - `re-reselect`: https://github.com/toomuchdesign/re-reselect
- Randy Coulman has an excellent series of blog posts on selector architecture and different approaches for globalizing Redux selectors, with tradeoffs:
  - [Encapsulating the Redux State Tree](https://randycoulman.com/blog/2016/09/13/encapsulating-the-redux-state-tree/)
  - [Redux Reducer/Selector Asymmetry](https://randycoulman.com/blog/2016/09/20/redux-reducer-selector-asymmetry/)
  - [Modular Reducers and Selectors](https://randycoulman.com/blog/2016/09/27/modular-reducers-and-selectors/)
  - [Globalizing Redux Selectors](https://randycoulman.com/blog/2016/11/29/globalizing-redux-selectors/)
  - [Globalizing Curried Selectors](https://randycoulman.com/blog/2016/12/27/globalizing-curried-selectors/)
  - [Solving Circular Dependencies in Modular Redux](https://randycoulman.com/blog/2018/06/12/solving-circular-dependencies-in-modular-redux/)
