---
id: writing-custom-middleware
title: Writing Custom Middleware
---

# Writing Custom Middleware

:::tip What You'll Learn

- When to use custom middleware
- Standard patterns for middleware
- How to make sure that your middleware is compatible with other Redux projects

:::

Middleware in Redux can be mainly used to either

- create side effects for actions, or to
- modify or cancel actions.

Most use cases fall into the first category: For example [Redux-Saga](https://github.com/redux-saga/redux-saga/), [redux-observable](https://github.com/redux-observable/redux-observable), and [RTK listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) all create side effects that react to actions. These examples also show that this is a very common need: To be able to react to an action other than with a state change.

The most obvious example for modifying actions is [Redux Thunk](https://github.com/reduxjs/redux-thunk), which transforms a function returning an action into an action by calling it. But it can also be used to e.g. enhance an action with information from the state or from an external input.

## When to use custom middleware

Most of the time, you won't actually need custom middleware. The most likely use case for middleware is side effects, and there is plenty of packages who nicely package side effects for Redux and have been in use long enough to get rid of the subtle problems you would run into when building this yourself. A good starting point is [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for managing server-side state and [RTK listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) for other side effects.

You might still want to use custom middleware in one of two cases:

1. If you only have a single, very simple side effect, it might not be worth it to add a full additional framework. Just make sure that you switch to an existing framework once your application grows instead of growing your own custom solution.
2. If you need to modify or cancel actions.

## Standard patterns for middleware

Middleware roughly works like this:

```ts
const middleware: Middleware = api => next => action => {
  // Do something before the action hits the reducer and the next middlewares
  const beforeState = api.getState()
  beforeSideEffect(action, beforeState)
  // Do something with the action before passing it along
  const enhancedAction = enhance(action, beforeState, api)
  let response: unknown
  // Pass the action along, or cancel it by not passing it
  if (!shouldCancelAction(enhancedAction, beforeState)) {
    response = next(enhancedAction)
  }
  // Do something after the action hits the reducer
  const afterState = api.getState()
  afterSideEffect(action, afterState, api)

  // Do something with the dispatch function return value
  return enhanceDispatch(response, api)
}
```

The different points to hook in (as marked by the comments) combined with the main usage for side-effects leads to two main patterns that are used in many different libraries.

### Early side effect

```ts
const middleware: Middleware = api => next => action => {
  // Do something before the action hits the reducer and the next middlewares
  const beforeState = api.getState()
  beforeSideEffect(action, beforeState, api)
  return next(action)
}
```

### Late side effect

```ts
const middleware: Middleware = api => next => action => {
  const response = next(action)

  // Do something after the action hits the reducer
  const afterState = api.getState()
  afterSideEffect(action, afterState, api)

  return response
}
```

## Rules to make compatible middleware

In principle, middleware is a very powerful pattern and can do whatever it wants with an action. Existing middleware might have assumptions about what happens in the middleware around it, though, and being aware of these assumptions will make it easier to ensure that your middleware works well with existing commonly used middleware.

There are two contact points between our middleware and the other middlewares:

### Calling the next middleware

When you call `next`, the middleware will expect some form of action. Unless you want to explicitly modify it, just pass through the action that you received.

More subtly, some middlewares expect that the middleware is called on the same tick as `dispatch` is called, so `next` should be called synchronously by your middleware.

### Returning the dispatch return value

Unless the middleware needs to explicitly modify the return value of `dispatch`, just return what you get from `next`. If you do need to modify the return value, then your middleware will need to sit in a very specific spot in the middleware chain to be able to do what it is supposed to - you will need to check compatibility with all other middlewares manually and decide how they could work together.

This has a tricky consequence:

```ts
const middleware: Middleware = api => next => async action => {
  const response = next(action)

  // Do something after the action hits the reducer
  const afterState = api.getState()
  if (action.type === 'REQUEST_FETCH') {
    const data = await fetchData()
    api.dispatch(dataFetchedAction(data))
  }

  return response
}
```

Even though it looks like we didn't modify the response, we actually did: Due to async-await, it is now a promise. This will break some middlewares like the one from RTK Query.

So how to write this middleware?

```ts
const middleware: Middleware = api => next => action => {
  const response = next(action)

  // Do something after the action hits the reducer
  const afterState = api.getState()
  if (action.type === 'REQUEST_FETCH') {
    void loadData(api)
  }

  return response
}

async function loadData(api) {
  const data = await fetchData()
  api.dispatch(dataFetchedAction(data))
}
```

Just move out the async logic into a separate function so that you can still use async-await, but don't actually wait for the promise to resolve in the middleware. `void` indicates to others reading the code that you decided to not await the promise explicitly without having an effect on the code.

## Next Steps

If you haven't yet, take a look at [the Middleware section in Understanding Redux](../understanding/history-and-design/middleware.md) to understand how middleware works under the hood.
