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
- Knowledge of [React Hooks](https://reactjs.org/docs/hooks-intro.html)

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

[Redux Toolkit](https://redux-toolkit.js.org) (RTK) is the standard approach for writing modern Redux logic. RTK is already written in TypeScript, and its API is designed to provide a good experience for TypeScript usage.

[React Redux](https://react-redux.js.org) has its type definitions in a separate [`@types/react-redux` typedefs package](https://npm.im/@types/react-redux) on NPM. In addition to typing the library functions, the types also export some helpers to make it easier to write typesafe interfaces between your Redux store and your React components.

As of React Redux v7.2.3, the `react-redux` package has a dependency on `@types/react-redux`, so the type definitions will be automatically installed with the library. Otherwise, you'll need to manually install them yourself (typically `npm install @types/react-redux` ).

The [Redux+TS template for Create-React-App](https://github.com/reduxjs/cra-template-redux-typescript) comes with a working example of these patterns already configured.

### Define Root State and Dispatch Types

Using [configureStore](https://redux-toolkit.js.org/api/configureStore) should not need any additional typings. You will, however, want to extract the `RootState` type and the `Dispatch` type so that they can be referenced as needed. Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings.

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
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
// highlight-end
```

### Define Typed Hooks

While it's possible to import the `RootState` and `AppDispatch` types into each component, it's better to **create pre-typed versions of the `useDispatch` and `useSelector` hooks for usage in your application**. This is important for a couple reasons:

- For `useSelector`, it saves you the need to type `(state: RootState)` every time
- For `useDispatch`, the default `Dispatch` type does not know about thunks or other middleware. In order to correctly dispatch thunks, you need to use the specific customized `AppDispatch` type from the store that includes the thunk middleware types, and use that with `useDispatch`. Adding a pre-typed `useDispatch` hook keeps you from forgetting to import `AppDispatch` where it's needed.

Since these are actual variables, not types, it's important to define them in a separate file such as `app/hooks.ts`, not the store setup file. This allows you to import them into any component file that needs to use the hooks, and avoids potential circular import dependency issues.

```ts title="app/hooks.ts"
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// highlight-start
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
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

## Typing Additional Redux Logic

### Type Checking Reducers

[Reducers](../tutorials/fundamentals/part-3-state-actions-reducers.md) are pure functions that receive the current `state` and incoming `action` as arguments, and return a new state.

If you are using Redux Toolkit's `createSlice`, you should rarely need to specifically type a reducer separately. If you do actually write a standalone reducer, it's typically sufficient to declare the type of the `initialState` value, and type the `action` as `AnyAction`:

```ts
import { AnyAction } from 'redux'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

export default function counterReducer(
  state = initialState,
  action: AnyAction
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

The dispatch generic should likely only be needed if you are dispatching additional thunks within the middleware.

In cases where `type RootState = ReturnType<typeof store.getState>` is used, a [circular type reference between the middleware and store definitions](https://github.com/reduxjs/redux/issues/4267) can be avoided by switching the type definition of `RootState` to:

```ts
const rootReducer = combineReducers({ ... });
type RootState = ReturnType<typeof rootReducer>;
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

You will typically want to provide the `R` (return type) and `S` (state) generic arguments. Unfortunately, TS does not allow only providing _some_ generic arguments, so the usual values for the other arguments are `unknown` for `E` and `AnyAction` for `A`:

```ts
import { AnyAction } from 'redux'
import { sendMessage } from './store/chat/actions'
import { RootState } from './store'
import { ThunkAction } from 'redux-thunk'

export const thunkSendMessage =
  (message: string): ThunkAction<void, RootState, unknown, AnyAction> =>
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
  AnyAction
>
```

Note that this assumes that there is no meaningful return value from the thunk. If your thunk returns a promise and you want to [use the returned promise after dispatching the thunk](../tutorials/essentials/part-5-async-logic.md#checking-thunk-results-in-components), you'd want to use this as `AppThunk<Promise<SomeReturnType>>`.

:::caution

Don't forget that **the default `useDispatch` hook does not know about thunks**, and so dispatching a thunk will cause a type error. Be sure to [use an updated form of `Dispatch` in your components that recognizes thunks as an acceptable type to dispatch](#define-root-state-and-dispatch-types).

:::

## Usage with React Redux

While [React Redux](https://react-redux.js.org) is a separate library from Redux itself, it is commonly used with React.

For a complete guide on how to correctly use React Redux with TypeScript, see **[the "Static Typing" page in the React Redux docs](https://react-redux.js.org/using-react-redux/static-typing)**. This section will highlight the standard patterns.

If you are using TypeScript, the React Redux types are maintained separately in DefinitelyTyped, but included as a dependency of the react-redux package, so they should be installed automatically. If you still need to install them manually, run:

```sh
npm install @types/react-redux
```

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

However, prefer creating a pre-typed `useSelector` hook with the correct type of `state` built-in instead.

### Typing the `useDispatch` hook

By default, the return value of `useDispatch` is the standard `Dispatch` type defined by the Redux core types, so no declarations are needed:

```ts
const dispatch = useDispatch()
```

However, prefer creating a pre-typed `useAppDispatch` hook with the correct type of `Dispatch` built-in instead.

### Typing the `connect` higher order component

If you are still using `connect`, you should use the `ConnectedProps<T>` type exported by `@types/react-redux^7.1.2` to infer the types of the props from `connect` automatically. This requires splitting the `connect(mapState, mapDispatch)(MyComponent)` call into two parts:

```tsx
import { connect, ConnectedProps } from 'react-redux'

interface RootState {
  isOn: boolean
}

const mapState = (state: RootState) => ({
  isOn: state.isOn
})

const mapDispatch = {
  toggleOn: () => ({ type: 'TOGGLE_IS_ON' })
}

const connector = connect(mapState, mapDispatch)

// The inferred type will look like:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  backgroundColor: string
}

const MyComponent = (props: Props) => (
  <div style={{ backgroundColor: props.backgroundColor }}>
    <button onClick={props.toggleOn}>
      Toggle is {props.isOn ? 'ON' : 'OFF'}
    </button>
  </div>
)

export default connector(MyComponent)
```

## Usage with Redux Toolkit

The [Standard Redux Toolkit Project Setup with TypeScript](#standard-redux-toolkit-project-setup-with-typescript) section already covered the normal usage patterns for `configureStore` and `createSlice`, and the [Redux Toolkit "Usage with TypeScript" page](https://redux-toolkit.js.org/usage/usage-with-typescript) covers all of the RTK APIs in detail.

Here are some additional typing patterns you will commonly see when using RTK.

### Typing `configureStore`

`configureStore` infers the type of the state value from the provided root reducer function, so no specific type declarations should be needed.

If you want to add additional middleware to the store, be sure to use the specialized `.concat()` and `.prepend()` methods included in the array returned by `getDefaultMiddleware()`, as those will correctly preserve the types of the middleware you're adding. (Using plain JS array spreads often loses those types.)

```ts
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .prepend(
        // correctly typed middlewares can just be used
        additionalMiddleware,
        // you can also type middlewares manually
        untypedMiddleware as Middleware<
          (action: Action<'specialAction'>) => number,
          RootState
        >
      )
      // prepend and concat calls can be chained
      .concat(logger)
})
```

### Matching Actions

RTK-generated action creators have a `match` method that acts as a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates). Calling `someActionCreator.match(action)` will do a string comparison against the `action.type` string, and if used as a condition, narrow the type of `action` down to be the correct TS type:

```ts
const increment = createAction<number>('increment')
function test(action: Action) {
  if (increment.match(action)) {
    // action.payload inferred correctly here
    const num = 5 + action.payload
  }
}
```

This is particularly useful when checking for action types in Redux middleware, such as custom middleware, `redux-observable`, and RxJS's `filter` method.

### Typing `createSlice`

#### Defining Separate Case Reducers

If you have too many case reducers and defining them inline would be messy, or you want to reuse case reducers across slices, you can also define them outside the `createSlice` call and type them as `CaseReducer`:

```ts
type State = number
const increment: CaseReducer<State, PayloadAction<number>> = (state, action) =>
  state + action.payload

createSlice({
  name: 'test',
  initialState: 0,
  reducers: {
    increment
  }
})
```

#### Typing `extraReducers`

If you are adding an `extraReducers` field in `createSlice`, be sure to use the "builder callback" form, as the "plain object" form cannot infer action types correctly. Passing an RTK-generated action creator to `builder.addCase()` will correctly infer the type of the `action`:

```ts
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // fill in primary logic here
  },
  // highlight-start
  extraReducers: builder => {
    builder.addCase(fetchUserById.pending, (state, action) => {
      // both `state` and `action` are now correctly typed
      // based on the slice state and the `pending` action creator
    })
  }
  // highlight-end
})
```

#### Typing `prepare` Callbacks

If you want to add a `meta` or `error` property to your action, or customize the `payload` of your action, you have to use the `prepare` notation for defining the case reducer. Using this notation with TypeScript looks like:

```ts
const blogSlice = createSlice({
  name: 'blogData',
  initialState,
  reducers: {
    // highlight-start
    receivedAll: {
      reducer(
        state,
        action: PayloadAction<Page[], string, { currentPage: number }>
      ) {
        state.all = action.payload
        state.meta = action.meta
      },
      prepare(payload: Page[], currentPage: number) {
        return { payload, meta: { currentPage } }
      }
    }
    // highlight-end
  }
})
```

#### Fixing Circular Types in Exported Slices

Finally, on rare occasions you might need to export the slice reducer with a specific type in order to break a circular type dependency problem. This might look like:

```ts
export default counterSlice.reducer as Reducer<Counter>
```

### Typing `createAsyncThunk`

For basic usage, the only type you need to provide for `createAsyncThunk` is the type of the single argument for your payload creation callback. You should also ensure that the return value of the callback is typed correctly:

```ts
const fetchUserById = createAsyncThunk(
  'users/fetchById',
  // Declare the type your function argument here:
  // highlight-next-line
  async (userId: number) => {
    const response = await fetch(`https://reqres.in/api/users/${userId}`)
    // Inferred return type: Promise<MyData>
    // highlight-next-line
    return (await response.json()) as MyData
  }
)

// the parameter of `fetchUserById` is automatically inferred to `number` here
// and dispatching the resulting thunkAction will return a Promise of a correctly
// typed "fulfilled" or "rejected" action.
const lastReturnedAction = await store.dispatch(fetchUserById(3))
```

If you need to modify the types of the `thunkApi` parameter, such as supplying the type of the `state` returned by `getState()`, you must supply the first two generic arguments for return type and payload argument, plus whicher "thunkApi argument fields" are relevant in an object:

```ts
const fetchUserById = createAsyncThunk<
  //highlight-start
  // Return type of the payload creator
  MyData,
  // First argument to the payload creator
  number,
  {
    // Optional fields for defining thunkApi field types
    dispatch: AppDispatch
    state: State
    extra: {
      jwt: string
    }
  }
  // highlight-end
>('users/fetchById', async (userId, thunkApi) => {
  const response = await fetch(`https://reqres.in/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${thunkApi.extra.jwt}`
    }
  })
  return (await response.json()) as MyData
})
```

### Typing `createEntityAdapter`

Typing `createEntityAdapter` only requires you to specify the entity type as the single generic argument. This typically looks like:

```ts
interface Book {
  bookId: number
  title: string
  // ...
}

// highlight-next-line
const booksAdapter = createEntityAdapter<Book>({
  selectId: book => book.bookId,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const booksSlice = createSlice({
  name: 'books',
  // highlight-start
  // The type of the state is inferred here
  initialState: booksAdapter.getInitialState(),
  // highlight-end
  reducers: {
    bookAdded: booksAdapter.addOne,
    booksReceived(state, action: PayloadAction<{ books: Book[] }>) {
      booksAdapter.setAll(state, action.payload.books)
    }
  }
})
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
  - [React Redux docs: Static Typing](https://react-redux.js.org/using-react-redux/static-typing): Examples of how to use the React Redux APIs with TypeScript
  - [Redux Toolkit docs: Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript): Examples of how to use the Redux Toolkit APIs with TypeScript
- React + Redux + TypeScript guides:
  - [React+TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet): a comprehensive guide to using React with TypeScript
  - [React + Redux in TypeScript Guide](https://github.com/piotrwitek/react-redux-typescript-guide): extensive information on patterns for using React and Redux with TypeScript
    - _Note: while this guide has some useful info, many of the patterns it shows go against our recommended practices shown in this page, such as using action type unions. We link this out of completeness_
- Other articles:
  - [Do Not Create Union Types with Redux Action Types](https://phryneas.de/redux-typescript-no-discriminating-union)
  - [Redux with Code-Splitting and Type Checking](https://www.matthewgerstman.com/tech/redux-code-split-typecheck/)
