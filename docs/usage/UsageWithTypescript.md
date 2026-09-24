---
id: usage-with-typescript
title: Usage With TypeScript
---

# Usage with TypeScript

:::tip What You'll Learn

- Standard patterns for setting up a Redux app with TypeScript
- Techniques for correctly typing portions of Redux logic

:::

:::important Prerequisites

- Understanding of [TypeScript syntax and terms](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- Familiarity with TypeScript concepts like [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) and [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- Knowledge of [React Hooks](https://react.dev/reference/react/hooks)

:::

## Overview

**TypeScript** is a typed superset of JavaScript that provides compile-time checking of source code. When used with Redux, TypeScript can help provide:

1. Type safety for reducers, state and action creators, and UI components
2. Easy refactoring of typed code
3. A superior developer experience in a team environment

[**We strongly recommend using TypeScript in Redux applications**](../style-guide/style-guide.md#use-static-typing). However, like all tools, TypeScript has tradeoffs. It adds complexity in terms of writing additional code, understanding TS syntax, and building the application. At the same time, it provides value by catching errors earlier in development, enabling safer and more efficient refactoring, and acting as documentation for existing source code.

We believe that **[pragmatic use of TypeScript](https://blog.isquaredsoftware.com/2019/11/blogged-answers-learning-and-using-typescript/#pragmatism-is-vital) provides more than enough value and benefit to justify the added overhead**, especially in larger codebases, but you should take time to **evaluate the tradeoffs and decide whether it's worth using TS in your own application**.

There are multiple possible approaches to type checking Redux code. **This page shows our standard recommended patterns for using Redux and TypeScript together**, and is not an exhaustive guide. Following these patterns should result in a good TS usage experience, with **the best tradeoffs between type safety and amount of type declarations you have to add to your codebase**.

## Standard Redux Toolkit Project Setup with TypeScript

We assume that a typical Redux project is using Redux Toolkit and React Redux together.

[Redux Toolkit](/toolkit) (RTK) is the standard approach for writing modern Redux logic. RTK is already written in TypeScript, and its API is designed to provide a good experience for TypeScript usage.

[React Redux](/react-redux) is also written in TypeScript and ships its own type definitions, so no separate `@types` package is needed. In addition to typing the library functions, the types also export some helpers to make it easier to write typesafe interfaces between your Redux store and your React components.

The [Redux+TS project templates](https://github.com/reduxjs/redux-templates) come with a working example of these patterns already configured.

### Define Root State and Dispatch Types

Using [configureStore](/toolkit/api/configureStore) should not need any additional typings. You will, however, want to extract the `RootState` type and the `Dispatch` type so that they can be referenced as needed. Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings.

Since those are types, it's safe to export them directly from your store setup file such as `app/store.ts` and import them directly into other files.

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
// ...

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    users: usersReducer
  }
})

// highlight-start
// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']
// highlight-end
```

### Define Typed Hooks

While it's possible to import the `RootState` and `AppDispatch` types into each component, it's better to **create pre-typed versions of the `useDispatch` and `useSelector` hooks for usage in your application**. This is important for a couple reasons:

- For `useSelector`, it saves you the need to type `(state: RootState)` every time
- For `useDispatch`, the default `Dispatch` type does not know about thunks or other middleware. In order to correctly dispatch thunks, you need to use the specific customized `AppDispatch` type from the store that includes the thunk middleware types, and use that with `useDispatch`. Adding a pre-typed `useDispatch` hook keeps you from forgetting to import `AppDispatch` where it's needed.

Since these are actual variables, not types, it's important to define them in a separate file such as `app/hooks.ts`, not the store setup file. This allows you to import them into any component file that needs to use the hooks, and avoids potential circular import dependency issues.

Each of the React Redux hooks has a `.withTypes()` method (added in React Redux v9.1.0) that returns a copy of the hook with the given types built in, analogous to the [`.withTypes`](/toolkit/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk) method on Redux Toolkit's `createAsyncThunk`:

```ts title="app/hooks.ts"
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

// highlight-start
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
// highlight-end
```

## Application Usage

### Define Slice State and Action Types

Each slice file should define a type for its initial state value, so that `createSlice` can correctly infer the type of `state` in each case reducer.

All generated actions should be defined using the `PayloadAction<T>` type from Redux Toolkit, which takes the type of the `action.payload` field as its generic argument.

You can safely import the `RootState` type from the store file here. It's a circular import, but the TypeScript compiler can correctly handle that for types. This may be needed for use cases like writing selector functions.

```ts title="features/counter/counterSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

// highlight-start
// Define a type for the slice state
interface CounterState {
  value: number
}

// Define the initial state using that type
const initialState: CounterState = {
  value: 0
}
// highlight-end

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // highlight-start
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // highlight-end
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default counterSlice.reducer
```

The generated action creators will be correctly typed to accept a `payload` argument based on the `PayloadAction<T>` type you provided for the reducer. For example, `incrementByAmount` requires a `number` as its argument.

In some cases, [TypeScript may unnecessarily tighten the type of the initial state](https://github.com/reduxjs/redux-toolkit/pull/827). If that happens, you can work around it by casting the initial state using `as`, instead of declaring the type of the variable:

```ts
// Workaround: cast state instead of declaring variable type
const initialState = {
  value: 0
} as CounterState
```

### Use Typed Hooks in Components

In component files, import the pre-typed hooks instead of the standard hooks from React Redux.

```tsx title="features/counter/Counter.tsx"
import React, { useState } from 'react'

// highlight-next-line
import { useAppSelector, useAppDispatch } from 'app/hooks'

import { decrement, increment } from './counterSlice'

export function Counter() {
  // highlight-start
  // The `state` arg is correctly typed as `RootState` already
  const count = useAppSelector(state => state.counter.value)
  const dispatch = useAppDispatch()
  // highlight-end

  // omit rendering logic
}
```

:::tip Warn about wrong imports

ESLint can help your team import the right hooks easily. The [typescript-eslint/no-restricted-imports](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-restricted-imports.md) rule can show a warning when the wrong import is used accidentally.

You could add this to your ESLint config as an example:

```json
"no-restricted-imports": "off",
"@typescript-eslint/no-restricted-imports": [
  "warn",
  {
    "name": "react-redux",
    "importNames": ["useSelector", "useDispatch"],
    "message": "Use typed hooks `useAppDispatch` and `useAppSelector` instead."
  }
],
```

:::

## Typing Additional Redux Logic

### Type Checking Reducers

[Reducers](../tutorials/fundamentals/part-3-state-actions-reducers.md) are pure functions that receive the current `state` and incoming `action` as arguments, and return a new state.

If you are using Redux Toolkit's `createSlice`, you should rarely need to specifically type a reducer separately. If you do actually write a standalone reducer, it's typically sufficient to declare the type of the `initialState` value, and type the `action` as `UnknownAction`:

```ts
import { UnknownAction } from 'redux'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

export default function counterReducer(
  state = initialState,
  action: UnknownAction
) {
  // logic here
}
```

However, the Redux core does export a `Reducer<State, Action>` type you can use as well.

### Type Checking Middleware

[Middleware](../tutorials/fundamentals/part-4-store.md#middleware) are an extension mechanism for the Redux store. Middleware are composed into a pipeline that wrap the store's `dispatch` method, and have access to the store's `dispatch` and `getState` methods.

The Redux core exports a `Middleware` type that can be used to correctly type a middleware function:

```ts
export interface Middleware<
  DispatchExt = {}, // optional override return behavior of `dispatch`
  S = any, // type of the Redux store state
  D extends Dispatch = Dispatch // type of the dispatch method
>
```

A custom middleware should use the `Middleware` type, and pass the generic args for `S` (state) and `D` (dispatch) if needed:

```ts
import { Middleware } from 'redux'

import { RootState } from '../store'

export const exampleMiddleware: Middleware<
  {}, // Most middleware do not modify the dispatch return value
  RootState
> = storeApi => next => action => {
  const state = storeApi.getState() // correctly typed as RootState
}
```

:::caution

If you are using `typescript-eslint`, the `@typescript-eslint/no-empty-object-type` rule (formerly part of `@typescript-eslint/ban-types`) might report an error if you use `{}` for the dispatch value. The recommended changes it makes are incorrect and will break your Redux store types, you should disable the rule for this line and keep using `{}`.

:::

The dispatch generic should likely only be needed if you are dispatching additional thunks within the middleware.

In cases where `type RootState = ReturnType<typeof store.getState>` is used, a [circular type reference between the middleware and store definitions](https://github.com/reduxjs/redux/issues/4267) can be avoided by switching the type definition of `RootState` to:

```ts
const rootReducer = combineReducers({ ... });
type RootState = ReturnType<typeof rootReducer>;
```

Switching the type definition of `RootState` with Redux Toolkit example:

```ts
// instead of defining the reducers in the reducer field of configureStore, combine them here:
const rootReducer = combineReducers({ counter: counterReducer })

// then set rootReducer as the reducer object of configureStore
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(yourMiddleware)
})

type RootState = ReturnType<typeof rootReducer>
```

### Type Checking Redux Thunks

[Redux Thunk](https://github.com/reduxjs/redux-thunk) is the standard middleware for writing sync and async logic that interacts with the Redux store. A thunk function receives `dispatch` and `getState` as its parameters. Redux Thunk has a built in `ThunkAction` type which we can use to define types for those arguments:

```ts
export type ThunkAction<
  R, // Return type of the thunk function
  S, // state type used by getState
  E, // any "extra argument" injected into the thunk
  A extends Action // known types of actions that can be dispatched
> = (dispatch: ThunkDispatch<S, E, A>, getState: () => S, extraArgument: E) => R
```

You will typically want to provide the `R` (return type) and `S` (state) generic arguments. Unfortunately, TS does not allow only providing _some_ generic arguments, so the usual values for the other arguments are `unknown` for `E` and `UnknownAction` for `A`:

```ts
import { UnknownAction } from 'redux'
import { sendMessage } from './store/chat/actions'
import { RootState } from './store'
import { ThunkAction } from 'redux-thunk'

export const thunkSendMessage =
  (message: string): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async dispatch => {
    const asyncResp = await exampleAPI()
    dispatch(
      sendMessage({
        message,
        user: asyncResp,
        timestamp: new Date().getTime()
      })
    )
  }

function exampleAPI() {
  return Promise.resolve('Async Chat Bot')
}
```

To reduce repetition, you might want to define a reusable `AppThunk` type once, in your store file, and then use that type whenever you write a thunk:

```ts
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>
```

Note that this assumes that there is no meaningful return value from the thunk. If your thunk returns a promise and you want to [use the returned promise after dispatching the thunk](../tutorials/essentials/part-5-async-logic.md#checking-thunk-results-in-components), you'd want to use this as `AppThunk<Promise<SomeReturnType>>`.

:::caution

Don't forget that **the default `useDispatch` hook does not know about thunks**, and so dispatching a thunk will cause a type error. Be sure to [use an updated form of `Dispatch` in your components that recognizes thunks as an acceptable type to dispatch](#define-root-state-and-dispatch-types).

:::

## Usage with React Redux

While [React Redux](/react-redux) is a separate library from Redux itself, it is commonly used with React.

React Redux ships its own type definitions as part of the `react-redux` package, so there is nothing extra to install. The recommended approach is the pre-typed `useAppSelector` and `useAppDispatch` hooks shown in [Define Typed Hooks](#define-typed-hooks) above. This section covers what those hooks are doing, in case you need to type the base hooks by hand.

### Typing the `useSelector` hook

Declare the type of the `state` parameter in the selector function, and the return type of `useSelector` will be inferred to match the return type of the selector:

```ts
interface RootState {
  isOn: boolean
}

// TS infers type: (state: RootState) => boolean
const selectIsOn = (state: RootState) => state.isOn

// TS infers `isOn` is boolean
const isOn = useSelector(selectIsOn)
```

This can also be done inline as well:

```ts
const isOn = useSelector((state: RootState) => state.isOn)
```

However, prefer creating a pre-typed `useAppSelector` hook with the correct type of `state` built-in instead.

### Typing the `useDispatch` hook

By default, the return value of `useDispatch` is the standard `Dispatch` type defined by the Redux core types, so no declarations are needed:

```ts
const dispatch = useDispatch()
```

However, prefer creating a pre-typed `useAppDispatch` hook with the correct type of `Dispatch` built-in instead.

### Typing the `connect` higher order component

If you are still using the deprecated `connect` API, use the `ConnectedProps<T>` type exported by `react-redux` to infer the props that `connect` injects. See [Typing `connect` with TypeScript](/react-redux/using-react-redux/usage-with-typescript) in the React Redux docs for the full pattern.

## Usage with Redux Toolkit

The [Standard Redux Toolkit Project Setup with TypeScript](#standard-redux-toolkit-project-setup-with-typescript) section above covers the normal usage patterns for `configureStore` and `createSlice`. The [Redux Toolkit "Usage with TypeScript" page](/toolkit/usage/usage-with-typescript) is the detailed reference for typing every RTK API. The points below are the ones that come up most often:

- **`configureStore`** infers the state type from the root reducer, so no type declarations are needed. When adding middleware, use the `.concat()` and `.prepend()` methods on the array returned by `getDefaultMiddleware()` rather than array spreads, so the middleware types are preserved. See [Correct typings for the `Dispatch` type](/toolkit/usage/usage-with-typescript#correct-typings-for-the-dispatch-type).
- **Matching actions**: RTK action creators have a `match` method that acts as a type predicate, so `if (increment.match(action))` narrows `action` to the right type. This is useful in middleware and in RxJS `filter` calls. See [Alternative to using a literally-typed `action.type`](/toolkit/usage/usage-with-typescript#alternative-to-using-a-literally-typed-actiontype).
- **`createSlice`**: declare `action: PayloadAction<T>` on each case reducer; use the `CaseReducer<State, Action>` type to define case reducers outside the slice; always use the builder callback form of `extraReducers` so action types can be inferred; use the `{ reducer, prepare }` form when an action needs `meta` or a customized `payload`. See the [`createSlice` section](/toolkit/usage/usage-with-typescript#createslice).
- **`createAsyncThunk`**: for basic usage, type the payload creator's argument and return value and let the rest infer. To type the `thunkApi` fields (`state`, `dispatch`, `extra`), pass the return type, argument type, and a config object as the three generic arguments, or define a [pre-typed `createAsyncThunk`](/toolkit/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk) once per app. See the [`createAsyncThunk` section](/toolkit/usage/usage-with-typescript#createasyncthunk).
- **`createEntityAdapter`**: pass the entity type as the single generic argument when entities have an `id` field; when they use a different key, pass a typed `selectId` function instead so the ID type is inferred. See the [`createEntityAdapter` section](/toolkit/usage/usage-with-typescript#createentityadapter).

### Fixing Circular Types in Exported Slices

On rare occasions you might need to export the slice reducer with a specific type in order to break a circular type dependency problem. This might look like:

```ts
export default counterSlice.reducer as Reducer<Counter>
```

## Additional Recommendations

### Use the React Redux Hooks API

**We recommend using the React Redux hooks API as the default approach**. The hooks API is much simpler to use with TypeScript, as `useSelector` is a simple hook that takes a selector function, and the return type is easily inferred from the type of the `state` argument.

While `connect` still works fine, and _can_ be typed, it's much more difficult to type correctly.

### Avoid Action Type Unions

**We specifically recommend _against_ trying to create unions of action types**, as it provides no real benefit and actually misleads the compiler in some ways. See RTK maintainer Lenz Weber's post [Do Not Create Union Types with Redux Action Types](https://phryneas.de/redux-typescript-no-discriminating-union) for an explanation of why this is a problem.

In addition, if you're using `createSlice`, you already know that all actions defined by that slice are being handled correctly.

## Resources

For further information, see these additional resources:

- Redux library documentation:
  - [Redux Toolkit docs: Usage with TypeScript](/toolkit/usage/usage-with-typescript): Detailed typing patterns for each Redux Toolkit API
  - [RTK Query docs: Usage with TypeScript](/toolkit/rtk-query/usage-with-typescript): Typing `createApi`, endpoints, and hooks
  - [React Redux docs: Typing `connect`](/react-redux/using-react-redux/usage-with-typescript): Typing the deprecated `connect` API
- React + TypeScript guides:
  - [React+TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react): a comprehensive guide to using React with TypeScript
- Other articles:
  - [Do Not Create Union Types with Redux Action Types](https://phryneas.de/redux-typescript-no-discriminating-union)
