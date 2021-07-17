import type { AnyAction, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit'
import { createSelector } from '@reduxjs/toolkit'
import {
  useCallback,
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
import { shallowEqual } from 'react-redux'
import type { Api } from '@reduxjs/toolkit/dist/query/apiTypes'
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
import { useShallowStableValue } from './useShallowStableValue'
import type { UninitializedValue } from './constants'
import { UNINITIALIZED_VALUE } from './constants'

// Copy-pasted from React-Redux
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
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
) => UseQueryStateResult<D, R> & ReturnType<UseQuerySubscription<D>>

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
   *   * If `skip: false` is set after skipping the initial load, the cached result will be used
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
) => Pick<QueryActionCreatorResult<D>, 'refetch'>

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
 */
export type UseLazyQuery<D extends QueryDefinition<any, any, any, any>> = <
  R = UseQueryStateDefaultResult<D>
>(
  options?: SubscriptionOptions & Omit<UseQueryStateOptions<D, R>, 'skip'>
) => [
  (arg: QueryArgFrom<D>) => void,
  UseQueryStateResult<D, R>,
  UseLazyQueryLastPromiseInfo<D>
]

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
) => [(arg: QueryArgFrom<D>) => void, QueryArgFrom<D> | UninitializedValue]

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
  R = UseQueryStateDefaultResult<D>
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

type UseQueryStateBaseResult<D extends QueryDefinition<any, any, any, any>> =
  QuerySubState<D> & {
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
            isFetching: boolean
            error: undefined
          } & Required<
            Pick<UseQueryStateBaseResult<D>, 'data' | 'fulfilledTimeStamp'>
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
}

export type UseMutationStateResult<
  D extends MutationDefinition<any, any, any, any>,
  R
> = NoInfer<R> & {
  originalArgs?: QueryArgFrom<D>
}

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
) => [
  (arg: QueryArgFrom<D>) => MutationActionCreatorResult<D>,
  UseMutationStateResult<D, R>
]

const defaultQueryStateSelector: QueryStateSelector<any, any> = (x) => x
const defaultMutationStateSelector: MutationStateSelector<any, any> = (x) => x

const queryStatePreSelector = (
  currentState: QueryResultSelectorResult<any>,
  lastResult: UseQueryStateDefaultResult<any>
): UseQueryStateDefaultResult<any> => {
  // data is the last known good request result we have tracked - or if none has been tracked yet the last good result for the current args
  const data =
    (currentState.isSuccess ? currentState.data : lastResult?.data) ??
    currentState.data

  // isFetching = true any time a request is in flight
  const isFetching = currentState.isLoading
  // isLoading = true only when loading while no data is present yet (initial load with no data in the cache)
  const isLoading = !data && isFetching
  // isSuccess = true when data is present
  const isSuccess = currentState.isSuccess || (isFetching && !!data)

  return {
    ...currentState,
    data,
    isFetching,
    isLoading,
    isSuccess,
  } as UseQueryStateDefaultResult<any>
}

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
      isLoading: true,
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
  moduleOptions: { batch, useDispatch, useSelector, useStore },
}: {
  api: Api<any, Definitions, any, any, CoreModule>
  moduleOptions: Required<ReactHooksModuleOptions>
}) {
  return { buildQueryHooks, buildMutationHook, usePrefetch }

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
      const stableArg = useShallowStableValue(skip ? skipToken : arg)
      const stableSubscriptionOptions = useShallowStableValue({
        refetchOnReconnect,
        refetchOnFocus,
        pollingInterval,
      })

      const promiseRef = useRef<QueryActionCreatorResult<any>>()

      useEffect(() => {
        const lastPromise = promiseRef.current

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
          refetch: () => void promiseRef.current?.refetch(),
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

      useEffect(() => {
        const lastSubscriptionOptions = promiseRef.current?.subscriptionOptions

        if (stableSubscriptionOptions !== lastSubscriptionOptions) {
          promiseRef.current?.updateSubscriptionOptions(
            stableSubscriptionOptions
          )
        }
      }, [stableSubscriptionOptions])

      const subscriptionOptionsRef = useRef(stableSubscriptionOptions)
      useEffect(() => {
        subscriptionOptionsRef.current = stableSubscriptionOptions
      }, [stableSubscriptionOptions])

      const trigger = useCallback(
        function (arg: any, preferCacheValue = false) {
          batch(() => {
            promiseRef.current?.unsubscribe()

            promiseRef.current = dispatch(
              initiate(arg, {
                subscriptionOptions: subscriptionOptionsRef.current,
                forceRefetch: !preferCacheValue,
              })
            )
            setArg(arg)
          })
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

      return useMemo(() => [trigger, arg], [trigger, arg])
    }

    const useQueryState: UseQueryState<any> = (
      arg: any,
      { skip = false, selectFromResult = defaultQueryStateSelector } = {}
    ) => {
      const { select } = api.endpoints[name] as ApiEndpointQuery<
        QueryDefinition<any, any, any, any, any>,
        Definitions
      >
      const stableArg = useShallowStableValue(skip ? skipToken : arg)

      const lastValue = useRef<any>()

      const selectDefaultResult = useMemo(
        () =>
          createSelector(
            [select(stableArg), (_: any, lastResult: any) => lastResult],
            queryStatePreSelector
          ),
        [select, stableArg]
      )

      const querySelector = useMemo(
        () => createSelector([selectDefaultResult], selectFromResult),
        [selectDefaultResult, selectFromResult]
      )

      const currentState = useSelector(
        (state: RootState<Definitions, any, any>) =>
          querySelector(state, lastValue.current),
        shallowEqual
      )

      const store = useStore()
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
        return useMemo(
          () => ({ ...queryStateResults, ...querySubscriptionResults }),
          [queryStateResults, querySubscriptionResults]
        )
      },
    }
  }

  function buildMutationHook(name: string): UseMutation<any> {
    return ({ selectFromResult = defaultMutationStateSelector } = {}) => {
      const { select, initiate } = api.endpoints[name] as ApiEndpointMutation<
        MutationDefinition<any, any, any, any, any>,
        Definitions
      >
      const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>()
      const [requestId, setRequestId] = useState<string>()

      const promiseRef = useRef<MutationActionCreatorResult<any>>()

      useEffect(() => {
        return () => {
          promiseRef.current?.unsubscribe()
          promiseRef.current = undefined
        }
      }, [])

      const triggerMutation = useCallback(
        function (arg) {
          let promise: MutationActionCreatorResult<any>
          batch(() => {
            promiseRef?.current?.unsubscribe()
            promise = dispatch(initiate(arg))
            promiseRef.current = promise
            setRequestId(promise.requestId)
          })
          return promise!
        },
        [dispatch, initiate]
      )

      const mutationSelector = useMemo(
        () =>
          createSelector([select(requestId || skipToken)], (subState) =>
            selectFromResult(subState)
          ),
        [select, requestId, selectFromResult]
      )

      const currentState = useSelector(mutationSelector, shallowEqual)
      const originalArgs = promiseRef.current?.arg.originalArgs
      const finalState = useMemo(
        () => ({
          ...currentState,
          originalArgs,
        }),
        [currentState, originalArgs]
      )

      return useMemo(
        () => [triggerMutation, finalState],
        [triggerMutation, finalState]
      )
    }
  }
}
