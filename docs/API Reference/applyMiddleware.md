# `applyMiddleware(...middlewares)`

Middleware is the suggested way to extend Redux with custom functionality. Middleware lets you wrap the store’s [`dispatch`](Store.md#dispatch) method for fun and profit. The key feature of middleware is that it is composable. Multiple middleware can be combined together, where each middleware requires no knowledge of the what comes before or after it in the chain.

The most common use case for the middleware is to support asynchronous actions without much boilerplate code or a dependency on a library like [Rx](https://github.com/Reactive-Extensions/RxJS). For example, [redux-thunk](https://github.com/gaearon/redux-thunk) lets the action creators invert control by dispatching functions that receive [`dispatch`](Store.md#dispatch) as an argument and may call it asynchronously. Another example of middleware is [redux-promise](https://github.com/acdlite/redux-promise) that lets you dispatch a [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise), and dispatches a raw action itself when the Promise resolves.

Middleware is not baked into [`createStore`](createStore.md) and is not a fundamental part of the Redux architecture, but we consider it useful enough to be supported right in the core. This way, there is a single standard way to extend [`dispatch`](Store.md#dispatch) in the ecosystem, and different middleware may compete in expressiveness and utility.

What is `applyMiddleware`, then? It ought to be an extension mechanism more powerful than the middleware itself. Indeed, `applyMiddleware` is an example of the most poweful Redux extension mechanism called *store enhancers*. It is highly unlikely you’ll ever want to write a store enhancer yourself. Another example of a store enhancer is [redux-devtools](https://github.com/gaearon/redux-devtools). Middleware is less powerful than a store enhancer, but it is also much easier to write.

#### Arguments

* `...middlewares` (*Functions*): Functions that conform to the Redux *middleware API*. Each middleware receives [`Store`](Store.md)’s [`dispatch`](Store.md#dispatch) and [`getState`](Store.md#getState) functions as named arguments, and returns a function. That function will be given the `next` middleware’s dispatch method, and is expected to return a function of `action` calling `next(action)` with a potentially different argument, or at a different time, or maybe not calling it at all. The last middleware in chain will receive the real store’s [`dispatch`](Store.md#dispatch) method as the `next` parameter, thus closing the chain. So, the middleware signature is `({ getState, dispatch }) => next => action`.

#### Returns

(*Function*) A store enhancer that applies the given middleware. The store enhancer is a function that needs to be applied to `createStore`. It will return a different `createStore` which has the middleware enabled.

#### Example

```js
import { createStore, applyMiddleware } from 'redux';
import todos from './reducers';

// We can import some existing middleware.
import thunk from 'redux-thunk';

// Or we can write our custom logger middleware.
function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action);
    let result = next(action);
    console.log('state after dispatch', getState());
    return result;
  };
}

// applyMiddleware returns a function with the same signature as createStore.
let createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);

// We use it just like we’d use vanilla createStore.
let store = createStoreWithMiddleware(todos, ['Use Redux']);

store.dispatch({
  type: 'ADD_TODO',
  text: 'Understand the middleware'
});
// (These lines will be logged by the middleware:)
// will dispatch: { type: 'ADD_TODO', text: 'Understand the middleware' }
// state after dispatch: ['Use Redux', 'Understand the middleware']
```

#### Tips

* Middleware only wraps the store’s [`dispatch`](Store.md#dispatch) function. Technically, anything a middleware can do, you can do manually by wrapping every `dispatch` call, but it’s easier to manage this in a single place and define action transformations on the scale of the whole project.

* If you use other store enhancers in addition to `applyMiddleware`, make sure to put `applyMiddleware` before them in the composition chain because the middleware is potentially asynchronous. For example, it should go before [redux-devtools](https://github.com/gaearon/redux-devtools) because otherwise the DevTools won’t see the raw actions emitted by the Promise middleware and such.

* Middleware sounds much more complicated than it really is. The only way to really understand the middleware is to see how the existing middleware works, and try to write your own. The function nesting can be intimidating, but most of the middleware you’ll find are in fact 10-liners, and the nesting and composability is what makes the middleware system powerful.
