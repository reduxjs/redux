import type { AnyAction, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import type { Selector } from '@reduxjs/toolkit'
import type { DependencyList } from 'react'
import {
  useCallback,
  useDebugValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { QueryStatus, skipToken } from '@reduxjs/toolkit/query'
import type {
  QuerySubState,
  SubscriptionOptions,
  QueryKeys,
  RootState,
} from '@reduxjs/toolkit/dist/query/core/apiState'
import type {
  EndpointDefinitions,
  MutationDefinition,
  QueryDefinition,
  QueryArgFrom,
  ResultTypeFrom,
} from '@reduxjs/toolkit/dist/query/endpointDefinitions'
import type {
  QueryResultSelectorResult,
  MutationResultSelectorResult,
  SkipToken,
} from '@reduxjs/toolkit/dist/query/core/buildSelectors'
import type {
  QueryActionCreatorResult,
  MutationActionCreatorResult,
} from '@reduxjs/toolkit/dist/query/core/buildInitiate'
import type { SerializeQueryArgs } from '@reduxjs/toolkit/dist/query/defaultSerializeQueryArgs'
import { shallowEqual } from 'react-redux'
import type { Api, ApiContext } from '@reduxjs/toolkit/dist/query/apiTypes'
import type {
  Id,
  NoInfer,
  Override,
} from '@reduxjs/toolkit/dist/query/tsHelpers'
import type {
  ApiEndpointMutation,
  ApiEndpointQuery,
  CoreModule,
  PrefetchOptions,
} from '@reduxjs/toolkit/dist/query/core/module'
import type { ReactHooksModuleOptions } from './module'
import { useStableQueryArgs } from './useSerializedStableValue'
import type { UninitializedValue } from './constants'
import { UNINITIALIZED_VALUE } from './constants'
import { useShallowStableValue } from './useShallowStableValue'
import type { BaseQueryFn } from '../baseQueryTypes'
import { defaultSerializeQueryArgs } from '../defaultSerializeQueryArgs'

// Copy-pasted from React-Redux
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  !!window.document &&
  !!window.document.createElement
    ? useLayoutEffect
    : useEffect

export interface QueryHooks<
  Definition extends QueryDefinition<any, any, any, any, any>
> {
  useQuery: UseQuery<Definition>
  useLazyQuery: UseLazyQuery<Definition>
  useQuerySubscription: UseQuerySubscription<Definition>
  useLazyQuerySubscription: UseLazyQuerySubscription<Definition>
  useQueryState: UseQueryState<Definition>
}

export interface MutationHooks<
  Definition extends MutationDefinition<any, any, any, any, any>
> {
  useMutation: UseMutation<Definition>
}

/**
 * A React hook that automatically triggers fetches of data from an endpoint, 'subscribes' the component to the cached data, and reads the request status and cached data from the Redux store. The component will re-render as the loading status changes and the data becomes available.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the data if it does not exist in the cache already, and the hook will return the data for that query arg once it's available.
 *
 * This hook combines the functionality of both [`useQueryState`](#usequerystate) and [`useQuerySubscription`](#usequerysubscription) together, and is intended to be used in the majority of situations.
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether cached data exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>
>(
  arg: QueryArgFrom<D> | SkipToken,
  options?: UseQuerySubscriptionOptions & UseQueryStateOptions<D, R>
) => UseQueryHookResult<D, R>

export type UseQueryHookResult<
  D extends QueryDefinition<any, any, any, any>,
  R = UseQueryStateDefaultResult<D>
> = UseQueryStateResult<D, R> & UseQuerySubscriptionResult<D>

/**
 * Helper type to manually type the result
 * of the `useQuery` hook in userland code.
 */
export type TypedUseQueryHookResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<
    QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
  >
> = TypedUseQueryStateResult<ResultType, QueryArg, BaseQuery, R> &
  TypedUseQuerySubscriptionResult<ResultType, QueryArg, BaseQuery>

interface UseQuerySubscriptionOptions extends SubscriptionOptions {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When `skip` is true (or `skipToken` is passed in as `arg`):
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```tsx
   * // codeblock-meta title="Skip example"
   * const Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
   *   const { data, error, status } = useGetPokemonByNameQuery(name, {
   *     skip,
   *   });
   *
   *   return (
   *     <div>
   *       {name} - {status}
   *     </div>
   *   );
   * };
   * ```
   */
  skip?: boolean
  /**
   * Defaults to `false`. This setting allows you to control whether if a cached result is already available, RTK Query will only serve a cached result, or if it should `refetch` when set to `true` or if an adequate amount of time has passed since the last successful query result.
   * - `false` - Will not cause a query to be performed _unless_ it does not exist yet.
   * - `true` - Will always refetch when a new subscriber to a query is added. Behaves the same as calling the `refetch` callback or passing `forceRefetch: true` in the action creator.
   * - `number` - **Value is in seconds**. If a number is provided and there is an existing query in the cache, it will compare the current time vs the last fulfilled timestamp, and only refetch if enough time has elapsed.
   *
   * If you specify this option alongside `skip: true`, this **will not be evaluated** until `skip` is false.
   */
  refetchOnMountOrArgChange?: boolean | number
}

/**
 * A React hook that automatically triggers fetches of data from an endpoint, and 'subscribes' the component to the cached data.
 *
 * The query arg is used as a cache key. Changing the query arg will tell the hook to re-fetch the data if it does not exist in the cache already.
 *
 * Note that this hook does not return a request status or cached data. For that use-case, see [`useQuery`](#usequery) or [`useQueryState`](#usequerystate).
 *
 * #### Features
 *
 * - Automatically triggers requests to retrieve data based on the hook argument and whether cached data exists by default
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met
 */
export type UseQuerySubscription<
  D extends QueryDefinition<any, any, any, any>
> = (
  arg: QueryArgFrom<D> | SkipToken,
  options?: UseQuerySubscriptionOptions
) => UseQuerySubscriptionResult<D>

export type UseQuerySubscriptionResult<
  D extends QueryDefinition<any, any, any, any>
> = Pick<QueryActionCreatorResult<D>, 'refetch'>

/**
 * Helper type to manually type the result
 * of the `useQuerySubscription` hook in userland code.
 */
export type TypedUseQuerySubscriptionResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn
> = UseQuerySubscriptionResult<
  QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
>

export type UseLazyQueryLastPromiseInfo<
  D extends QueryDefinition<any, any, any, any>
> = {
  lastArg: QueryArgFrom<D>
}

/**
 * A React hook similar to [`useQuery`](#usequery), but with manual control over when the data fetching occurs.
 *
 * This hook includes the functionality of [`useLazyQuerySubscription`](#uselazyquerysubscription).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met and the fetch has been manually called at least once
 *
 * #### Note
 *
 * When the trigger function returned from a LazyQuery is called, it always initiates a new request to the server even if there is cached data. Set `preferCacheValue`(the second argument to the function) as `true` if you want it to immediately return a cached value if one exists.
 */
export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>
>(
  options?: SubscriptionOptions & Omit<UseQueryStateOptions<D, R>, 'skip'>
) => [
  LazyQueryTrigger<D>,
  UseQueryStateResult<D, R>,
  UseLazyQueryLastPromiseInfo<D>
]

export type LazyQueryTrigger<D extends QueryDefinition<any, any, any, any>> = {
  /**
   * Triggers a lazy query.
   *
   * By default, this will start a new request even if there is already a value in the cache.
   * If you want to use the cache value and only start a request if there is no cache value, set the second argument to `true`.
   *
   * @remarks
   * If you need to access the error or success payload immediately after a lazy query, you can chain .unwrap().
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using .unwrap with async await"
   * try {
   *   const payload = await getUserById(1).unwrap();
   *   console.log('fulfilled', payload)
   * } catch (error) {
   *   console.error('rejected', error);
   * }
   * ```
   */
  (
    arg: QueryArgFrom<D>,
    preferCacheValue?: boolean
  ): QueryActionCreatorResult<D>
}

/**
 * A React hook similar to [`useQuerySubscription`](#usequerysubscription), but with manual control over when the data fetching occurs.
 *
 * Note that this hook does not return a request status or cached data. For that use-case, see [`useLazyQuery`](#uselazyquery).
 *
 * #### Features
 *
 * - Manual control over firing a request to retrieve data
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Accepts polling/re-fetching options to trigger automatic re-fetches when the corresponding criteria is met and the fetch has been manually called at least once
 */
export type UseLazyQuerySubscription<
  D extends QueryDefinition<any, any, any, any>
> = (
  options?: SubscriptionOptions
) => readonly [LazyQueryTrigger<D>, QueryArgFrom<D> | UninitializedValue]

export type QueryStateSelector<
  R extends Record<string, any>,
  D extends QueryDefinition<any, any, any, any>
> = (state: UseQueryStateDefaultResult<D>) => R

/**
 * A React hook that reads the request status and cached data from the Redux store. The component will re-render as the loading status changes and the data becomes available.
 *
 * Note that this hook does not trigger fetching new data. For that use-case, see [`useQuery`](#usequery) or [`useQuerySubscription`](#usequerysubscription).
 *
 * #### Features
 *
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseQueryState<D extends QueryDefinition<any, any, any, any>> = <
  R extends Record<string, any> = UseQueryStateDefaultResult<D>
>(
  arg: QueryArgFrom<D> | SkipToken,
  options?: UseQueryStateOptions<D, R>
) => UseQueryStateResult<D, R>

export type UseQueryStateOptions<
  D extends QueryDefinition<any, any, any, any>,
  R extends Record<string, any>
> = {
  /**
   * Prevents a query from automatically running.
   *
   * @remarks
   * When skip is true:
   *
   * - **If the query has cached data:**
   *   * The cached data **will not be used** on the initial load, and will ignore updates from any identical query until the `skip` condition is removed
   *   * The query will have a status of `uninitialized`
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
   * - **If the query does not have cached data:**
   *   * The query will have a status of `uninitialized`
   *   * The query will not exist in the state when viewed with the dev tools
   *   * The query will not automatically fetch on mount
   *   * The query will not automatically run when additional components with the same query are added that do run
   *
   * @example
   * ```ts
   * // codeblock-meta title="Skip example"
   * const Pokemon = ({ name, skip }: { name: string; skip: boolean }) => {
   *   const { data, error, status } = useGetPokemonByNameQuery(name, {
   *     skip,
   *   });
   *
   *   return (
   *     <div>
   *       {name} - {status}
   *     </div>
   *   );
   * };
   * ```
   */
  skip?: boolean
  /**
   * `selectFromResult` allows you to get a specific segment from a query result in a performant manner.
   * When using this feature, the component will not rerender unless the underlying data of the selected item has changed.
   * If the selected item is one element in a larger collection, it will disregard changes to elements in the same collection.
   *
   * @example
   * ```ts
   * // codeblock-meta title="Using selectFromResult to extract a single result"
   * function PostsList() {
   *   const { data: posts } = api.useGetPostsQuery();
   *
   *   return (
   *     <ul>
   *       {posts?.data?.map((post) => (
   *         <PostById key={post.id} id={post.id} />
   *       ))}
   *     </ul>
   *   );
   * }
   *
   * function PostById({ id }: { id: number }) {
   *   // Will select the post with the given id, and will only rerender if the given posts data changes
   *   const { post } = api.useGetPostsQuery(undefined, {
   *     selectFromResult: ({ data }) => ({ post: data?.find((post) => post.id === id) }),
   *   });
   *
   *   return <li>{post?.name}</li>;
   * }
   * ```
   */
  selectFromResult?: QueryStateSelector<R, D>
}

export type UseQueryStateResult<
  _ extends QueryDefinition<any, any, any, any>,
  R
> = NoInfer<R>

/**
 * Helper type to manually type the result
 * of the `useQueryState` hook in userland code.
 */
export type TypedUseQueryStateResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = UseQueryStateDefaultResult<
    QueryDefinition<QueryArg, BaseQuery, string, ResultType, string>
  >
> = NoInfer<R>

type UseQueryStateBaseResult<D extends QueryDefinition<any, any, any, any>> =
  QuerySubState<D> & {
    /**
     * Where `data` tries to hold data as much as possible, also re-using
     * data from the last arguments passed into the hook, this property
     * will always contain the received data from the query, for the current query arguments.
     */
    currentData?: ResultTypeFrom<D>
    /**
     * Query has not started yet.
     */
    isUninitialized: false
    /**
     * Query is currently loading for the first time. No data yet.
     */
    isLoading: false
    /**
     * Query is currently fetching, but might have data from an earlier request.
     */
    isFetching: false
    /**
     * Query has data from a successful load.
     */
    isSuccess: false
    /**
     * Query is currently in "error" state.
     */
    isError: false
  }

type UseQueryStateDefaultResult<D extends QueryDefinition<any, any, any, any>> =
  Id<
    | Override<
        Extract<
          UseQueryStateBaseResult<D>,
          { status: QueryStatus.uninitialized }
        >,
        { isUninitialized: true }
      >
    | Override<
        UseQueryStateBaseResult<D>,
        | { isLoading: true; isFetching: boolean; data: undefined }
        | ({
            isSuccess: true
            isFetching: true
            error: undefined
          } & Required<
            Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>
          >)
        | ({
            isSuccess: true
            isFetching: false
            error: undefined
          } & Required<
            Pick<
              UseQueryStateBaseResult<D>,
              'data' | 'fulfilledTimeStamp' | 'currentData'
            >
          >)
        | ({ isError: true } & Required<
            Pick<UseQueryStateBaseResult<D>, 'error'>
          >)
      >
  > & {
    /**
     * @deprecated will be removed in the next version
     * please use the `isLoading`, `isFetching`, `isSuccess`, `isError`
     * and `isUninitialized` flags instead
     */
    status: QueryStatus
  }

export type MutationStateSelector<
  R extends Record<string, any>,
  D extends MutationDefinition<any, any, any, any>
> = (state: MutationResultSelectorResult<D>) => R

export type UseMutationStateOptions<
  D extends MutationDefinition<any, any, any, any>,
  R extends Record<string, any>
> = {
  selectFromResult?: MutationStateSelector<R, D>
  fixedCacheKey?: string
}

export type UseMutationStateResult<
  D extends MutationDefinition<any, any, any, any>,
  R
> = NoInfer<R> & {
  originalArgs?: QueryArgFrom<D>
  /**
   * Resets the hook state to it's initial `uninitialized` state.
   * This will also remove the last result from the cache.
   */
  reset: () => void
}

/**
 * Helper type to manually type the result
 * of the `useMutation` hook in userland code.
 */
export type TypedUseMutationResult<
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  R = MutationResultSelectorResult<
    MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>
  >
> = UseMutationStateResult<
  MutationDefinition<QueryArg, BaseQuery, string, ResultType, string>,
  R
>

/**
 * A React hook that lets you trigger an update request for a given endpoint, and subscribes the component to read the request status from the Redux store. The component will re-render as the loading status changes.
 *
 * #### Features
 *
 * - Manual control over firing a request to alter data on the server or possibly invalidate the cache
 * - 'Subscribes' the component to keep cached data in the store, and 'unsubscribes' when the component unmounts
 * - Returns the latest request status and cached data from the Redux store
 * - Re-renders as the request status changes and data becomes available
 */
export type UseMutation<D extends MutationDefinition<any, any, any, any>> = <
  R extends Record<string, any> = MutationResultSelectorResult<D>
>(
  options?: UseMutationStateOptions<D, R>
) => readonly [MutationTrigger<D>, UseMutationStateResult<D, R>]

export type MutationTrigger<D extends MutationDefinition<any, any, any, any>> =
  {
    /**
     * Triggers the mutation and returns a Promise.
     * @remarks
     * If you need to access the error or success payload immediately after a mutation, you can chain .unwrap().
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
    (arg: QueryArgFrom<D>): MutationActionCreatorResult<D>
  }

const defaultQueryStateSelector: QueryStateSelector<any, any> = (x) => x
const defaultMutationStateSelector: MutationStateSelector<any, any> = (x) => x

/**
 * Wrapper around `defaultQueryStateSelector` to be used in `useQuery`.
 * We want the initial render to already come back with
 * `{ isUninitialized: false, isFetching: true, isLoading: true }`
 * to prevent that the library user has to do an additional check for `isUninitialized`/
 */
const noPendingQueryStateSelector: QueryStateSelector<any, any> = (
  selected
) => {
  if (selected.isUninitialized) {
    return {
      ...selected,
      isUninitialized: false,
      isFetching: true,
      isLoading: selected.data !== undefined ? false : true,
      status: QueryStatus.pending,
    } as any
  }
  return selected
}

type GenericPrefetchThunk = (
  endpointName: any,
  arg: any,
  options: PrefetchOptions
) => ThunkAction<void, any, any, AnyAction>

/**
 *
 * @param opts.api - An API with defined endpoints to create hooks for
 * @param opts.moduleOptions.batch - The version of the `batchedUpdates` function to be used
 * @param opts.moduleOptions.useDispatch - The version of the `useDispatch` hook to be used
 * @param opts.moduleOptions.useSelector - The version of the `useSelector` hook to be used
 * @returns An object containing functions to generate hooks based on an endpoint
 */
export function buildHooks<Definitions extends EndpointDefinitions>({
  api,
  moduleOptions: {
    batch,
    useDispatch,
    useSelector,
    useStore,
    unstable__sideEffectsInRender,
  },
  serializeQueryArgs,
  context,
}: {
  api: Api<any, Definitions, any, any, CoreModule>
  moduleOptions: Required<ReactHooksModuleOptions>
  serializeQueryArgs: SerializeQueryArgs<any>
  context: ApiContext<Definitions>
}) {
  const usePossiblyImmediateEffect: (
    effect: () => void | undefined,
    deps?: DependencyList
  ) => void = unstable__sideEffectsInRender ? (cb) => cb() : useEffect

  return { buildQueryHooks, buildMutationHook, usePrefetch }

  function queryStatePreSelector(
    currentState: QueryResultSelectorResult<any>,
    lastResult: UseQueryStateDefaultResult<any> | undefined,
    queryArgs: any
  ): UseQueryStateDefaultResult<any> {
    // if we had a last result and the current result is uninitialized,
    // we might have called `api.util.resetApiState`
    // in this case, reset the hook
    if (lastResult?.endpointName && currentState.isUninitialized) {
      const { endpointName } = lastResult
      const endpointDefinition = context.endpointDefinitions[endpointName]
      if (
        serializeQueryArgs({
          queryArgs: lastResult.originalArgs,
          endpointDefinition,
          endpointName,
        }) ===
        serializeQueryArgs({
          queryArgs,
          endpointDefinition,
          endpointName,
        })
      )
        lastResult = undefined
    }
    if (queryArgs === skipToken) {
      lastResult = undefined
    }
    // data is the last known good request result we have tracked - or if none has been tracked yet the last good result for the current args
    let data = currentState.isSuccess ? currentState.data : lastResult?.data
    if (data === undefined) data = currentState.data

    const hasData = data !== undefined

    // isFetching = true any time a request is in flight
    const isFetching = currentState.isLoading
    // isLoading = true only when loading while no data is present yet (initial load with no data in the cache)
    const isLoading = !hasData && isFetching
    // isSuccess = true when data is present
    const isSuccess = currentState.isSuccess || (isFetching && hasData)

    return {
      ...currentState,
      data,
      currentData: currentState.data,
      isFetching,
      isLoading,
      isSuccess,
    } as UseQueryStateDefaultResult<any>
  }

  function usePrefetch<EndpointName extends QueryKeys<Definitions>>(
    endpointName: EndpointName,
    defaultOptions?: PrefetchOptions
  ) {
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()
    const stableDefaultOptions = useShallowStableValue(defaultOptions)

    return useCallback(
      (arg: any, options?: PrefetchOptions) =>
        dispatch(
          (api.util.prefetch as GenericPrefetchThunk)(endpointName, arg, {
            ...stableDefaultOptions,
            ...options,
          })
        ),
      [endpointName, dispatch, stableDefaultOptions]
    )
  }

  function buildQueryHooks(name: string): QueryHooks<any> {
    const useQuerySubscription: UseQuerySubscription<any> = (
      arg: any,
      {
        refetchOnReconnect,
        refetchOnFocus,
        refetchOnMountOrArgChange,
        skip = false,
        pollingInterval = 0,
      } = {}
    ) => {
      const { initiate } = api.endpoints[name] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >
      const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()
      const stableArg = useStableQueryArgs(
        skip ? skipToken : arg,
        // Even if the user provided a per-endpoint `serializeQueryArgs` with
        // a consistent return value, _here_ we want to use the default behavior
        // so we can tell if _anything_ actually changed. Otherwise, we can end up
        // with a case where the query args did change but the serialization doesn't,
        // and then we never try to initiate a refetch.
        defaultSerializeQueryArgs,
        context.endpointDefinitions[name],
        name
      )
      const stableSubscriptionOptions = useShallowStableValue({
        refetchOnReconnect,
        refetchOnFocus,
        pollingInterval,
      })

      const lastRenderHadSubscription = useRef(false)

      const promiseRef = useRef<QueryActionCreatorResult<any>>()

      let { queryCacheKey, requestId } = promiseRef.current || {}

      // HACK Because the latest state is in the middleware, we actually
      // dispatch an action that will be intercepted and returned.
      let currentRenderHasSubscription = false
      if (queryCacheKey && requestId) {
        // This _should_ return a boolean, even if the types don't line up
        const returnedValue = dispatch(
          api.internalActions.internal_probeSubscription({
            queryCacheKey,
            requestId,
          })
        )

        if (process.env.NODE_ENV !== 'production') {
          if (typeof returnedValue !== 'boolean') {
            throw new Error(
              `Warning: Middleware for RTK-Query API at reducerPath "${api.reducerPath}" has not been added to the store.
    You must add the middleware for RTK-Query to function correctly!`
            )
          }
        }

        currentRenderHasSubscription = !!returnedValue
      }

      const subscriptionRemoved =
        !currentRenderHasSubscription && lastRenderHadSubscription.current

      usePossiblyImmediateEffect(() => {
        lastRenderHadSubscription.current = currentRenderHasSubscription
      })

      usePossiblyImmediateEffect((): void | undefined => {
        promiseRef.current = undefined
      }, [subscriptionRemoved])

      usePossiblyImmediateEffect((): void | undefined => {
        const lastPromise = promiseRef.current
        if (
          typeof process !== 'undefined' &&
          process.env.NODE_ENV === 'removeMeOnCompilation'
        ) {
          // this is only present to enforce the rule of hooks to keep `isSubscribed` in the dependency array
          console.log(subscriptionRemoved)
        }

        if (stableArg === skipToken) {
          lastPromise?.unsubscribe()
          promiseRef.current = undefined
          return
        }

        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions

        if (!lastPromise || lastPromise.arg !== stableArg) {
          lastPromise?.unsubscribe()
          const promise = dispatch(
            initiate(stableArg, {
              subscriptionOptions: stableSubscriptionOptions,
              forceRefetch: refetchOnMountOrArgChange,
            })
          )

          promiseRef.current = promise
        } else if (stableSubscriptionOptions !== lastSubscriptionOptions) {
          lastPromise.updateSubscriptionOptions(stableSubscriptionOptions)
        }
      }, [
        dispatch,
        initiate,
        refetchOnMountOrArgChange,
        stableArg,
        stableSubscriptionOptions,
        subscriptionRemoved,
      ])

      useEffect(() => {
        return () => {
          promiseRef.current?.unsubscribe()
          promiseRef.current = undefined
        }
      }, [])

      return useMemo(
        () => ({
          /**
           * A method to manually refetch data for the query
           */
          refetch: () => {
            if (!promiseRef.current)
              throw new Error(
                'Cannot refetch a query that has not been started yet.'
              )
            return promiseRef.current?.refetch()
          },
        }),
        []
      )
    }

    const useLazyQuerySubscription: UseLazyQuerySubscription<any> = ({
      refetchOnReconnect,
      refetchOnFocus,
      pollingInterval = 0,
    } = {}) => {
      const { initiate } = api.endpoints[name] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >
      const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()

      const [arg, setArg] = useState<any>(UNINITIALIZED_VALUE)
      const promiseRef = useRef<QueryActionCreatorResult<any> | undefined>()

      const stableSubscriptionOptions = useShallowStableValue({
        refetchOnReconnect,
        refetchOnFocus,
        pollingInterval,
      })

      usePossiblyImmediateEffect(() => {
        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions

        if (stableSubscriptionOptions !== lastSubscriptionOptions) {
          promiseRef.current?.updateSubscriptionOptions(
            stableSubscriptionOptions
          )
        }
      }, [stableSubscriptionOptions])

      const subscriptionOptionsRef = useRef(stableSubscriptionOptions)
      usePossiblyImmediateEffect(() => {
        subscriptionOptionsRef.current = stableSubscriptionOptions
      }, [stableSubscriptionOptions])

      const trigger = useCallback(
        function (arg: any, preferCacheValue = false) {
          let promise: QueryActionCreatorResult<any>

          batch(() => {
            promiseRef.current?.unsubscribe()

            promiseRef.current = promise = dispatch(
              initiate(arg, {
                subscriptionOptions: subscriptionOptionsRef.current,
                forceRefetch: !preferCacheValue,
              })
            )

            setArg(arg)
          })

          return promise!
        },
        [dispatch, initiate]
      )

      /* cleanup on unmount */
      useEffect(() => {
        return () => {
          promiseRef?.current?.unsubscribe()
        }
      }, [])

      /* if "cleanup on unmount" was triggered from a fast refresh, we want to reinstate the query */
      useEffect(() => {
        if (arg !== UNINITIALIZED_VALUE && !promiseRef.current) {
          trigger(arg, true)
        }
      }, [arg, trigger])

      return useMemo(() => [trigger, arg] as const, [trigger, arg])
    }

    const useQueryState: UseQueryState<any> = (
      arg: any,
      { skip = false, selectFromResult } = {}
    ) => {
      const { select } = api.endpoints[name] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >
      const stableArg = useStableQueryArgs(
        skip ? skipToken : arg,
        serializeQueryArgs,
        context.endpointDefinitions[name],
        name
      )

      type ApiRootState = Parameters<ReturnType<typeof select>>[0]

      const lastValue = useRef<any>()

      const selectDefaultResult: Selector<ApiRootState, any, [any]> = useMemo(
        () =>
          createSelector(
            [
              select(stableArg),
              (_: ApiRootState, lastResult: any) => lastResult,
              (_: ApiRootState) => stableArg,
            ],
            queryStatePreSelector
          ),
        [select, stableArg]
      )

      const querySelector: Selector<ApiRootState, any, [any]> = useMemo(
        () =>
          selectFromResult
            ? createSelector([selectDefaultResult], selectFromResult)
            : selectDefaultResult,
        [selectDefaultResult, selectFromResult]
      )

      const currentState = useSelector(
        (state: RootState<Definitions, any, any>) =>
          querySelector(state, lastValue.current),
        shallowEqual
      )

      const store = useStore<RootState<Definitions, any, any>>()
      const newLastValue = selectDefaultResult(
        store.getState(),
        lastValue.current
      )
      useIsomorphicLayoutEffect(() => {
        lastValue.current = newLastValue
      }, [newLastValue])

      return currentState
    }

    return {
      useQueryState,
      useQuerySubscription,
      useLazyQuerySubscription,
      useLazyQuery(options) {
        const [trigger, arg] = useLazyQuerySubscription(options)
        const queryStateResults = useQueryState(arg, {
          ...options,
          skip: arg === UNINITIALIZED_VALUE,
        })

        const info = useMemo(() => ({ lastArg: arg }), [arg])
        return useMemo(
          () => [trigger, queryStateResults, info],
          [trigger, queryStateResults, info]
        )
      },
      useQuery(arg, options) {
        const querySubscriptionResults = useQuerySubscription(arg, options)
        const queryStateResults = useQueryState(arg, {
          selectFromResult:
            arg === skipToken || options?.skip
              ? undefined
              : noPendingQueryStateSelector,
          ...options,
        })

        const { data, status, isLoading, isSuccess, isError, error } =
          queryStateResults
        useDebugValue({ data, status, isLoading, isSuccess, isError, error })

        return useMemo(
          () => ({ ...queryStateResults, ...querySubscriptionResults }),
          [queryStateResults, querySubscriptionResults]
        )
      },
    }
  }

  function buildMutationHook(name: string): UseMutation<any> {
    return ({
      selectFromResult = defaultMutationStateSelector,
      fixedCacheKey,
    } = {}) => {
      const { select, initiate } = api.endpoints[name] as ApiEndpointMutation<
        MutationDefinition<any, any, any, any, any>,
        Definitions
      >
      const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()
      const [promise, setPromise] = useState<MutationActionCreatorResult<any>>()

      useEffect(
        () => () => {
          if (!promise?.arg.fixedCacheKey) {
            promise?.reset()
          }
        },
        [promise]
      )

      const triggerMutation = useCallback(
        function (arg: Parameters<typeof initiate>['0']) {
          const promise = dispatch(initiate(arg, { fixedCacheKey }))
          setPromise(promise)
          return promise
        },
        [dispatch, initiate, fixedCacheKey]
      )

      const { requestId } = promise || {}
      const mutationSelector = useMemo(
        () =>
          createSelector(
            [select({ fixedCacheKey, requestId: promise?.requestId })],
            selectFromResult
          ),
        [select, promise, selectFromResult, fixedCacheKey]
      )

      const currentState = useSelector(mutationSelector, shallowEqual)
      const originalArgs =
        fixedCacheKey == null ? promise?.arg.originalArgs : undefined
      const reset = useCallback(() => {
        batch(() => {
          if (promise) {
            setPromise(undefined)
          }
          if (fixedCacheKey) {
            dispatch(
              api.internalActions.removeMutationResult({
                requestId,
                fixedCacheKey,
              })
            )
          }
        })
      }, [dispatch, fixedCacheKey, promise, requestId])

      const {
        endpointName,
        data,
        status,
        isLoading,
        isSuccess,
        isError,
        error,
      } = currentState
      useDebugValue({
        endpointName,
        data,
        status,
        isLoading,
        isSuccess,
        isError,
        error,
      })

      const finalState = useMemo(
        () => ({ ...currentState, originalArgs, reset }),
        [currentState, originalArgs, reset]
      )

      return useMemo(
        () => [triggerMutation, finalState] as const,
        [triggerMutation, finalState]
      )
    }
  }
}
