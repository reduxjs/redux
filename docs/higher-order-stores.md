Higher-order stores
===================

A higher-order store is a function that turns a store creating function into a new store creating function:

```
createStore => createStore'
```

Look familiar? It's like the signature for [middleware](middleware.md), only we're wrapping `createStore()` instead of `dispatch()`. Like middleware, the key feature of higher-order stores is that they are composable.

Higher-order stores are much the same as higher-order components in React. They can be as simple as `applyMiddleware()`, or as powerful as the [Redux Devtools](https://github.com/gaearon/redux-devtools). There's no limit to the kinds of extensions you can create.

## How it works

Let's look at an example. As alluded to above, `applyMiddleware()` is an example of a higher-order store. You use it by wrapping the base `createStore()` function provided by Redux:

```js
const newCreateStore = applyMiddleware(m1, m2, m3)(createStore);
```

Internally, `applyMiddleware()` works by proxying the `dispatch()` method returned by `createStore()`:

```js
// Implementation has been simplified for the purpose of illustration
export default function applyMiddleware(...middlewares) {
  // ...combine middlewares...

  return next => (reducer, initialState) => {
    const store = next(reducer, initialState);
    return {
      ...store,
      dispatch: middleware(store.dispatch)
    };
  };
}
```

`next` is the next store creating function in the chain — either the return value of another higher-order store, or `createStore()` itself.

This design allows for multiple higher-order stores to be used together using function composition.

```js
const newCreateStore = compose(
  applyMiddleware(m1, m2, m3),
  devTools,
  createStore
);
```

Now just pass your reducer (and an initial state, if desired) to your new store creating function:

```js
const store = newCreateStore(reducer, intialState);

<Provider store={store} />
```

## Creating higher-order stores

The signature of a higher-order store looks like this:

## Middleware versus higher-order stores

Middleware and higher-order stores are conceptually similar. Both wrap around the store interface to modify its behavior in a composable way. The difference is that middleware is exclusively concerned with modifying the behavior of `dispatch()`, whereas higher-order stores can modify any part of the store interface.
