import type { Middleware, AnyAction } from 'redux'
import type { ThunkMiddleware } from 'redux-thunk'
import thunkMiddleware from 'redux-thunk'
import type { ActionCreatorInvariantMiddlewareOptions } from './actionCreatorInvariantMiddleware'
import { createActionCreatorInvariantMiddleware } from './actionCreatorInvariantMiddleware'
import type { ImmutableStateInvariantMiddlewareOptions } from './immutableStateInvariantMiddleware'
/* PROD_START_REMOVE_UMD */
import { createImmutableStateInvariantMiddleware } from './immutableStateInvariantMiddleware'
/* PROD_STOP_REMOVE_UMD */

import type { SerializableStateInvariantMiddlewareOptions } from './serializableStateInvariantMiddleware'
import { createSerializableStateInvariantMiddleware } from './serializableStateInvariantMiddleware'
import type { ExcludeFromTuple } from './tsHelpers'
import { MiddlewareArray } from './utils'

function isBoolean(x: any): x is boolean {
  return typeof x === 'boolean'
}

interface ThunkOptions<E = any> {
  extraArgument: E
}

interface GetDefaultMiddlewareOptions {
  thunk?: boolean | ThunkOptions
  immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions
  serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions
  actionCreatorCheck?: boolean | ActionCreatorInvariantMiddlewareOptions
}

export type ThunkMiddlewareFor<
  S,
  O extends GetDefaultMiddlewareOptions = {}
> = O extends {
  thunk: false
}
  ? never
  : O extends { thunk: { extraArgument: infer E } }
  ? ThunkMiddleware<S, AnyAction, E>
  : ThunkMiddleware<S, AnyAction>

export type CurriedGetDefaultMiddleware<S = any> = <
  O extends Partial<GetDefaultMiddlewareOptions> = {
    thunk: true
    immutableCheck: true
    serializableCheck: true
    actionCreatorCheck: true
  }
>(
  options?: O
) => MiddlewareArray<ExcludeFromTuple<[ThunkMiddlewareFor<S, O>], never>>

export function curryGetDefaultMiddleware<
  S = any
>(): CurriedGetDefaultMiddleware<S> {
  return function curriedGetDefaultMiddleware(options) {
    return getDefaultMiddleware(options)
  }
}

/**
 * Returns any array containing the default middleware installed by
 * `configureStore()`. Useful if you want to configure your store with a custom
 * `middleware` array but still keep the default set.
 *
 * @return The default middleware used by `configureStore()`.
 *
 * @public
 *
 * @deprecated Prefer to use the callback notation for the `middleware` option in `configureStore`
 * to access a pre-typed `getDefaultMiddleware` instead.
 */
export function getDefaultMiddleware<
  S = any,
  O extends Partial<GetDefaultMiddlewareOptions> = {
    thunk: true
    immutableCheck: true
    serializableCheck: true
    actionCreatorCheck: true
  }
>(
  options: O = {} as O
): MiddlewareArray<ExcludeFromTuple<[ThunkMiddlewareFor<S, O>], never>> {
  const {
    thunk = true,
    immutableCheck = true,
    serializableCheck = true,
    actionCreatorCheck = true,
  } = options

  let middlewareArray = new MiddlewareArray<Middleware[]>()

  if (thunk) {
    if (isBoolean(thunk)) {
      middlewareArray.push(thunkMiddleware)
    } else {
      middlewareArray.push(
        thunkMiddleware.withExtraArgument(thunk.extraArgument)
      )
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    if (immutableCheck) {
      /* PROD_START_REMOVE_UMD */
      let immutableOptions: ImmutableStateInvariantMiddlewareOptions = {}

      if (!isBoolean(immutableCheck)) {
        immutableOptions = immutableCheck
      }

      middlewareArray.unshift(
        createImmutableStateInvariantMiddleware(immutableOptions)
      )
      /* PROD_STOP_REMOVE_UMD */
    }

    if (serializableCheck) {
      let serializableOptions: SerializableStateInvariantMiddlewareOptions = {}

      if (!isBoolean(serializableCheck)) {
        serializableOptions = serializableCheck
      }

      middlewareArray.push(
        createSerializableStateInvariantMiddleware(serializableOptions)
      )
    }
    if (actionCreatorCheck) {
      let actionCreatorOptions: ActionCreatorInvariantMiddlewareOptions = {}

      if (!isBoolean(actionCreatorCheck)) {
        actionCreatorOptions = actionCreatorCheck
      }

      middlewareArray.unshift(
        createActionCreatorInvariantMiddleware(actionCreatorOptions)
      )
    }
  }

  return middlewareArray as any
}
