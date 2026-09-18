---
id: utils
title: Additional Utilities
hide_title: true
description: 'API > utils: Additional utility functions'
---

&nbsp;

# Utility Functions

The Redux core exports additional utility functions for reuse.

## `isAction`

Returns true if the parameter is a valid Redux action object (a plain object with a string `type` field).

This also serves as a TypeScript type predicate, which will narrow the TS type to `Action<string>`.

This is mainly useful inside middleware, where the incoming `action` value is typed as `unknown` because it might be a thunk function or some other non-object value:

```ts
import { isAction } from 'redux'
import type { Middleware } from 'redux'

const loggerMiddleware: Middleware = store => next => action => {
  if (isAction(action)) {
    // `action` is now typed as `Action<string>`
    console.log('dispatching', action.type)
  }
  return next(action)
}
```

## `isPlainObject`

Returns true if the value appears to be a plain JS object.
