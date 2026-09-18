---
id: compose
title: compose
hide_title: true
description: 'API > compose: composing multiple functions together'
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

&nbsp;

# `compose(...functions)`

## Overview

Composes functions from right to left.

This is a functional programming utility, and is included in Redux as a convenience.
You might want to use it to apply several [store enhancers](../understanding/thinking-in-redux/Glossary.md#store-enhancer) in a row. `compose` is also usable as a general-purpose standalone method.

<CoreApiNote />

You shouldn't have to call `compose` directly. `configureStore` sets up the standard `applyMiddleware` and Redux DevTools store enhancers, and offers an `enhancers` callback for adding more.

## Arguments

1. (_arguments_): The functions to compose. Each function is expected to accept a single parameter. Its return value will be provided as an argument to the function standing to the left, and so on. The exception is the right-most argument which can accept multiple parameters, as it will provide the signature for the resulting composed function.

### Returns

(_Function_): The final function obtained by composing the given functions from right to left.

## Example

This example demonstrates how to use `compose` to enhance a [store](Store.md) with [`applyMiddleware`](applyMiddleware.md) and a second store enhancer. The enhancers are applied from right to left, so `applyMiddleware` wraps the store that `persistEnhancer` produced.

```js
import { createStore, applyMiddleware, compose } from 'redux'
import { thunk } from 'redux-thunk'
import { persistEnhancer } from './enhancers/persist'
import reducer from '../reducers'

const store = createStore(
  reducer,
  compose(applyMiddleware(thunk), persistEnhancer)
)
```

## Tips

- All `compose` does is let you write deeply nested function transformations without the rightward drift of the code. Don't give it too much credit!
