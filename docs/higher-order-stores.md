Higher-order stores
===================

A higher-order store is a function that turns a store creating function into a new store creating function:

```
createStore => createStore'
```

Look familiar? It's just like the signature for [middleware](middleware.md), only we're wrapping `createStore()` instead of `dispatch()`. Like middleware, the key feature of higher-order stores is that they are composable.

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

This design allows multiple higher-stores can be combined simply using function composition:

```js
const newCreateStore = compose(
  applyMiddleware(m1, m2, m3),
  devTools,
  createStore
);
```

Now just pass your reducer (and an initial state, if desired) to your new store creating function:

```js
const store = createStore(reducer, intialState);

<Provider store={store} />
```
