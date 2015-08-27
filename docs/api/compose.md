# `compose(...functions)`

Composes functions from left to right.

This is a functional programming utility, and is included in Redux as a convenience.  
You might want to use it to apply several [store enhancers](../Glossary.md#store-enhancer) in a row.

#### Arguments

1. (*arguments*): The functions to compose. Each function is expected to accept a function as an argument and to return a function.

#### Returns

(*Function*): The final function obtained by composing the given functions from left to right.

#### Example

This example demonstrates how to use `compose` to enhance a [store](Store.md) with [`applyMiddleware`](applyMiddleware.md) and a few developer tools from the [redux-devtools](https://github.com/gaearon/redux-devtools) package.

```js
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from '../reducers/index';

let reducer = combineReducers(reducers);
let middleware = [thunk];

let finalCreateStore;

// In production, we want to use just the middleware.
// In development, we want to use some store enhancers from redux-devtools.
// UglifyJS will eliminate the dead code depending on the build environment.

if (process.env.NODE_ENV === 'production') {
  finalCreateStore = applyMiddleware(...middleware)(createStore);
} else {
  finalCreateStore = compose(
    applyMiddleware(...middleware),
    require('redux-devtools').devTools(),
    require('redux-devtools').persistState(
      window.location.href.match(/[?&]debug_session=([^&]+)\b/)
    ),
    createStore
  );

  // Same code without the compose helper:
  //
  // finalCreateStore =
  //   applyMiddleware(middleware)(
  //     devTools()(
  //       persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))(
  //         createStore
  //       )
  //     )
  //   );
}

let store = finalCreateStore(reducer);
```

#### Tips

* All `compose` does is let you write deeply nested function transformations without the rightward drift of the code. Don’t give it too much credit!
