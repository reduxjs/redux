---
id: configuring-your-store
title: Configuring Your Store
sidebar_label: Configuring Your Store
---

# Configuring Your Store

In the ["Redux Fundamentals" tutorial](../tutorials/fundamentals/part-1-overview.md), we introduced the fundamental Redux concepts by building an example Todo list app. As part of that, we talked about [how to create and configure a Redux store](../tutorials/fundamentals/part-4-store.md).

We will now explore how to customise the store to add extra functionality. We'll start with the source code from ["Redux Fundamentals" part 5: UI and React](../tutorials/fundamentals/part-5-ui-and-react.md). You can view the source from this stage of the tutorial in [the example app repository on Github](https://github.com/reduxjs/redux-fundamentals-example-app/tree/checkpoint-5-uiAllActions), or [in your browser via CodeSandbox](https://codesandbox.io/s/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-5-uiAllActions/).

## Creating the store

First, let's look at the original `index.js` file in which we created our store:

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './components/App'

const store = createStore(rootReducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

In this code, we pass our reducers to the Redux `createStore` function, which returns a `store` object. We then pass this object to the `react-redux` `Provider` component, which is rendered at the top of our component tree.

This ensures that any time we connect to Redux in our app via `react-redux` `connect`, the store is available to our components.

## Extending Redux functionality

Most apps extend the functionality of their Redux store by adding middleware or store enhancers _(note: middleware is common, enhancers are less common)_. Middleware adds extra functionality to the Redux `dispatch` function; enhancers add extra functionality to the Redux store.

We will add two middlewares and one enhancer:

- The [`redux-thunk` middleware](https://github.com/reduxjs/redux-thunk), which allows simple asynchronous use of dispatch.
- A middleware which logs dispatched actions and the resulting new state.
- An enhancer which logs the time taken for the reducers to process each action.

#### Install `redux-thunk`

```sh
npm install redux-thunk
```

#### middleware/logger.js

```js
const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger
```

#### enhancers/monitorReducer.js

```js
const round = number => Math.round(number * 100) / 100

const monitorReducerEnhancer =
  createStore => (reducer, initialState, enhancer) => {
    const monitoredReducer = (state, action) => {
      const start = performance.now()
      const newState = reducer(state, action)
      const end = performance.now()
      const diff = round(end - start)

      console.log('reducer process time:', diff)

      return newState
    }

    return createStore(monitoredReducer, initialState, enhancer)
  }

export default monitorReducerEnhancer
```

Let's add these to our existing `index.js`.

- First, we need to import `redux-thunk` plus our `loggerMiddleware` and `monitorReducerEnhancer`, plus two extra functions provided by Redux: `applyMiddleware` and `compose`.
- We then use `applyMiddleware` to create a store enhancer which will apply our `loggerMiddleware` and the `thunk` middleware to the store's dispatch function.
- Next, we use `compose` to compose our new `middlewareEnhancer` and our `monitorReducerEnhancer` into one function.

  This is needed because you can only pass one enhancer into `createStore`. To use multiple enhancers, you must first compose them into a single larger enhancer, as shown in this example.

- Finally, we pass this new `composedEnhancers` function into `createStore` as its third argument. _Note: the second argument, which we will ignore, lets you preloaded state into the store._

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore, compose } from 'redux'
import { thunk } from 'redux-thunk'
import rootReducer from './reducers'
import loggerMiddleware from './middleware/logger'
import monitorReducerEnhancer from './enhancers/monitorReducer'
import App from './components/App'

const middlewareEnhancer = applyMiddleware(loggerMiddleware, thunk)
const composedEnhancers = compose(middlewareEnhancer, monitorReducerEnhancer)

const store = createStore(rootReducer, undefined, composedEnhancers)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

## Problems with this approach

While this code works, for a typical app it is not ideal.

Most apps use more than one middleware, and each middleware often requires some initial setup. The extra noise added to the `index.js` can quickly make it hard to maintain, because the logic is not cleanly organised.

## The solution: `configureStore`

The solution to this problem is to create a new `configureStore` function which encapsulates our store creation logic, which can then be located in its own file to ease extensibility.

The end goal is for our `index.js` to look like this:

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './configureStore'

const store = configureStore()

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

All the logic related to configuring the store - including importing reducers, middleware, and enhancers - is handled in a dedicated file.

To achieve this, `configureStore` function looks like this:

```js
import { applyMiddleware, compose, createStore } from 'redux'
import { thunk } from 'redux-thunk'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = compose(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  return store
}
```

This function follows the same steps outlined above, with some of the logic split out to prepare for extension, which will make it easier to add more in future:

- Both `middlewares` and `enhancers` are defined as arrays, separate from the functions which consume them.

  This allows us to easily add more middleware or enhancers based on different conditions.

  For example, it is common to add some middleware only when in development mode, which is easily achieved by pushing to the middlewares array inside an if statement:

  ```js
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(secretMiddleware)
  }
  ```

- A `preloadedState` variable is passed through to `createStore` in case we want to add this later.

This also makes our `createStore` function easier to reason about - each step is clearly separated, which makes it more obvious what exactly is happening.

## Integrating the devtools extension

Another common feature which you may wish to add to your app is the `redux-devtools-extension` integration.

The extension is a suite of tools which give you absolute control over your Redux store - it allows you to inspect and replay actions, explore your state at different times, dispatch actions directly to the store, and much more. [Click here to read more about the available features.](https://github.com/reduxjs/redux-devtools/tree/main/extension)

There are several ways to integrate the extension, but we will use the most convenient option.

First, we install the package via npm:

```sh
npm install --save-dev redux-devtools-extension
```

Next, we remove the `compose` function which we imported from `redux`, and replace it with a new `composeWithDevTools` function imported from `redux-devtools-extension`.

The final code looks like this:

```js
import { applyMiddleware, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = composeWithDevTools(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  return store
}
```

And that's it!

If we now visit our app via a browser with the devtools extension installed, we can explore and debug using a powerful new tool.

## Hot reloading

Another powerful tool which can make the development process a lot more intuitive is hot reloading, which means replacing pieces of code without restarting your whole app.

For example, consider what happens when you run your app, interact with it for a while, and then decide to make changes to one of your reducers. Normally, when you make those changes your app will restart, reverting your Redux state to its initial value.

With hot module reloading enabled, only the reducer you changed would be reloaded, allowing you to change your code _without_ resetting the state every time. This makes for a much faster development process.

We'll add hot reloading both to our Redux reducers and to our React components.

First, let's add it to our `configureStore` function:

```js
import { applyMiddleware, compose, createStore } from 'redux'
import { thunk } from 'redux-thunk'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = compose(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

The new code is wrapped in an `if` statement, so it only runs when our app is not in production mode, and only if the `module.hot` feature is available.

Bundlers like Webpack and Parcel support a `module.hot.accept` method to specify which module should be hot reloaded, and what should happen when the module changes. In this case, we're watching the `./reducers` module, and passing the updated `rootReducer` to the `store.replaceReducer` method when it changes.

We'll also use the same pattern in our `index.js` to hot reload any changes to our React components:

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './configureStore'

const store = configureStore()

const renderApp = () =>
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./components/App', renderApp)
}

renderApp()
```

The only extra change here is that we have encapsulated our app's rendering into a new `renderApp` function, which we now call to re-render the app.

## Simplifying Setup with Redux Toolkit

The Redux core library is deliberately unopinionated. It lets you decide how you want to handle everything, like store
setup, what your state contains, and how you want to build your reducers.

This is good in some cases, because it gives you flexibility, but that flexibility isn't always needed. Sometimes we
just want the simplest possible way to get started, with some good default behavior out of the box.

The [Redux Toolkit](https://redux-toolkit.js.org/) package is designed to help simplify several common Redux use cases, including store setup.
Let's see how it can help improve the store setup process.

Redux Toolkit includes a prebuilt [`configureStore` function](https://redux-toolkit.js.org/api/configureStore) like
the one shown in the earlier examples.

The fastest way to use is it is to just pass the root reducer function:

```js
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducers'

const store = configureStore({
  reducer: rootReducer
})

export default store
```

Note that it accepts an object with named parameters, to make it clearer what you're passing in.

By default, `configureStore` from Redux Toolkit will:

- Call `applyMiddleware` with [a default list of middleware, including `redux-thunk`](https://redux-toolkit.js.org/api/getDefaultMiddleware), and some development-only middleware that catch common mistakes like mutating state
- Call `composeWithDevTools` to set up the Redux DevTools Extension

Here's what the hot reloading example might look like using Redux Toolkit:

```js
import { configureStore } from '@reduxjs/toolkit'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().prepend(loggerMiddleware),
    preloadedState,
    enhancers: [monitorReducersEnhancer]
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

That definitely simplifies some of the setup process.

## Next Steps

Now that you know how to encapsulate your store configuration to make it easier to maintain, you can [look at the Redux Toolkit `configureStore` API](https://redux-toolkit.js.org/api/configureStore), or take a closer look at some of the [extensions available in the Redux ecosystem](../introduction/Ecosystem.md#debuggers-and-viewers).
