---
id: compose
title: compose
sidebar_label: compose
hide_title: true
---

# `compose(...functions)`

Composes functions from right to left.

This is a functional programming utility, and is included in Redux as a convenience.  
You might want to use it to apply several [store enhancers](../Glossary.md#store-enhancer) in a row.

#### Arguments

1. (_arguments_): The functions to compose. Each function is expected to accept a single parameter. Its return value will be provided as an argument to the function standing to the left, and so on. The exception is the right-most argument which can accept multiple parameters, as it will provide the signature for the resulting composed function.

#### Returns

(_Function_): The final function obtained by composing the given functions from right to left.

#### Example

This example demonstrates how to use `compose` to enhance a [store](Store.md) with [`applyMiddleware`](applyMiddleware.md) and a few developer tools from the [redux-devtools](https://github.com/reduxjs/redux-devtools) package.

```js
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import DevTools from './containers/DevTools'
import reducer from '../reducers'

const store = createStore(
  reducer,
  compose(
    applyMiddleware(thunk),
    DevTools.instrument()
  )
)
```

#### Tips

- All `compose` does is let you write deeply nested function transformations without the rightward drift of the code. Don't give it too much credit!
