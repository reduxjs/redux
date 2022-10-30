import type {
  EndpointDefinitions,
  QueryDefinition,
  MutationDefinition,
  QueryArgFrom,
  ResultTypeFrom,
} from '../endpointDefinitions'
import { DefinitionType, isQueryDefinition } from '../endpointDefinitions'
import type { QueryThunk, MutationThunk, QueryThunkArg } from './buildThunks'
import type { AnyAction, ThunkAction, SerializedError } from '@reduxjs/toolkit'
import type { SubscriptionOptions, RootState } from './apiState'
import type { InternalSerializeQueryArgs } from '../defaultSerializeQueryArgs'
import type { Api, ApiContext } from '../apiTypes'
import type { ApiEndpointQuery } from './module'
import type { BaseQueryError, QueryReturnValue } from '../baseQueryTypes'
import type { QueryResultSelectorResult } from './buildSelectors'
import type { Dispatch } from 'redux'
import { isNotNullish } from '../utils/isNotNullish'

declare module './module' {
  export interface ApiEndpointQuery<
    Definition extends QueryDefinition<any, any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Definitions extends EndpointDefinitions
  > {
    initiate: StartQueryActionCreator<Definition>
  }

  export interface ApiEndpointMutation<
    Definition extends MutationDefinition<any, any, any, any, any>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Definitions extends EndpointDefinitions
  > {
    initiate: StartMutationActionCreator<Definition>
  }
}

export const forceQueryFnSymbol = Symbol('forceQueryFn')
export const isUpsertQuery = (arg: QueryThunkArg) =>
  typeof arg[forceQueryFnSymbol] === 'function'

export interface StartQueryActionCreatorOptions {
  subscribe?: boolean
  forceRefetch?: boolean | number
  subscriptionOptions?: SubscriptionOptions
  [forceQueryFnSymbol]?: () => QueryReturnValue
}

type StartQueryActionCreator<
  D extends QueryDefinition<any, any, any, any, any>
> = (
  arg: QueryArgFrom<D>,
  options?: StartQueryActionCreatorOptions
) => ThunkAction<QueryActionCreatorResult<D>, any, any, AnyAction>

export type QueryActionCreatorResult<
  D extends QueryDefinition<any, any, any, any>
> = Promise<QueryResultSelectorResult<D>> & {
  arg: QueryArgFrom<D>
  requestId: string
  subscriptionOptions: SubscriptionOptions | undefined
  abort(): void
  unwrap(): Promise<ResultTypeFrom<D>>
  unsubscribe(): void
  refetch(): QueryActionCreatorResult<D>
  updateSubscriptionOptions(options: SubscriptionOptions): void
  queryCacheKey: string
}

type StartMutationActionCreator<
  D extends MutationDefinition<any, any, any, any>
> = (
  arg: QueryArgFrom<D>,
  options?: {
    /**
     * If this mutation should be tracked in the store.
     * If you just want to manually trigger this mutation using `dispatch` and don't care about the
     * result, state & potential errors being held in store, you can set this to false.
     * (defaults to `true`)
     */
    track?: boolean
    fixedCacheKey?: string
  }
) => ThunkAction<MutationActionCreatorResult<D>, any, any, AnyAction>

export type MutationActionCreatorResult<
  D extends MutationDefinition<any, any, any, any>
> = Promise<
  | { data: ResultTypeFrom<D> }
  | {
      error:
        | Exclude<
            BaseQueryError<
              D extends MutationDefinition<any, infer BaseQuery, any, any>
                ? BaseQuery
                : never
            >,
            undefined
          >
        | SerializedError
    }
> & {
  /** @internal */
  arg: {
    /**
     * The name of the given endpoint for the mutation
     */
    endpointName: string
    /**
     * The original arguments supplied to the mutation call
     */
    originalArgs: QueryArgFrom<D>
    /**
     * Whether the mutation is being tracked in the store.
     */
    track?: boolean
    fixedCacheKey?: string
  }
  /**
   * A unique string generated for the request sequence
   */
  requestId: string

  /**
   * A method to cancel the mutation promise. Note that this is not intended to prevent the mutation
   * that was fired off from reaching the server, but only to assist in handling the response.
   *
   * Calling `abort()` prior to the promise resolving will force it to reach the error state with
   * the serialized error:
   * `{ name: 'AbortError', message: 'Aborted' }`
   *
   * @example
   * ```ts
   * const [updateUser] = useUpdateUserMutation();
   *
   * useEffect(() => {
   *   const promise = updateUser(id);
   *   promise
   *     .unwrap()
   *     .catch((err) => {
   *       if (err.name === 'AbortError') return;
   *       // else handle the unexpected error
   *     })
   *
   *   return () => {
   *     promise.abort();
   *   }
   * }, [id, updateUser])
   * ```
   */
  abort(): void
  /**
   * Unwraps a mutation call to provide the raw response/error.
   *
   * @remarks
   * If you need to access the error or success payload immediately after a mutation, you can chain .unwrap().
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap"
   * addPost({ id: 1, name: 'Example' })
   *   .unwrap()
   *   .then((payload) => console.log('fulfilled', payload))
   *   .catch((error) => console.error('rejected', error));
   * ```
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * try {
   *   const payload = await addPost({ id: 1, name: 'Example' }).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   */
  unwrap(): Promise<ResultTypeFrom<D>>
  /**
   * A method to manually unsubscribe from the mutation call, meaning it will be removed from cache after the usual caching grace period.
   The value returned by the hook will reset to `isUninitialized` afterwards.
   */
  reset(): void
  /** @deprecated has been renamed to `reset` */
  unsubscribe(): void
}

export function buildInitiate({
  serializeQueryArgs,
  queryThunk,
  mutationThunk,
  api,
  context,
}: {
  serializeQueryArgs: InternalSerializeQueryArgs
  queryThunk: QueryThunk
  mutationThunk: MutationThunk
  api: Api<any, EndpointDefinitions, any, any>
  context: ApiContext<EndpointDefinitions>
}) {
  const runningQueries: Map<
    Dispatch,
    Record<string, QueryActionCreatorResult<any> | undefined>
  > = new Map()
  const runningMutations: Map<
    Dispatch,
    Record<string, MutationActionCreatorResult<any> | undefined>
  > = new Map()

  const {
    unsubscribeQueryResult,
    removeMutationResult,
    updateSubscriptionOptions,
  } = api.internalActions
  return {
    buildInitiateQuery,
    buildInitiateMutation,
    getRunningQueryThunk,
    getRunningMutationThunk,
    getRunningQueriesThunk,
    getRunningMutationsThunk,
    getRunningOperationPromises,
    removalWarning,
  }

  /** @deprecated to be removed in 2.0 */
  function removalWarning(): never {
    throw new Error(
      `This method had to be removed due to a conceptual bug in RTK.
       Please see https://github.com/reduxjs/redux-toolkit/pull/2481 for details.
       See https://redux-toolkit.js.org/rtk-query/usage/server-side-rendering for new guidance on SSR.`
    )
  }

  /** @deprecated to be removed in 2.0 */
  function getRunningOperationPromises() {
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      removalWarning()
    } else {
      const extract = <T>(
        v: Map<Dispatch<AnyAction>, Record<string, T | undefined>>
      ) =>
        Array.from(v.values()).flatMap((queriesForStore) =>
          queriesForStore ? Object.values(queriesForStore) : []
        )
      return [...extract(runningQueries), ...extract(runningMutations)].filter(
        isNotNullish
      )
    }
  }

  function getRunningQueryThunk(endpointName: string, queryArgs: any) {
    return (dispatch: Dispatch) => {
      const endpointDefinition = context.endpointDefinitions[endpointName]
      const queryCacheKey = serializeQueryArgs({
        queryArgs,
        endpointDefinition,
        endpointName,
      })
      return runningQueries.get(dispatch)?.[queryCacheKey] as
        | QueryActionCreatorResult<never>
        | undefined
    }
  }

  function getRunningMutationThunk(
    /**
     * this is only here to allow TS to infer the result type by input value
     * we could use it to validate the result, but it's probably not necessary
     */
    _endpointName: string,
    fixedCacheKeyOrRequestId: string
  ) {
    return (dispatch: Dispatch) => {
      return runningMutations.get(dispatch)?.[fixedCacheKeyOrRequestId] as
        | MutationActionCreatorResult<never>
        | undefined
    }
  }

  function getRunningQueriesThunk() {
    return (dispatch: Dispatch) =>
      Object.values(runningQueries.get(dispatch) || {}).filter(isNotNullish)
  }

  function getRunningMutationsThunk() {
    return (dispatch: Dispatch) =>
      Object.values(runningMutations.get(dispatch) || {}).filter(isNotNullish)
  }

  function middlewareWarning(dispatch: Dispatch) {
    if (process.env.NODE_ENV !== 'production') {
      if ((middlewareWarning as any).triggered) return
      const registered:
        | ReturnType<typeof api.internalActions.internal_probeSubscription>
        | boolean = dispatch(
        api.internalActions.internal_probeSubscription({
          queryCacheKey: 'DOES_NOT_EXIST',
          requestId: 'DUMMY_REQUEST_ID',
        })
      )

      ;(middlewareWarning as any).triggered = true

      // The RTKQ middleware _should_ always return a boolean for `probeSubscription`
      if (typeof registered !== 'boolean') {
        // Otherwise, must not have been added
        throw new Error(
          `Warning: Middleware for RTK-Query API at reducerPath "${api.reducerPath}" has not been added to the store.
You must add the middleware for RTK-Query to function correctly!`
        )
      }
    }
  }

  function buildInitiateQuery(
    endpointName: string,
    endpointDefinition: QueryDefinition<any, any, any, any>
  ) {
    const queryAction: StartQueryActionCreator<any> =
      (
        arg,
        {
          subscribe = true,
          forceRefetch,
          subscriptionOptions,
          [forceQueryFnSymbol]: forceQueryFn,
        } = {}
      ) =>
      (dispatch, getState) => {
        const queryCacheKey = serializeQueryArgs({
          queryArgs: arg,
          endpointDefinition,
          endpointName,
        })

        const thunk = queryThunk({
          type: 'query',
          subscribe,
          forceRefetch: forceRefetch,
          subscriptionOptions,
          endpointName,
          originalArgs: arg,
          queryCacheKey,
          [forceQueryFnSymbol]: forceQueryFn,
        })
        const selector = (
          api.endpoints[endpointName] as ApiEndpointQuery<any, any>
        ).select(arg)

        const thunkResult = dispatch(thunk)
        const stateAfter = selector(getState())

        middlewareWarning(dispatch)

        const { requestId, abort } = thunkResult

        const skippedSynchronously = stateAfter.requestId !== requestId

        const runningQuery = runningQueries.get(dispatch)?.[queryCacheKey]
        const selectFromState = () => selector(getState())

        const statePromise: QueryActionCreatorResult<any> = Object.assign(
          forceQueryFn
            ? // a query has been forced (upsertQueryData)
              // -> we want to resolve it once data has been written with the data that will be written
              thunkResult.then(selectFromState)
            : skippedSynchronously && !runningQuery
            ? // a query has been skipped due to a condition and we do not have any currently running query
              // -> we want to resolve it immediately with the current data
              Promise.resolve(stateAfter)
            : // query just started or one is already in flight
              // -> wait for the running query, then resolve with data from after that
              Promise.all([runningQuery, thunkResult]).then(selectFromState),
          {
            arg,
            requestId,
            subscriptionOptions,
            queryCacheKey,
            abort,
            async unwrap() {
              const result = await statePromise

              if (result.isError) {
                throw result.error
              }

              return result.data
            },
            refetch: () =>
              dispatch(
                queryAction(arg, { subscribe: false, forceRefetch: true })
              ),
            unsubscribe() {
              if (subscribe)
                dispatch(
                  unsubscribeQueryResult({
                    queryCacheKey,
                    requestId,
                  })
                )
            },
            updateSubscriptionOptions(options: SubscriptionOptions) {
              statePromise.subscriptionOptions = options
              dispatch(
                updateSubscriptionOptions({
                  endpointName,
                  requestId,
                  queryCacheKey,
                  options,
                })
              )
            },
          }
        )

        if (!runningQuery && !skippedSynchronously && !forceQueryFn) {
          const running = runningQueries.get(dispatch) || {}
          running[queryCacheKey] = statePromise
          runningQueries.set(dispatch, running)

          statePromise.then(() => {
            delete running[queryCacheKey]
            if (!Object.keys(running).length) {
              runningQueries.delete(dispatch)
            }
          })
        }

        return statePromise
      }
    return queryAction
  }

  function buildInitiateMutation(
    endpointName: string
  ): StartMutationActionCreator<any> {
    return (arg, { track = true, fixedCacheKey } = {}) =>
      (dispatch, getState) => {
        const thunk = mutationThunk({
          type: 'mutation',
          endpointName,
          originalArgs: arg,
          track,
          fixedCacheKey,
        })
        const thunkResult = dispatch(thunk)
        middlewareWarning(dispatch)
        const { requestId, abort, unwrap } = thunkResult
        const returnValuePromise = thunkResult
          .unwrap()
          .then((data) => ({ data }))
          .catch((error) => ({ error }))

        const reset = () => {
          dispatch(removeMutationResult({ requestId, fixedCacheKey }))
        }

        const ret = Object.assign(returnValuePromise, {
          arg: thunkResult.arg,
          requestId,
          abort,
          unwrap,
          unsubscribe: reset,
          reset,
        })

        const running = runningMutations.get(dispatch) || {}
        runningMutations.set(dispatch, running)
        running[requestId] = ret
        ret.then(() => {
          delete running[requestId]
          if (!Object.keys(running).length) {
            runningMutations.delete(dispatch)
          }
        })
        if (fixedCacheKey) {
          running[fixedCacheKey] = ret
          ret.then(() => {
            if (running[fixedCacheKey] === ret) {
              delete running[fixedCacheKey]
              if (!Object.keys(running).length) {
                runningMutations.delete(dispatch)
              }
            }
          })
        }

        return ret
      }
  }
}
