---
id: react-redux
title: React Redux
sidebar_label: React Redux
---

## Redux FAQ: React Redux

### Why should I use React-Redux?

Redux itself is a standalone library that can be used with any UI layer or framework, including React, Angular, Vue, Ember, and vanilla JS. Although Redux and React are commonly used together, they are independent of each other.

If you are using Redux with any kind of UI framework, you will normally use a "UI binding" library to tie Redux together with your UI framework, rather than directly interacting with the store from your UI code.

**React-Redux is the official Redux UI binding library for React**. If you are using Redux and React together, you should also use React-Redux to bind these two libraries.

While it is possible to write Redux store subscription logic by hand, doing so would become very repetitive. In addition, optimizing UI performance would require complicated logic.

The process of subscribing to the store, checking for updated data, and triggering a re-render can be made more generic and reusable. **A UI binding library like React-Redux handles the store interaction logic, so you don't have to write that code yourself.**

Overall, React-Redux encourages good React architecture, and implements complex performance optimizations for you. It is also kept up-to-date with the latest API changes from Redux and React.

#### Further Information

**Documentation**

- **[React-Redux docs: Why Use React-Redux?](/react-redux/introduction/why-use-react-redux)**
- [React-Redux docs: Hooks](/react-redux/api/hooks)

### Why isn't my component re-rendering?

`useSelector` runs your selector after every dispatched action and compares the new result to the previous one with `===`. If the two results are the same reference, the component does not re-render. So when a component fails to update, the usual cause is that the selected value did not actually change reference.

**The most common reason is a reducer that mutated state instead of returning a new value.** If a reducer does `state.todos.push(newTodo)` and then returns `state`, the `todos` array is the same reference it was before, and every `useSelector(state => state.todos)` in the app sees "no change". Redux itself will not catch this, but Redux Toolkit's `configureStore` adds an immutability check middleware in development that throws an error when a reducer mutates its argument.

If you are writing reducers with `createSlice`, this problem mostly disappears: case reducers run inside Immer, so `state.todos.push(newTodo)` is turned into a correct immutable update. The mutation problem shows up when writing reducers by hand, or when mutating data _outside_ a reducer (for example, sorting an array that was read from the store in a component).

Other things to check:

- **The selector reads the wrong field.** With TypeScript and [typed hooks](#how-do-i-type-useselector-and-usedispatch), this becomes a compile error rather than a silent `undefined`.
- **The component is rendered outside the `<Provider>`**, or under a `<Provider>` for a different store instance. Portals and test renderers are the usual places this happens.
- **The action was never dispatched**, or was dispatched to a different store. Check the Redux DevTools action list.
- **Immutability was broken further up the tree.** Updating `state.a.b.c` immutably means `c`, `b`, `a`, and the root all need to be new references. Immer handles this for you; hand-written spreads have to do it at every level.

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface Todo {
  id: string
  text: string
  completed: boolean
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    todoAdded(state, action: PayloadAction<Todo>) {
      // Fine inside createSlice: Immer turns this into an immutable update,
      // so the todos array gets a new reference and subscribers re-render.
      state.push(action.payload)
    }
  }
})
```

#### Further information

**Documentation**

- [Troubleshooting](../usage/Troubleshooting.md)
- [Redux Toolkit: Immutability Middleware](/toolkit/api/immutabilityMiddleware)
- [Using Redux: Structuring Reducers - Prerequisite Concepts](../usage/structuring-reducers/PrerequisiteConcepts.md)
- [Using Redux: Structuring Reducers - Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [FAQ: Immutable Data](./ImmutableData.md)

### Why is my component re-rendering too often?

There are two separate reasons a component using `useSelector` can render more than you expect. They have different fixes.

**The selector returns a new reference every time it runs.** Because `useSelector` compares results with `===`, a selector that builds a new object or array on each call will always look "changed", and the component will re-render after _every_ dispatched action, no matter which slice of state was updated. (`useAppSelector` in these examples is the pre-typed hook from [How do I type `useSelector` and `useDispatch`?](#how-do-i-type-useselector-and-usedispatch).)

```ts
// Re-renders on every action: `.map()` always returns a new array
const todoObjects = useAppSelector(state =>
  state.todos.ids.map(id => state.todos.entities[id])
)

// Re-renders on every action: the object literal is new each call
const { count, user } = useAppSelector(state => ({
  count: state.counter.value,
  user: state.auth.user
}))
```

React-Redux checks for this in development. The first time a `useSelector` call runs, it runs the selector twice with the same state and logs a warning ("Selector ... returned a different result when called with the same parameters") if the two results are not equal. If you see that warning, the fix is one of:

- Select the raw values from the store and derive data in the component (with `useMemo` if it is expensive).
- Memoize the selector with `createSelector`, so it only returns a new reference when its inputs change.
- Pass `shallowEqual` as the equality function, if the selector returns a flat object of primitives.

See [How do I select multiple values from the store?](#how-do-i-select-multiple-values-from-the-store) for examples of each.

**The parent re-rendered.** `useSelector` only controls re-renders caused by store updates. If a parent component renders, React renders its children too, whether or not their props or selected state changed. This is normal React behavior and has nothing to do with Redux. If a component is expensive and its parent renders often, wrap it in `React.memo`, and make sure the props being passed in are referentially stable (callbacks wrapped in `useCallback`, objects in `useMemo`).

Two other things worth knowing:

- Selecting the entire root state (`useSelector(state => state)`) makes the component re-render on every action. React-Redux warns about this in development as well. Select the smallest piece of state the component needs.
- Multiple `useSelector` calls in one component that all change from one dispatch still result in a single render, because React batches the updates.

#### Further information

**Documentation**

- [React Redux: Hooks - Development mode checks](/react-redux/api/hooks#development-mode-checks)
- [React: `memo`](https://react.dev/reference/react/memo)
- [FAQ: Performance - How well does Redux "scale"?](./Performance.md#how-well-does-redux-scale-in-terms-of-performance-and-architecture)
- [Using Redux: Deriving Data with Selectors](../usage/deriving-data-selectors.md)

**Articles**

- [A (Mostly) Complete Guide to React Rendering Behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)
- [Improving React and Redux Performance with Reselect](https://rangle.io/blog/react-and-redux-performance-with-reselect/)

### How do I select multiple values from the store?

Call `useSelector` more than once. Each call is its own subscription, each returns a single value, and `===` comparison works correctly on primitives and on object references that already live in the store:

```ts
const count = useAppSelector(state => state.counter.value)
const user = useAppSelector(state => state.auth.user)
```

This is the default recommendation. It reads clearly, and there is no meaningful performance cost to several `useSelector` calls in one component.

If you need to derive a combined value, or you want a single selector for reuse, memoize it with `createSelector` (exported from Redux Toolkit, or from Reselect directly). The output function only re-runs when one of the input selectors returns a new value, so the result reference is stable in between:

```ts
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const selectCompletedTodos = createSelector(
  [(state: RootState) => state.todos],
  todos => todos.filter(todo => todo.completed)
)

// In a component:
const completedTodos = useAppSelector(selectCompletedTodos)
```

Declare memoized selectors outside the component, so every render uses the same selector instance. A `createSelector` call inside the component body creates a fresh cache on every render and memoizes nothing.

If the selector returns a flat object whose fields are primitives or stable references, `shallowEqual` from React-Redux can be passed as the equality function. `useSelector` then compares each field of the two results instead of the object identity:

```ts
import { shallowEqual } from 'react-redux'

const { count, status } = useAppSelector(
  state => ({ count: state.counter.value, status: state.counter.status }),
  shallowEqual
)
```

Both `createSelector` and `shallowEqual` are workarounds for one specific problem: a selector that has to return a new object. If you can select the individual values instead, do that.

#### Further information

**Documentation**

- [Using Redux: Deriving Data with Selectors](../usage/deriving-data-selectors.md)
- [Reselect docs](/reselect/introduction/getting-started)
- [React Redux: Hooks - Equality Comparisons and Updates](/react-redux/api/hooks#equality-comparisons-and-updates)

### How do I use Redux with React 18 and React 19?

React-Redux v8 and later support React 18, and v9 supports React 18 and 19. `useSelector` is implemented with React's `useSyncExternalStore` hook, which is the API React provides for subscribing to data that lives outside React. That means:

- **Store updates are always rendered synchronously.** When an action is dispatched, React re-renders subscribed components in a synchronous pass, outside of any pending transition. Redux state updates cannot be marked as low priority with `startTransition`, and a component that suspends while reading Redux state will fall back to its nearest `Suspense` boundary rather than keeping the old UI visible. This is a deliberate choice by React for external stores: it prevents "tearing", where different parts of one render see different store snapshots.
- **Concurrent rendering is safe.** Because React reads the store through `useSyncExternalStore`, a render that was interrupted and resumed will re-read the current state instead of using a stale value.
- **Automatic batching applies.** Several dispatches in the same tick (in an event handler, a `setTimeout`, a promise callback, or a thunk) result in one React render, without any extra work on your part. React-Redux's old `batch()` helper is a no-op in v9 and will be removed in v10.

React Server Components and frameworks built on them, such as the Next.js App Router, run part of your tree on the server, where there is no Redux store. Redux is a client-side library: the `<Provider>` and every component that calls `useSelector` or `useDispatch` must be client components, and the store must be created once per request on the server, never as a module-level singleton. The [Redux Toolkit Setup with Next.js](../usage/nextjs.mdx) page shows a `StoreProvider` component that does this correctly.

#### Further information

**Documentation**

- [React: `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore)
- [Using Redux: Redux Toolkit Setup with Next.js](../usage/nextjs.mdx)
- [Using Redux: Server Rendering](../usage/ServerRendering.md)

### How do I access the store outside a component?

Prefer not to. Most code that wants the store from outside a component is doing async logic or responding to an action, and both belong in a [thunk](../usage/writing-logic-thunks.mdx) or a [listener middleware](/toolkit/api/createListenerMiddleware) effect, where `dispatch` and `getState` are passed in as arguments.

When you do need the store instance itself:

- **Inside a component**, `useStore()` returns the store from the nearest `<Provider>`. This is for rare cases like reading state once in an event handler without subscribing to it, or calling `store.replaceReducer`. It does not cause re-renders when state changes, so do not use it as a replacement for `useSelector`.
- **In a plain module**, such as an API client that needs to read an auth token or a `setupListeners` call, import the store directly from the module that created it. If that creates a circular import (the store module imports the API module, which imports the store module), use an `injectStore` function: the API module exports a setter, and the store module calls it after creating the store. The [Code Structure FAQ](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files) shows this pattern.

Importing a store singleton does not work with server rendering, where each request has its own store. In that case, pass the store or `dispatch` explicitly.

#### Further information

**Documentation**

- [FAQ: Code Structure - How can I use the Redux store in non-component files?](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)
- [React Redux: Hooks - `useStore()`](/react-redux/api/hooks#usestore)
- [Using Redux: Writing Logic with Thunks](../usage/writing-logic-thunks.mdx)

### How do I type `useSelector` and `useDispatch`?

Infer `RootState` and `AppDispatch` from the store, then create pre-typed versions of the hooks with `.withTypes()`, and use those everywhere instead of the plain imports from `react-redux`:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import todosReducer from '../features/todos/todosSlice'

export const store = configureStore({
  reducer: { todos: todosReducer }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

`useAppSelector` knows the shape of `state`, so `state => state.todso` is a compile error. `useAppDispatch` knows about the thunk middleware that `configureStore` adds, so `dispatch(fetchTodos())` type-checks; with the untyped `useDispatch`, dispatching a thunk fails with an error about the argument not being assignable to `UnknownAction`.

#### Further information

**Documentation**

- [Using Redux: Usage with TypeScript](../usage/UsageWithTypescript.md#define-typed-hooks)
- [React Redux: `useSelector` and `useDispatch` API reference](/react-redux/api/hooks)

### Is `connect` still supported?

Yes. `connect`, `mapStateToProps`, and `mapDispatchToProps` still work in React-Redux v9 and are not deprecated. **New code should use the hooks.** They are shorter, they work with TypeScript without the `ConnectedProps` ceremony, and they are the API the React-Redux docs, the Redux tutorials, and Redux Toolkit assume.

<details>
<summary>Notes for existing connect-based code</summary>

- `connect` compares the object returned by `mapStateToProps` with shallow equality, field by field, and only re-renders the wrapped component when a field changed. This is why the "new object from the selector" problem described above did not exist with `connect`, and why code converted from `mapStateToProps` to a single `useSelector` returning an object starts re-rendering on every action. Split it into one `useSelector` per field.
- `connect` also skips re-rendering when the parent re-renders with the same props. `useSelector` does not; use `React.memo` if that matters.
- If you provide a `mapDispatchToProps` function, `dispatch` is no longer passed as a prop automatically. Return it from your `mapDispatchToProps` if you still need it, or use the object shorthand form, which binds action creators and does not need `dispatch` at all.
- Connected components anywhere in the tree are fine and were always fine. "Only connect the top component" was early advice that Dan Abramov withdrew; more, smaller subscribed components generally perform better than a few large ones. The same is true for `useSelector`.
- `connect` and the hooks can be mixed in one app. Migrate a component at a time.

The [React-Redux `connect` API docs](/react-redux/api/connect) and the [Connect tutorial](/react-redux/tutorials/connect) cover the full API.

</details>

### How does Redux compare to the React Context API?

**Similarities**

Both Redux and React's Context API deal with "prop drilling". That said, they both allow you to pass data without having to pass the props through multiple layers of components. Internally, Redux _uses_ the React context API that allows it to pass the store along your component tree.

**Differences**

With Redux, you get the power of [Redux Dev Tools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension). It automatically logs every action your app performs, and it allows time traveling – you can click on any past action and jump to that point in time. Redux also supports the concept of middleware, where you may bind customized function calls on every action dispatch. Such examples include an automatic event logger, interception of certain actions, etc.

With React's Context API, you deal with a pair of components speaking only to each other. This gives you nice isolation between irrelevant data. You also have the flexibility of how you may use the data with your components, i.e., you can provide the state of a parent component, and you may pass context data as props to wrapped components.

There is a key difference in how Redux and React's Context treat data. Redux maintains the data of your whole app in a giant, stateful object. It deduces the changes of your data by running the reducer function you provide, and returns the next state that corresponds to every action dispatched. React Redux then optimizes component rendering and makes sure that each component re-renders only when the data it needs change. Context, on the other hand, does not hold any state. It is only a conduit for the data. To express changes in data you need to rely on the state of a parent component.

#### Further information

- [Why React Context is Not a "State Management" Tool (and Why It Doesn't Replace Redux)](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
- [When (and when not) to reach for Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)
- [Redux vs. The React Context API](https://daveceddia.com/context-api-vs-redux/)
- [You Might Not Need Redux (But You Can’t Replace It With Hooks)](https://www.simplethread.com/cant-replace-redux-with-hooks/)
