import { isPending, isRejected, isFulfilled } from '@reduxjs/toolkit'
import type {
  BaseQueryError,
  BaseQueryFn,
  BaseQueryMeta,
} from '../../baseQueryTypes'
import { DefinitionType } from '../../endpointDefinitions'
import type { QueryFulfilledRejectionReason } from '../../endpointDefinitions'
import type { Recipe } from '../buildThunks'
import type {
  SubMiddlewareBuilder,
  PromiseWithKnownReason,
  PromiseConstructorWithKnownReason,
} from './types'

export type ReferenceQueryLifecycle = never

declare module '../../endpointDefinitions' {
  export interface QueryLifecyclePromises<
    ResultType,
    BaseQuery extends BaseQueryFn
  > {
    /**
     * Promise that will resolve with the (transformed) query result.
     *
     * If the query fails, this promise will reject with the error.
     *
     * This allows you to `await` for the query to finish.
     *
     * If you don't interact with this promise, it will not throw.
     */
    queryFulfilled: PromiseWithKnownReason<
      {
        /**
         * The (transformed) query result.
         */
        data: ResultType
        /**
         * The `meta` returned by the `baseQuery`
         */
        meta: BaseQueryMeta<BaseQuery>
      },
      QueryFulfilledRejectionReason<BaseQuery>
    >
  }

  type QueryFulfilledRejectionReason<BaseQuery extends BaseQueryFn> =
    | {
        error: BaseQueryError<BaseQuery>
        /**
         * If this is `false`, that means this error was returned from the `baseQuery` or `queryFn` in a controlled manner.
         */
        isUnhandledError: false
        /**
         * The `meta` returned by the `baseQuery`
         */
        meta: BaseQueryMeta<BaseQuery>
      }
    | {
        error: unknown
        meta?: undefined
        /**
         * If this is `true`, that means that this error is the result of `baseQueryFn`, `queryFn` or `transformResponse` throwing an error instead of handling it properly.
         * There can not be made any assumption about the shape of `error`.
         */
        isUnhandledError: true
      }

  interface QueryExtraOptions<
    TagTypes extends string,
    ResultType,
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ReducerPath extends string = string
  > {
    /**
     * A function that is called when the individual query is started. The function is called with a lifecycle api object containing properties such as `queryFulfilled`, allowing code to be run when a query is started, when it succeeds, and when it fails (i.e. throughout the lifecycle of an individual query/mutation call).
     *
     * Can be used to perform side-effects throughout the lifecycle of the query.
     *
     * @example
     * ```ts
     * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
     * import { messageCreated } from './notificationsSlice
     * export interface Post {
     *   id: number
     *   name: string
     * }
     *
     * const api = createApi({
     *   baseQuery: fetchBaseQuery({
     *     baseUrl: '/',
     *   }),
     *   endpoints: (build) => ({
     *     getPost: build.query<Post, number>({
     *       query: (id) => `post/${id}`,
     *       async onQueryStarted(id, { dispatch, queryFulfilled }) {
     *         // `onStart` side-effect
     *         dispatch(messageCreated('Fetching posts...'))
     *         try {
     *           const { data } = await queryFulfilled
     *           // `onSuccess` side-effect
     *           dispatch(messageCreated('Posts received!'))
     *         } catch (err) {
     *           // `onError` side-effect
     *           dispatch(messageCreated('Error fetching posts!'))
     *         }
     *       }
     *     }),
     *   }),
     * })
     * ```
     */
    onQueryStarted?(
      arg: QueryArg,
      api: QueryLifecycleApi<QueryArg, BaseQuery, ResultType, ReducerPath>
    ): Promise<void> | void
  }

  interface MutationExtraOptions<
    TagTypes extends string,
    ResultType,
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ReducerPath extends string = string
  > {
    /**
     * A function that is called when the individual mutation is started. The function is called with a lifecycle api object containing properties such as `queryFulfilled`, allowing code to be run when a query is started, when it succeeds, and when it fails (i.e. throughout the lifecycle of an individual query/mutation call).
     *
     * Can be used for `optimistic updates`.
     *
     * @example
     *
     * ```ts
     * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
     * export interface Post {
     *   id: number
     *   name: string
     * }
     *
     * const api = createApi({
     *   baseQuery: fetchBaseQuery({
     *     baseUrl: '/',
     *   }),
     *   tagTypes: ['Post'],
     *   endpoints: (build) => ({
     *     getPost: build.query<Post, number>({
     *       query: (id) => `post/${id}`,
     *       providesTags: ['Post'],
     *     }),
     *     updatePost: build.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
     *       query: ({ id, ...patch }) => ({
     *         url: `post/${id}`,
     *         method: 'PATCH',
     *         body: patch,
     *       }),
     *       invalidatesTags: ['Post'],
     *       async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
     *         const patchResult = dispatch(
     *           api.util.updateQueryData('getPost', id, (draft) => {
     *             Object.assign(draft, patch)
     *           })
     *         )
     *         try {
     *           await queryFulfilled
     *         } catch {
     *           patchResult.undo()
     *         }
     *       },
     *     }),
     *   }),
     * })
     * ```
     */
    onQueryStarted?(
      arg: QueryArg,
      api: MutationLifecycleApi<QueryArg, BaseQuery, ResultType, ReducerPath>
    ): Promise<void> | void
  }

  export interface QueryLifecycleApi<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    ResultType,
    ReducerPath extends string = string
  > extends QueryBaseLifecycleApi<QueryArg, BaseQuery, ResultType, ReducerPath>,
      QueryLifecyclePromises<ResultType, BaseQuery> {}

  export interface MutationLifecycleApi<
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
      QueryLifecyclePromises<ResultType, BaseQuery> {}
}

export const build: SubMiddlewareBuilder = ({
  api,
  context,
  queryThunk,
  mutationThunk,
}) => {
  const isPendingThunk = isPending(queryThunk, mutationThunk)
  const isRejectedThunk = isRejected(queryThunk, mutationThunk)
  const isFullfilledThunk = isFulfilled(queryThunk, mutationThunk)

  return (mwApi) => {
    type CacheLifecycle = {
      resolve(value: { data: unknown; meta: unknown }): unknown
      reject(value: QueryFulfilledRejectionReason<any>): unknown
    }
    const lifecycleMap: Record<string, CacheLifecycle> = {}

    return (next) =>
      (action): any => {
        const result = next(action)

        if (isPendingThunk(action)) {
          const {
            requestId,
            arg: { endpointName, originalArgs },
          } = action.meta
          const endpointDefinition = context.endpointDefinitions[endpointName]
          const onQueryStarted = endpointDefinition?.onQueryStarted
          if (onQueryStarted) {
            const lifecycle = {} as CacheLifecycle
            const queryFulfilled =
              new (Promise as PromiseConstructorWithKnownReason)<
                { data: unknown; meta: unknown },
                QueryFulfilledRejectionReason<any>
              >((resolve, reject) => {
                lifecycle.resolve = resolve
                lifecycle.reject = reject
              })
            // prevent uncaught promise rejections from happening.
            // if the original promise is used in any way, that will create a new promise that will throw again
            queryFulfilled.catch(() => {})
            lifecycleMap[requestId] = lifecycle
            const selector = (api.endpoints[endpointName] as any).select(
              endpointDefinition.type === DefinitionType.query
                ? originalArgs
                : requestId
            )

            const extra = mwApi.dispatch((_, __, extra) => extra)
            const lifecycleApi = {
              ...mwApi,
              getCacheEntry: () => selector(mwApi.getState()),
              requestId,
              extra,
              updateCachedData: (endpointDefinition.type ===
              DefinitionType.query
                ? (updateRecipe: Recipe<any>) =>
                    mwApi.dispatch(
                      api.util.updateQueryData(
                        endpointName as never,
                        originalArgs,
                        updateRecipe
                      )
                    )
                : undefined) as any,
              queryFulfilled,
            }
            onQueryStarted(originalArgs, lifecycleApi)
          }
        } else if (isFullfilledThunk(action)) {
          const { requestId, baseQueryMeta } = action.meta
          lifecycleMap[requestId]?.resolve({
            data: action.payload,
            meta: baseQueryMeta,
          })
          delete lifecycleMap[requestId]
        } else if (isRejectedThunk(action)) {
          const { requestId, rejectedWithValue, baseQueryMeta } = action.meta
          lifecycleMap[requestId]?.reject({
            error: action.payload ?? action.error,
            isUnhandledError: !rejectedWithValue,
            meta: baseQueryMeta as any,
          })
          delete lifecycleMap[requestId]
        }

        return result
      }
  }
}
