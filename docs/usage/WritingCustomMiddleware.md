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

- create side effects for actions,
- modify or cancel actions, or to
- modify the input accepted by dispatch.

Most use cases fall into the first category: For example [Redux-Saga](https://github.com/redux-saga/redux-saga/), [redux-observable](https://github.com/redux-observable/redux-observable), and [RTK listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) all create side effects that react to actions. These examples also show that this is a very common need: To be able to react to an action other than with a state change.

Modifying actions can be used to e.g. enhance an action with information from the state or from an external input, or to throttle, debounce or gate them.

The most obvious example for modifying the input of dispatch is [Redux Thunk](https://github.com/reduxjs/redux-thunk), which transforms a function returning an action into an action by calling it.

## When to use custom middleware

Most of the time, you won't actually need custom middleware. The most likely use case for middleware is side effects, and there is plenty of packages who nicely package side effects for Redux and have been in use long enough to get rid of the subtle problems you would run into when building this yourself. A good starting point is [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for managing server-side state and [RTK listener middleware](https://redux-toolkit.js.org/api/createListenerMiddleware) for other side effects.

You might still want to use custom middleware in one of two cases:

1. If you only have a single, very simple side effect, it might not be worth it to add a full additional framework. Just make sure that you switch to an existing framework once your application grows instead of growing your own custom solution.
2. If you need to modify or cancel actions.

## Standard patterns for middleware

### Create side effects for actions

This is the most common middleware. Here's what it looks like for [rtk listener middleware](https://github.com/reduxjs/redux-toolkit/blob/0678c2e195a70c34cd26bddbfd29043bc36d1362/packages/toolkit/src/listenerMiddleware/index.ts#L427):

```ts
const middleware: ListenerMiddleware<S, D, ExtraArgument> =
  api => next => action => {
    if (addListener.match(action)) {
      return startListening(action.payload)
    }

    if (clearAllListeners.match(action)) {
      clearListenerMiddleware()
      return
    }

    if (removeListener.match(action)) {
      return stopListening(action.payload)
    }

    // Need to get this state _before_ the reducer processes the action
    let originalState: S | typeof INTERNAL_NIL_TOKEN = api.getState()

    // `getOriginalState` can only be called synchronously.
    // @see https://github.com/reduxjs/redux-toolkit/discussions/1648#discussioncomment-1932820
    const getOriginalState = (): S => {
      if (originalState === INTERNAL_NIL_TOKEN) {
        throw new Error(
          `${alm}: getOriginalState can only be called synchronously`
        )
      }

      return originalState as S
    }

    let result: unknown

    try {
      // Actually forward the action to the reducer before we handle listeners
      result = next(action)

      if (listenerMap.size > 0) {
        let currentState = api.getState()
        // Work around ESBuild+TS transpilation issue
        const listenerEntries = Array.from(listenerMap.values())
        for (let entry of listenerEntries) {
          let runListener = false

          try {
            runListener = entry.predicate(action, currentState, originalState)
          } catch (predicateError) {
            runListener = false

            safelyNotifyError(onError, predicateError, {
              raisedBy: 'predicate'
            })
          }

          if (!runListener) {
            continue
          }

          notifyListener(entry, action, api, getOriginalState)
        }
      }
    } finally {
      // Remove `originalState` store from this scope.
      originalState = INTERNAL_NIL_TOKEN
    }

    return result
  }
```

In the first part, it listens to `addListener`, `clearAllListeners` and `removeListener` actions to change which listeners should be invoked later on.

In the second part, the code mainly calculates the state after passing the action through the other middlewares and the reducer, and then passes both the original state as well as the new state coming from the reducer to the listeners.

It is common to have side effects after dispatching the action, because this allows taking into account both the original and the new state, and because the interaction coming from the side effects shouldn't influence the current action execution anyways (otherwise, it wouldn't be a side effect).

### Modify or cancel actions, or modify the input accepted by dispatch

While these patterns are less common, most of them (except for cancelling actions) are used by [redux thunk middleware](https://github.com/reduxjs/redux-thunk/blob/587a85b1d908e8b7cf2297bec6e15807d3b7dc62/src/index.ts#L22):

```ts
const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // The thunk middleware looks for any functions that were passed to `store.dispatch`.
    // If this "action" is really a function, call it and return the result.
    if (typeof action === 'function') {
      // Inject the store's `dispatch` and `getState` methods, as well as any "extra arg"
      return action(dispatch, getState, extraArgument)
    }

    // Otherwise, pass the action down the middleware chain as usual
    return next(action)
  }
```

Usually, `dispatch` can only handle JSON actions. This middleware adds the ability to also handle actions in the form of functions. It also changes the return type of the dispatch function itself by passing the return value of the function-action to be the return value of the dispatch function.

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
  if (action.type === 'some/action') {
    const data = await fetchData()
    api.dispatch(dataFetchedAction(data))
  }

  return response
}
```

Even though it looks like we didn't modify the response, we actually did: Due to async-await, it is now a promise. This will break some middlewares like the one from RTK Query.

So, how can we write this middleware instead?

```ts
const middleware: Middleware = api => next => action => {
  const response = next(action)

  // Do something after the action hits the reducer
  const afterState = api.getState()
  if (action.type === 'some/action') {
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
