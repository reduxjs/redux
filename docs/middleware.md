Middleware
==========

A middleware in Redux is a function that turns a dispatching function into a new dispatching function:

```
dispatch => dispatch'
```

The key feature of middleware is that it is composable. Multiple middleware can be combined together, where each middleware requires no knowledge of the what comes before or after it in the chain.

Usage
=====

To enable middleware in your Redux app, use `applyMiddleware()`.

### `applyMiddleware(...middlewares)`

This function returns a [higher-order store](higher-order-stores.md). You don't need to worry about that if you're not interested — here's how you use it:

```js
const store = applyMiddleware(thunk, promise, observable)(createStore)(reducer);
```

Yes, you read that correctly. If this looks strange to you, it may help to break the process down into multiple steps:

```js
const newCreateStore = applyMiddleware(thunk, promise, observable)(createStore);
const store = newCreateStore(reducer);
```

If you 

How it works
============

```js
const newDispatch = thunk(promise(observable(dispatch)));
// Or
const newDispatch = compose(thunk, promise, observable, dispatch);
```

`compose` performs function composition. It is the same as `compose()` in underscore or lodash.

You can also use `composeMiddleware()`, which is similar to `compose()` except instead of creating a dispatching function, it creates a middleware function:

```js
const middleware = composeMiddleware(thunk, promise, observable);
const newDispatch = compose(middleware, dispatch);
// Or simply
const newDispatch = compose(dispatch);
```


A middleware is a function that wraps the `dispatch()` method, or another middleware. For example:

```js
// Instead of this
dispatch(action)
// do this
middleware(dispatch)(action)
```

Multiple middleware can be composed manually

```js
middleware1(middleware2(dispatch))(action)
```

Or using the provided `composeMiddleware()` utility:

```js
import { composeMiddleware } from 'redux';

// Equivalent:
middleware1(middleware2(dispatch))(action)
composeMiddleware(middleware1, middleware2, dispatch)(action)
```

`composeMiddleware` enables you to easily compose an array of middleware using spread notation:

```
composeMiddleware(...middlewares);
```

## Example of how to write middleware

Here's a middleware for adding naive promise support to Redux:

```js
function promiseMiddleware(next) {
  return action =>
    action && typeof action.then === 'function'
      ? action.then(next)
      : next(action);
}
```

Pretty simple, right? Since they're just higher-order functions, most middleware will be very concise and easy to read.

Note that `next` can be called as many times as needed, or not at all.

## Use cases

Often they'll be used like schedulers. They can be used to implement promise support (a la Flummox), observable support, generator support, whatever. Or they can be used for side-effects like logging.


## API

Because middleware simply wraps `dispatch()` to return a function of the same signature, you can use them from the call site without any extra set up. (For the same reason, middleware is actually compatible with any Flux library with a `dispatch()` method.)

However, for the most part, you'll want to configure middleware at the dispatcher level and apply them to every dispatch.

For now, we are treating middleware as an advanced feature. You'll have to forgo the `createRedux(stores)` shortcut and create a dispatcher using `createDispatcher()`, which has an optional second parameter for configuring middleware. You can pass an array of middleware:

```js
const dispatcher = createDispatcher(
  composeStores(stores),
  [promiseMiddleware, filterUndefined]
);
```

Or alternatively, you can pass a function that returns an array of middleware. The function accepts a single parameter, `getState()`, which enables the use of middleware that needs to access the current state on demand. For example, here's how the default dispatcher is created internally when you call `createRedux(stores)`:

```js
const dispatcher = createDispatcher(
  composeStores(stores),
  getState => [thunkMiddleware(getState)]
);
```

`thunkMiddleware` is an example of a higher-order function that returns a middleware.

After creating your dispatcher, pass it to `createRedux()`:

```js
const redux = createRedux(dispatcher);
```
