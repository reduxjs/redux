# Configuring Your Store

In the [basics section](../basics/README.md), we introduced the fundamental Redux concepts by building an example Todo list app.

We will now explore how to customise the store to add extra functionality. We'll start with the source code from the basics section, which you can view in [the documentation](../basics/ExampleTodoList.md), in [our repository of examples](https://github.com/reduxjs/redux/tree/master/examples/todos/src), or [in your browser via CodeSandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos).

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

In this code, we pass our reducers to the Redux `createStore` function, which returns a `store` object. We then pass this object to the react-redux `Provider` component, which is rendered at the top of our component tree.

This ensures that any time we connect to redux in our app via react-redux `connect`, the store is available to our components.

## Extending Redux functionality

Most apps extend the functionality of their Redux store by adding middleware or store enhancers _(note: middleware is common, enhancers are less common)_. Middleware adds extra functionality to the Redux `dispatch` function; enhancers add extra functionality to the Redux store.

We will add one of each:

- A middleware which logs dispatched actions and the resulting new state.
- An enhancer which logs the time taken for the reducers to process each action.

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

const monitorReducerEnhancer = createStore => (
  reducer,
  initialState,
  enhancer
) => {
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

Let's add these to our  existing `index.js`.

- First, we need to import our `monitorReducerEnhancer` and `loggerMiddleware`, plus two extra functions provided by Redux: `applyMiddleware` and `compose`.
- We then use `applyMiddleware` to creates a store enhancer which will apply our `loggerMiddleware` to the store's dispatch function.
- Next, we use `compose` to compose our new `middlewareEnhancer` and our `monitorReducerEnhancer` into one function.
- Finally, we pass this new `composedEnhancers` function into `createStore` as its third argument. _Note: the second argument, which we will ignore, lets you preloaded state into the store._

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import loggerMiddleware from './middleware/logger'
import monitorReducerEnhancer from './enhancers/monitorReducer'
import App from './components/App'

const middlewareEnhancer = applyMiddleware(loggerMiddleware)
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

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware]
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
  if (process.env === 'development') {
    middlewares.push(secretMiddleware)
  }
  ```
- A `preloadedState` variable is passed through to `createStore` in case we want to add this later.

This also makes our `createStore` function easier to reason about -  each step is clearly separated, which makes it more obvious what exactly is happening.