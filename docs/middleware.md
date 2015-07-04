# Middleware

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
