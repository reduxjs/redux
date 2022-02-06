import type {
  Reducer,
  ReducersMapObject,
  Middleware,
  Action,
  AnyAction,
  StoreEnhancer,
  Store,
  Dispatch,
  PreloadedState,
  CombinedState,
} from 'redux'
import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import type { EnhancerOptions as DevToolsOptions } from './devtoolsExtension'
import { composeWithDevTools } from './devtoolsExtension'

import isPlainObject from './isPlainObject'
import type {
  ThunkMiddlewareFor,
  CurriedGetDefaultMiddleware,
} from './getDefaultMiddleware'
import { curryGetDefaultMiddleware } from './getDefaultMiddleware'
import type { NoInfer, ExtractDispatchExtensions } from './tsHelpers'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/**
 * Callback function type, to be used in `ConfigureStoreOptions.enhancers`
 *
 * @public
 */
export type ConfigureEnhancersCallback = (
  defaultEnhancers: readonly StoreEnhancer[]
) => StoreEnhancer[]

/**
 * Options for `configureStore()`.
 *
 * @public
 */
export interface ConfigureStoreOptions<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
> {
  /**
   * A single reducer function that will be used as the root reducer, or an
   * object of slice reducers that will be passed to `combineReducers()`.
   */
  reducer: Reducer<S, A> | ReducersMapObject<S, A>

  /**
   * An array of Redux middleware to install. If not supplied, defaults to
   * the set of middleware returned by `getDefaultMiddleware()`.
   */
  middleware?: ((getDefaultMiddleware: CurriedGetDefaultMiddleware<S>) => M) | M

  /**
   * Whether to enable Redux DevTools integration. Defaults to `true`.
   *
   * Additional configuration can be done by passing Redux DevTools options
   */
  devTools?: boolean | DevToolsOptions

  /**
   * The initial state, same as Redux's createStore.
   * You may optionally specify it to hydrate the state
   * from the server in universal apps, or to restore a previously serialized
   * user session. If you use `combineReducers()` to produce the root reducer
   * function (either directly or indirectly by passing an object as `reducer`),
   * this must be an object with the same shape as the reducer map keys.
   */
  /* 
  Not 100% correct but the best approximation we can get:
  - if S is a `CombinedState` applying a second `CombinedState` on it does not change anything.
  - if it is not, there could be two cases:
    - `ReducersMapObject<S, A>` is being passed in. In this case, we will call `combineReducers` on it and `CombinedState<S>` is correct
    - `Reducer<S, A>` is being passed in. In this case, actually `CombinedState<S>` is wrong and `S` would be correct.
    As we cannot distinguish between those two cases without adding another generic paramter, 
    we just make the pragmatic assumption that the latter almost never happens.
  */
  preloadedState?: PreloadedState<CombinedState<NoInfer<S>>>

  /**
   * The store enhancers to apply. See Redux's `createStore()`.
   * All enhancers will be included before the DevTools Extension enhancer.
   * If you need to customize the order of enhancers, supply a callback
   * function that will receive the original array (ie, `[applyMiddleware]`),
   * and should return a new array (such as `[applyMiddleware, offline]`).
   * If you only need to add middleware, you can use the `middleware` parameter instead.
   */
  enhancers?: StoreEnhancer[] | ConfigureEnhancersCallback
}

type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>

/**
 * A Redux store returned by `configureStore()`. Supports dispatching
 * side-effectful _thunks_ in addition to plain actions.
 *
 * @public
 */
export interface EnhancedStore<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = Middlewares<S>
> extends Store<S, A> {
  /**
   * The `dispatch` method of your store, enhanced by all its middlewares.
   *
   * @inheritdoc
   */
  dispatch: ExtractDispatchExtensions<M> & Dispatch<A>
}

/**
 * A friendly abstraction over the standard Redux `createStore()` function.
 *
 * @param config The store configuration.
 * @returns A configured Redux store.
 *
 * @public
 */
export function configureStore<
  S = any,
  A extends Action = AnyAction,
  M extends Middlewares<S> = [ThunkMiddlewareFor<S>]
>(options: ConfigureStoreOptions<S, A, M>): EnhancedStore<S, A, M> {
  const curriedGetDefaultMiddleware = curryGetDefaultMiddleware<S>()

  const {
    reducer = undefined,
    middleware = curriedGetDefaultMiddleware(),
    devTools = true,
    preloadedState = undefined,
    enhancers = undefined,
  } = options || {}

  let rootReducer: Reducer<S, A>

  if (typeof reducer === 'function') {
    rootReducer = reducer
  } else if (isPlainObject(reducer)) {
    rootReducer = combineReducers(reducer)
  } else {
    throw new Error(
      '"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers'
    )
  }

  let finalMiddleware = middleware
  if (typeof finalMiddleware === 'function') {
    finalMiddleware = finalMiddleware(curriedGetDefaultMiddleware)

    if (!IS_PRODUCTION && !Array.isArray(finalMiddleware)) {
      throw new Error(
        'when using a middleware builder function, an array of middleware must be returned'
      )
    }
  }
  if (
    !IS_PRODUCTION &&
    finalMiddleware.some((item: any) => typeof item !== 'function')
  ) {
    throw new Error(
      'each middleware provided to configureStore must be a function'
    )
  }

  const middlewareEnhancer = applyMiddleware(...finalMiddleware)

  let finalCompose = compose

  if (devTools) {
    finalCompose = composeWithDevTools({
      // Enable capture of stack traces for dispatched Redux actions
      trace: !IS_PRODUCTION,
      ...(typeof devTools === 'object' && devTools),
    })
  }

  let storeEnhancers: StoreEnhancer[] = [middlewareEnhancer]

  if (Array.isArray(enhancers)) {
    storeEnhancers = [middlewareEnhancer, ...enhancers]
  } else if (typeof enhancers === 'function') {
    storeEnhancers = enhancers(storeEnhancers)
  }

  const composedEnhancer = finalCompose(...storeEnhancers) as any

  return createStore(rootReducer, preloadedState, composedEnhancer)
}
