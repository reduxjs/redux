# Async Flow

Without [middleware](Middleware.md), Redux store only supports [synchronous data flow](../basics/DataFlow.md). This is what you get by default with [`createStore()`](../api/createStore.md).

You may enhance [`createStore()`](../api/createStore.md) with [`applyMiddleware()`](../api/applyMiddleware.md). It is not required, but it lets you [express asynchronous actions in a convenient way](AsyncActions.md).

Asynchronous middleware like [redux-thunk](https://github.com/gaearon/redux-thunk) or [redux-promise](https://github.com/acdlite/redux-promise) wraps the store’s [`dispatch()`](../api/Store.md#dispatch) method and allows you to dispatch something other than actions, for example, functions or Promises. Any middleware you use can then interpret anything you dispatch, and in turn, can pass actions to the next middleware in chain. For example, a Promise middleware can intercept Promises and dispatch a pair of begin/end actions asynchronously in response to each Promise.

When the last middleware in the chain dispatches an action, it has to be a plain object. This is when the [synchronous Redux data flow](../basics/DataFlow.md) takes place.

## Next Steps

Now you know everything about data flow in a Redux app! Check out [the source code for the async example](ExampleRedditAPI.md), or read on about [React Router integration](UsageWithReactRouter.md).