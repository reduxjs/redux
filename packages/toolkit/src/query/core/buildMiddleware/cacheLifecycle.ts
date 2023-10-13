import { isAsyncThunkAction, isFulfilled } from '@reduxjs/toolkit'
import type { AnyAction } from 'redux'
import type { ThunkDispatch } from 'redux-thunk'
import type { BaseQueryFn, BaseQueryMeta } from '../../baseQueryTypes'
import { DefinitionType } from '../../endpointDefinitions'
import type { RootState } from '../apiState'
import type {
  MutationResultSelectorResult,
  QueryResultSelectorResult,
} from '../buildSelectors'
import { getMutationCacheKey } from '../buildSlice'
import type { PatchCollection, Recipe } from '../buildThunks'
import type {
  ApiMiddlewareInternalHandler,
  InternalHandlerBuilder,
  PromiseWithKnownReason,
  SubMiddlewareApi,
} from './types'

export type ReferenceCacheLifecycle = never

declare module '../../endpointDefinitions' {
  export interface QueryBaseLifecycleApi<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ResultType,
    ReducerPath extends string = string
  > extends LifecycleApi<ReducerPath> {
    /**
     * Gets the current value of this cache entry.
     */
    getCacheEntry(): QueryResultSelectorResult<
      { type: DefinitionType.query } & BaseEndpointDefinition<
        QueryArg,
        BaseQuery,
        ResultType
      >
    >
    /**
     * Updates the current cache entry value.
     * For documentation see `api.util.updateQueryData`.
     */
    updateCachedData(updateRecipe: Recipe<ResultType>): PatchCollection
  }

  export interface MutationBaseLifecycleApi<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ResultType,
    ReducerPath extends string = string
  > extends LifecycleApi<ReducerPath> {
    /**
     * Gets the current value of this cache entry.
     */
    getCacheEntry(): MutationResultSelectorResult<
      { type: DefinitionType.mutation } & BaseEndpointDefinition<
        QueryArg,
        BaseQuery,
        ResultType
      >
    >
  }

  export interface LifecycleApi<ReducerPath extends string = string> {
    /**
     * The dispatch method for the store
     */
    dispatch: ThunkDispatch<any, any, AnyAction>
    /**
     * A method to get the current state
     */
    getState(): RootState<any, any, ReducerPath>
    /**
     * `extra` as provided as `thunk.extraArgument` to the `configureStore` `getDefaultMiddleware` option.
     */
    extra: unknown
    /**
     * A unique ID generated for the mutation
     */
    requestId: string
  }

  export interface CacheLifecyclePromises<
    ResultType = unknown,
    MetaType = unknown
  > {
    /**
     * Promise that will resolve with the first value for this cache key.
     * This allows you to `await` until an actual value is in cache.
     *
     * If the cache entry is removed from the cache before any value has ever
     * been resolved, this Promise will reject with
     * `new Error('Promise never resolved before cacheEntryRemoved.')`
     * to prevent memory leaks.
     * You can just re-throw that error (or not handle it at all) -
     * it will be caught outside of `cacheEntryAdded`.
     *
     * If you don't interact with this promise, it will not throw.
     */
    cacheDataLoaded: PromiseWithKnownReason<
      {
        /**
         * The (transformed) query result.
         */
        data: ResultType
        /**
         * The `meta` returned by the `baseQuery`
         */
        meta: MetaType
      },
      typeof neverResolvedError
    >
    /**
     * Promise that allows you to wait for the point in time when the cache entry
     * has been removed from the cache, by not being used/subscribed to any more
     * in the application for too long or by dispatching `api.util.resetApiState`.
     */
    cacheEntryRemoved: Promise<void>
  }

  export interface QueryCacheLifecycleApi<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ResultType,
    ReducerPath extends string = string
  > extends QueryBaseLifecycleApi<QueryArg, BaseQuery, ResultType, ReducerPath>,
      CacheLifecyclePromises<ResultType, BaseQueryMeta<BaseQuery>> {}

  export interface MutationCacheLifecycleApi<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ResultType,
    ReducerPath extends string = string
  > extends MutationBaseLifecycleApi<
        QueryArg,
        BaseQuery,
        ResultType,
        ReducerPath
      >,
      CacheLifecyclePromises<ResultType, BaseQueryMeta<BaseQuery>> {}

  interface QueryExtraOptions<
    TagTypes extends string,
    ResultType,
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ReducerPath extends string = string
  > {
    onCacheEntryAdded?(
      arg: QueryArg,
      api: QueryCacheLifecycleApi<QueryArg, BaseQuery, ResultType, ReducerPath>
    ): Promise<void> | void
  }

  interface MutationExtraOptions<
    TagTypes extends string,
    ResultType,
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ReducerPath extends string = string
  > {
    onCacheEntryAdded?(
      arg: QueryArg,
      api: MutationCacheLifecycleApi<
        QueryArg,
        BaseQuery,
        ResultType,
        ReducerPath
      >
    ): Promise<void> | void
  }
}

const neverResolvedError = new Error(
  'Promise never resolved before cacheEntryRemoved.'
) as Error & {
  message: 'Promise never resolved before cacheEntryRemoved.'
}

export const buildCacheLifecycleHandler: InternalHandlerBuilder = ({
  api,
  reducerPath,
  context,
  queryThunk,
  mutationThunk,
  internalState,
}) => {
  const isQueryThunk = isAsyncThunkAction(queryThunk)
  const isMutationThunk = isAsyncThunkAction(mutationThunk)
  const isFulfilledThunk = isFulfilled(queryThunk, mutationThunk)

  type CacheLifecycle = {
    valueResolved?(value: { data: unknown; meta: unknown }): unknown
    cacheEntryRemoved(): void
  }
  const lifecycleMap: Record<string, CacheLifecycle> = {}

  const handler: ApiMiddlewareInternalHandler = (
    action,
    mwApi,
    stateBefore
  ) => {
    const cacheKey = getCacheKey(action)

    if (queryThunk.pending.match(action)) {
      const oldState = stateBefore[reducerPath].queries[cacheKey]
      const state = mwApi.getState()[reducerPath].queries[cacheKey]
      if (!oldState && state) {
        handleNewKey(
          action.meta.arg.endpointName,
          action.meta.arg.originalArgs,
          cacheKey,
          mwApi,
          action.meta.requestId
        )
      }
    } else if (mutationThunk.pending.match(action)) {
      const state = mwApi.getState()[reducerPath].mutations[cacheKey]
      if (state) {
        handleNewKey(
          action.meta.arg.endpointName,
          action.meta.arg.originalArgs,
          cacheKey,
          mwApi,
          action.meta.requestId
        )
      }
    } else if (isFulfilledThunk(action)) {
      const lifecycle = lifecycleMap[cacheKey]
      if (lifecycle?.valueResolved) {
        lifecycle.valueResolved({
          data: action.payload,
          meta: action.meta.baseQueryMeta,
        })
        delete lifecycle.valueResolved
      }
    } else if (
      api.internalActions.removeQueryResult.match(action) ||
      api.internalActions.removeMutationResult.match(action)
    ) {
      const lifecycle = lifecycleMap[cacheKey]
      if (lifecycle) {
        delete lifecycleMap[cacheKey]
        lifecycle.cacheEntryRemoved()
      }
    } else if (api.util.resetApiState.match(action)) {
      for (const [cacheKey, lifecycle] of Object.entries(lifecycleMap)) {
        delete lifecycleMap[cacheKey]
        lifecycle.cacheEntryRemoved()
      }
    }
  }

  function getCacheKey(action: any) {
    if (isQueryThunk(action)) return action.meta.arg.queryCacheKey
    if (isMutationThunk(action)) return action.meta.requestId
    if (api.internalActions.removeQueryResult.match(action))
      return action.payload.queryCacheKey
    if (api.internalActions.removeMutationResult.match(action))
      return getMutationCacheKey(action.payload)
    return ''
  }

  function handleNewKey(
    endpointName: string,
    originalArgs: any,
    queryCacheKey: string,
    mwApi: SubMiddlewareApi,
    requestId: string
  ) {
    const endpointDefinition = context.endpointDefinitions[endpointName]
    const onCacheEntryAdded = endpointDefinition?.onCacheEntryAdded
    if (!onCacheEntryAdded) return

    let lifecycle = {} as CacheLifecycle

    const cacheEntryRemoved = new Promise<void>((resolve) => {
      lifecycle.cacheEntryRemoved = resolve
    })
    const cacheDataLoaded: PromiseWithKnownReason<
      { data: unknown; meta: unknown },
      typeof neverResolvedError
    > = Promise.race([
      new Promise<{ data: unknown; meta: unknown }>((resolve) => {
        lifecycle.valueResolved = resolve
      }),
      cacheEntryRemoved.then(() => {
        throw neverResolvedError
      }),
    ])
    // prevent uncaught promise rejections from happening.
    // if the original promise is used in any way, that will create a new promise that will throw again
    cacheDataLoaded.catch(() => {})
    lifecycleMap[queryCacheKey] = lifecycle
    const selector = (api.endpoints[endpointName] as any).select(
      endpointDefinition.type === DefinitionType.query
        ? originalArgs
        : queryCacheKey
    )

    const extra = mwApi.dispatch((_, __, extra) => extra)
    const lifecycleApi = {
      ...mwApi,
      getCacheEntry: () => selector(mwApi.getState()),
      requestId,
      extra,
      updateCachedData: (endpointDefinition.type === DefinitionType.query
        ? (updateRecipe: Recipe<any>) =>
            mwApi.dispatch(
              api.util.updateQueryData(
                endpointName as never,
                originalArgs,
                updateRecipe
              )
            )
        : undefined) as any,

      cacheDataLoaded,
      cacheEntryRemoved,
    }

    const runningHandler = onCacheEntryAdded(originalArgs, lifecycleApi)
    // if a `neverResolvedError` was thrown, but not handled in the running handler, do not let it leak out further
    Promise.resolve(runningHandler).catch((e) => {
      if (e === neverResolvedError) return
      throw e
    })
  }

  return handler
}
