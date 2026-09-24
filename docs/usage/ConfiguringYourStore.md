---
id: configuring-your-store
title: Configuring Your Store
sidebar_label: Configuring Your Store
---

# Configuring Your Store

In the ["Redux Fundamentals" tutorial](../tutorials/fundamentals/part-1-overview.md), we introduced the fundamental Redux concepts by building an example Todo list app. As part of that, we talked about [how to create and configure a Redux store](../tutorials/fundamentals/part-4-store.md).

We will now explore how to customize the store to add extra functionality: middleware, store enhancers, preloaded state, DevTools integration, and hot reloading. The examples build on the todo app from the tutorial and assume it has `todos` and `filters` slice reducers.

## Creating the store

Redux Toolkit's [`configureStore`](/toolkit/api/configureStore) creates the store. It accepts an object with named options, and the only required one is `reducer`:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

When `reducer` is an object of slice reducers, `configureStore` calls `combineReducers` for you. You can also pass a single root reducer function.

The store is then passed to the React-Redux `Provider` at the top of the component tree, so that `useSelector` and `useDispatch` can reach it from any component:

```tsx title="main.tsx"
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

With no other options, `configureStore` already does several things:

- Adds the [`redux-thunk` middleware](https://github.com/reduxjs/redux-thunk), so you can dispatch functions for async logic
- In development, adds middleware that warn about [accidental state mutations](/toolkit/api/immutabilityMiddleware) and [non-serializable values](/toolkit/api/serializabilityMiddleware) in state or actions
- Enables the [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension) if it is installed in the browser

The rest of this page covers how to add to or change those defaults.

## Extending Redux functionality

Most apps extend the functionality of their Redux store by adding middleware or store enhancers _(note: middleware is common, enhancers are less common)_. Middleware adds extra functionality to the Redux `dispatch` function; enhancers add extra functionality to the Redux store.

We will add one middleware and one enhancer:

- A middleware which logs dispatched actions and the resulting new state.
- An enhancer which logs the time taken for the reducers to process each action.

```ts title="app/middleware/logger.ts"
import { isAction, type Middleware } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = store => next => action => {
  console.group(isAction(action) ? action.type : 'unknown action')
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
```

```ts title="app/enhancers/monitorReducer.ts"
import type { StoreEnhancer } from '@reduxjs/toolkit'

const round = (number: number) => Math.round(number * 100) / 100

export const monitorReducerEnhancer: StoreEnhancer =
  createStore => (reducer, preloadedState) => {
    const monitoredReducer: typeof reducer = (state, action) => {
      const start = performance.now()
      const newState = reducer(state, action)
      const end = performance.now()

      console.log('reducer process time:', round(end - start))

      return newState
    }

    return createStore(monitoredReducer, preloadedState)
  }
```

`configureStore` takes a `middleware` option and an `enhancers` option. Each one is a callback that receives a function returning the default list, so you can add your own items while keeping the defaults:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'
import { loggerMiddleware } from './middleware/logger'
import { monitorReducerEnhancer } from './enhancers/monitorReducer'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(loggerMiddleware),
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(monitorReducerEnhancer)
})
```

A few details worth knowing:

- Middleware run in array order when an action is dispatched. `concat` puts your middleware after the defaults, so the thunk middleware has already resolved any thunk functions by the time the logger sees the action. Use `prepend` to run before the defaults instead.
- `getDefaultMiddleware()` and `getDefaultEnhancers()` accept options to turn off or tune individual defaults. See the [`getDefaultMiddleware`](/toolkit/api/getDefaultMiddleware) and [`getDefaultEnhancers`](/toolkit/api/getDefaultEnhancers) docs.
- If you return a list that does not include the defaults, they are not added. That is occasionally what you want, but usually you should keep them. In TypeScript, a list built without the defaults should be a `new Tuple(...)` from Redux Toolkit rather than a plain array, so that the store's `dispatch` type is inferred correctly.

It is common to add some middleware only in development. Since the callback is a normal function, an `if` statement works:

```ts
middleware: getDefaultMiddleware => {
  const middleware = getDefaultMiddleware()
  if (process.env.NODE_ENV !== 'production') {
    return middleware.concat(loggerMiddleware)
  }
  return middleware
}
```

## Other options

`configureStore` accepts two more options that come up regularly:

- `preloadedState`: an initial state value for the store, which takes priority over the reducers' own initial state. This is how server-rendered apps hand state to the client, and how apps restore persisted state. See [Initializing State](./structuring-reducers/InitializingState.md).
- `devTools`: `true` by default. Set it to `false` to turn off the DevTools Extension integration, or pass an [options object](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md) to name the store instance, set a trace limit, or sanitize actions and state before they are sent to the extension.

```ts
export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: {
    name: 'Todo app',
    trace: true
  }
})
```

## Hot reloading

Hot module reloading lets you change a reducer while the app is running without resetting the store's state. The bundler swaps in the new module, and you call `store.replaceReducer` with the updated root reducer.

With Vite:

```ts title="app/store.ts"
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

const rootReducer = combineReducers({
  todos: todosReducer,
  filters: filtersReducer
})

export const store = configureStore({ reducer: rootReducer })

if (import.meta.hot) {
  import.meta.hot.accept(
    ['../features/todos/todosSlice', '../features/filters/filtersSlice'],
    () => store.replaceReducer(rootReducer)
  )
}
```

With webpack the check is `module.hot` and the call is `module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))`.

React components do not need any extra code for this. Vite and most other current React setups use React Fast Refresh, which re-renders changed components in place. The store module itself has not changed, so its state is kept.

## What `configureStore` does underneath

`configureStore` is a wrapper around the Redux core APIs. This is roughly what it does:

```ts
import { applyMiddleware, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from '@redux-devtools/extension'

const middlewareEnhancer = applyMiddleware(thunk, loggerMiddleware)
const composedEnhancers = composeWithDevTools(
  middlewareEnhancer,
  monitorReducerEnhancer
)

const store = createStore(rootReducer, preloadedState, composedEnhancers)
```

`applyMiddleware` turns a list of middleware into a single store enhancer. `createStore` only accepts one enhancer, so multiple enhancers are composed into one first; `composeWithDevTools` does that and also connects the store to the DevTools Extension. The development-only checks are additional middleware in the default list.

If you want to understand these pieces in more detail, see [Understanding Middleware](../understanding/history-and-design/middleware.md), and the API reference pages for [`createStore`](../api/createStore.md), [`applyMiddleware`](../api/applyMiddleware.md), and [`compose`](../api/compose.md).

## Next Steps

Now that you know how to configure the store, you can [look at the full Redux Toolkit `configureStore` API](/toolkit/api/configureStore), read about [writing custom middleware](./WritingCustomMiddleware.md), or take a closer look at the [DevTools and debugging tools in the Redux ecosystem](../introduction/Ecosystem.md#devtools-and-debugging).
