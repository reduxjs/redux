---
id: ecosystem
title: Ecosystem
description: 'Introduction > Ecosystem: Links to popular, recommended, and interesting Redux-related libraries'
---

# Ecosystem

Redux is a tiny library, but its contracts and APIs are carefully chosen to spawn an ecosystem of tools and extensions, and the community has created a wide variety of helpful addons, libraries, and tools. You don't need to use any of these addons to use Redux, but they can help make it easier to implement features and solve problems in your application.

Most of what the community built as separate addons in the early years of Redux is now part of [Redux Toolkit](/toolkit): store setup, immutable updates, action creators, normalized entity management, data fetching and caching, and reactive side effects. Check whether RTK already covers your use case before reaching for a third-party library.

This page lists the addons that the Redux maintainers recommend today, plus a few widely used community libraries that are still maintained. For a much larger (and much older) catalog, see the [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) list, but be aware that most of the libraries there have not been updated since 2020.

## Table of Contents

- [Redux Toolkit](#redux-toolkit)
- [DevTools and Debugging](#devtools-and-debugging)
- [Side Effects](#side-effects)
- [Persistence and Routing](#persistence-and-routing)
- [Testing and Utilities](#testing-and-utilities)

## Redux Toolkit

**[reduxjs/redux-toolkit](https://github.com/reduxjs/redux-toolkit)** <br />
The official, opinionated, batteries-included toolset for Redux development. It is the standard way to write Redux logic. Redux Toolkit includes:

- [`configureStore`](/toolkit/api/configureStore): sets up the store with the thunk middleware, DevTools integration, and development-mode checks for accidental mutations and non-serializable values
- [`createSlice`](/toolkit/api/createSlice): generates action creators and action types from a set of reducer functions, with [Immer](https://immerjs.github.io/immer/) built in for "mutating" immutable updates
- [`createAsyncThunk`](/toolkit/api/createAsyncThunk): dispatches pending/fulfilled/rejected actions around an async function
- [`createEntityAdapter`](/toolkit/api/createEntityAdapter): prebuilt reducers and selectors for normalized `{ ids, entities }` state
- [`createListenerMiddleware`](/toolkit/api/createListenerMiddleware): runs effects in response to dispatched actions or state changes
- [RTK Query](/toolkit/rtk-query/overview): data fetching and caching, generated from an API definition
- [`combineSlices`](/toolkit/api/combineSlices) and [`createDynamicMiddleware`](/toolkit/api/createDynamicMiddleware): lazy-loaded reducers and middleware for code splitting

**[reduxjs/react-redux](https://github.com/reduxjs/react-redux)** <br />
The official React bindings for Redux, maintained by the Redux team. Provides the `useSelector` and `useDispatch` hooks and the `<Provider>` component.

**[reduxjs/reselect](https://github.com/reduxjs/reselect)** <br />
Creates composable memoized selector functions for efficiently deriving data from the store state. Re-exported from Redux Toolkit.

```ts
const selectTax = createSelector(
  [selectSubtotal, selectTaxPercent],
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)
```

**[dai-shi/proxy-memoize](https://github.com/dai-shi/proxy-memoize)** <br />
An alternative selector library. Instead of declaring input selectors, it tracks which parts of the state a selector actually reads, using Proxies, and only recomputes when those parts change.

```ts
const selectTax = memoize(
  (state: RootState) => state.cart.subtotal * (state.cart.taxPercent / 100)
)
```

**[immerjs/immer](https://github.com/immerjs/immer)** <br />
Immutable updates with normal mutative code, using Proxies. Used internally by `createSlice` and `createReducer`, and also useful on its own.

```ts
const nextState = produce(baseState, draftState => {
  draftState.push({ todo: 'Tweet about it' })
  draftState[1].done = true
})
```

## DevTools and Debugging

**[Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension)** <br />
Browser extension for [Chrome](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/), and [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) that shows dispatched actions, state diffs, and lets you time-travel through state history. `configureStore` enables the connection automatically in development.

**[reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools)** <br />
The monorepo for the extension and the `@redux-devtools/*` packages, including the standalone Remote DevTools app and the in-page monitor components used to build custom debugging UIs.

**[matt-oakes/redux-devtools-expo-dev-plugin](https://github.com/matt-oakes/redux-devtools-expo-dev-plugin)** <br />
Expo dev tools plugin that embeds the Redux DevTools UI for React Native apps built with Expo.

**[infinitered/reactotron](https://github.com/infinitered/reactotron)** <br />
A cross-platform desktop app for inspecting React and React Native apps, including app state, API requests, perf, errors, sagas, and action dispatching.

**[EskiMojo14/use-reducer-devtools](https://github.com/EskiMojo14/use-reducer-devtools)** <br />
A `useReducer` wrapper that connects component-local reducer state to the Redux DevTools extension, including time-travel debugging.

## Side Effects

Redux Toolkit's `configureStore` adds the thunk middleware by default, and RTK also includes `createAsyncThunk`, `createListenerMiddleware`, and RTK Query. Those cover most apps. See [Side Effects Approaches](../usage/side-effects-approaches.mdx) for a comparison, and the [Style Guide](../style-guide/style-guide.md#use-thunks-and-listeners-for-other-async-logic) for our recommendations on when to use each.

**[reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)** <br />
Dispatch functions, which are called and given `dispatch` and `getState` as parameters. Included in Redux Toolkit and enabled by `configureStore`; you only need to install it separately if you are using the core `createStore` API.

**Best for**: the default choice for async requests and any logic that needs access to `dispatch` or `getState`. See [Writing Logic with Thunks](../usage/writing-logic-thunks.mdx).

```ts
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

export const addTodoIfAllowed =
  (todoText: string): AppThunk =>
  (dispatch, getState) => {
    if (selectTodoCount(getState()) < MAX_TODOS) {
      dispatch(todoAdded(todoText))
    }
  }
```

**[createListenerMiddleware (Redux Toolkit)](/toolkit/api/createListenerMiddleware)** <br />
A lightweight alternative to sagas and observables. Listeners run an effect after a matching action is dispatched, and the effect can wait for further actions or state changes, cancel itself, and start child tasks.

**Best for**: "when X happens, do Y" logic, analytics, and reacting to state changes.

```ts
listenerMiddleware.startListening({
  matcher: isAnyOf(todoAdded, todoToggled, todoDeleted),
  effect: (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())
    analyticsApi.trackUsage(action.type, user)
  }
})
```

**[redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)** <br />
Handle async logic using synchronous-looking generator functions. Sagas return descriptions of effects, which are executed by the saga middleware, and act like "background threads" for JS applications.

**Best for**: complex async workflows with cancellation, debouncing, or coordination between multiple concurrent tasks.

```js
function* fetchData(action) {
  const { someValue } = action
  try {
    const response = yield call(myAjaxLib.post, '/someEndpoint', {
      data: someValue
    })
    yield put({ type: 'REQUEST_SUCCEEDED', payload: response })
  } catch (error) {
    yield put({ type: 'REQUEST_FAILED', error: error })
  }
}
```

**[redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)** <br />
Handle async logic using RxJS observable chains called "epics". Compose and cancel async actions to create side effects and more.

**Best for**: teams already using RxJS who want the same operators for Redux logic.

```js
const loginRequestEpic = action$ =>
  action$.pipe(
    ofType(LOGIN_REQUEST),
    mergeMap(({ payload: { username, password } }) =>
      from(postLogin(username, password)).pipe(
        map(loginSuccess),
        catchError(loginFailure)
      )
    )
  )
```

## Persistence and Routing

**[zewish/redux-remember](https://github.com/zewish/redux-remember)** <br />
Saves selected parts of the store to `localStorage`, `AsyncStorage`, or any storage driver you provide, and rehydrates them on startup. Actively maintained and written with `configureStore` in mind.

**[rt2zz/redux-persist](https://github.com/rt2zz/redux-persist)** <br />
Persist and rehydrate a Redux store, with many extensible options. This is the most widely used persistence library, but it is **not maintained**: the last release was v6.0.0 in 2019, and open issues and pull requests are not being handled. It still works with current Redux versions. If you are starting a new project, prefer `redux-remember` or write your own small persistence layer with a listener middleware and `preloadedState`.

```ts
const persistConfig = { key: 'root', version: 1, storage }
const persistedReducer = persistReducer(persistConfig, rootReducer)
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})
export const persistor = persistStore(store)
```

For routing, we recommend keeping router state in your router rather than copying it into the Redux store. The FAQ's [rules of thumb for what belongs in the store](../faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer) apply here as well. `connected-react-router`, the library that used to be listed here, does not support React Router v6 and is no longer maintained. If you still need to sync history into the store, [salvoravida/redux-first-history](https://github.com/salvoravida/redux-first-history) is an actively maintained option.

## Testing and Utilities

For testing Redux apps, we recommend rendering real components with a real store instead of mocking the store or testing reducers and action creators in isolation. See [Writing Tests](../usage/WritingTests.mdx) for the full approach and example setup.

**[testing-library/react-testing-library](https://github.com/testing-library/react-testing-library)** <br />
Renders components and queries the DOM the way a user would. The [Writing Tests](../usage/WritingTests.mdx) page shows a `renderWithProviders` helper that wraps it with a Redux `<Provider>`.

**[mswjs/msw](https://github.com/mswjs/msw)** <br />
Mock Service Worker: intercepts network requests at the network level, so thunks and RTK Query endpoints can be tested against realistic responses without changing application code.

**[jfairbank/redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)** <br />
Integration and unit testing for sagas, if you use redux-saga.

**[EskiMojo14/history-adapter](https://github.com/EskiMojo14/history-adapter)** <br />
Undo/redo for Immer-based state, by Redux maintainer Ben Durrant. The `history-adapter/redux` entry point provides `undo`, `redo`, and `undoableReducer` helpers that plug straight into `createSlice`.

```ts
const counterAdapter = createHistoryAdapter<CounterState>({ limit: 10 })

const counterSlice = createSlice({
  name: 'counter',
  initialState: counterAdapter.getInitialState({ value: 0 }),
  reducers: {
    undo: counterAdapter.undo,
    redo: counterAdapter.redo,
    increment: counterAdapter.undoableReducer(state => {
      state.value += 1
    })
  }
})
```

**[omnidan/redux-undo](https://github.com/omnidan/redux-undo)** <br />
Higher-order reducer that adds undo/redo and action history to any reducer. The repository was archived in January 2026 and is no longer maintained, but the package still works and is what the [Implementing Undo History](../usage/ImplementingUndoHistory.md) page uses.

**[paularmstrong/normalizr](https://github.com/paularmstrong/normalizr)** <br />
Normalizes nested API responses into flat `{ entities, result }` structures based on a schema definition. No longer maintained (the repository is archived), but it still works and is useful when a server returns deeply nested data that you want to store in `createEntityAdapter` slices. See [Normalizing State Shape](../usage/structuring-reducers/NormalizingStateShape.md).

**[EskiMojo14/use-rtk-slice](https://github.com/EskiMojo14/use-rtk-slice)** <br />
A `useReducer`-style hook for managing local component state with a slice created by `createSlice`, for cases where the logic benefits from Redux-style reducers but the state does not belong in the store.

**[redux-utilities/reduce-reducers](https://github.com/redux-utilities/reduce-reducers)** <br />
Provides sequential composition of reducers at the same level, for cases where several reducers need to run in order against the same state. See [Beyond `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md).

```js
const combinedReducer = combineReducers({ users, posts, comments })
const rootReducer = reduceReducers(combinedReducer, otherTopLevelFeatureReducer)
```

**[Flux Standard Action](https://github.com/redux-utilities/flux-standard-action)** <br />
A human-friendly standard for Flux action objects. Redux Toolkit's `createAction` and `createSlice` generate actions that follow this shape (`type`, `payload`, optional `meta` and `error`).
