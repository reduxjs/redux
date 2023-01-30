import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { SerializeQueryArgs } from './defaultSerializeQueryArgs'
import type { QuerySubState, RootState } from './core/apiState'
import type {
  BaseQueryExtraOptions,
  BaseQueryFn,
  BaseQueryResult,
  BaseQueryArg,
  BaseQueryApi,
  QueryReturnValue,
  BaseQueryError,
  BaseQueryMeta,
} from './baseQueryTypes'
import type {
  HasRequiredProps,
  MaybePromise,
  OmitFromUnion,
  CastAny,
  NonUndefined,
} from './tsHelpers'
import type { NEVER } from './fakeBaseQuery'
import type { Api } from '@reduxjs/toolkit/query'

const resultType = /* @__PURE__ */ Symbol()
const baseQuery = /* @__PURE__ */ Symbol()

interface EndpointDefinitionWithQuery<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ResultType
> {
  /**
   * `query` can be a function that returns either a `string` or an `object` which is passed to your `baseQuery`. If you are using [fetchBaseQuery](./fetchBaseQuery), this can return either a `string` or an `object` of properties in `FetchArgs`. If you use your own custom [`baseQuery`](../../rtk-query/usage/customizing-queries), you can customize this behavior to your liking.
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="query example"
   *
   * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   * type PostsResponse = Post[]
   *
   * const api = createApi({
   *   baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *   tagTypes: ['Post'],
   *   endpoints: (build) => ({
   *     getPosts: build.query<PostsResponse, void>({
   *       // highlight-start
   *       query: () => 'posts',
   *       // highlight-end
   *     }),
   *     addPost: build.mutation<Post, Partial<Post>>({
   *      // highlight-start
   *      query: (body) => ({
   *        url: `posts`,
   *        method: 'POST',
   *        body,
   *      }),
   *      // highlight-end
   *      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
   *    }),
   *   })
   * })
   * ```
   */
  query(arg: QueryArg): BaseQueryArg<BaseQuery>
  queryFn?: never
  /**
   * A function to manipulate the data returned by a query or mutation.
   */
  transformResponse?(
    baseQueryReturnValue: BaseQueryResult<BaseQuery>,
    meta: BaseQueryMeta<BaseQuery>,
    arg: QueryArg
  ): ResultType | Promise<ResultType>
  /**
   * A function to manipulate the data returned by a failed query or mutation.
   */
  transformErrorResponse?(
    baseQueryReturnValue: BaseQueryError<BaseQuery>,
    meta: BaseQueryMeta<BaseQuery>,
    arg: QueryArg
  ): unknown
  /**
   * Defaults to `true`.
   *
   * Most apps should leave this setting on. The only time it can be a performance issue
   * is if an API returns extremely large amounts of data (e.g. 10,000 rows per request) and
   * you're unable to paginate it.
   *
   * For details of how this works, please see the below. When it is set to `false`,
   * every request will cause subscribed components to rerender, even when the data has not changed.
   *
   * @see https://redux-toolkit.js.org/api/other-exports#copywithstructuralsharing
   */
  structuralSharing?: boolean
}

interface EndpointDefinitionWithQueryFn<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ResultType
> {
  /**
   * Can be used in place of `query` as an inline function that bypasses `baseQuery` completely for the endpoint.
   *
   * @example
   * ```ts
   * // codeblock-meta title="Basic queryFn example"
   *
   * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   * type PostsResponse = Post[]
   *
   * const api = createApi({
   *   baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *   endpoints: (build) => ({
   *     getPosts: build.query<PostsResponse, void>({
   *       query: () => 'posts',
   *     }),
   *     flipCoin: build.query<'heads' | 'tails', void>({
   *       // highlight-start
   *       queryFn(arg, queryApi, extraOptions, baseQuery) {
   *         const randomVal = Math.random()
   *         if (randomVal < 0.45) {
   *           return { data: 'heads' }
   *         }
   *         if (randomVal < 0.9) {
   *           return { data: 'tails' }
   *         }
   *         return { error: { status: 500, statusText: 'Internal Server Error', data: "Coin landed on it's edge!" } }
   *       }
   *       // highlight-end
   *     })
   *   })
   * })
   * ```
   */
  queryFn(
    arg: QueryArg,
    api: BaseQueryApi,
    extraOptions: BaseQueryExtraOptions<BaseQuery>,
    baseQuery: (arg: Parameters<BaseQuery>[0]) => ReturnType<BaseQuery>
  ): MaybePromise<QueryReturnValue<ResultType, BaseQueryError<BaseQuery>>>
  query?: never
  transformResponse?: never
  transformErrorResponse?: never
  /**
   * Defaults to `true`.
   *
   * Most apps should leave this setting on. The only time it can be a performance issue
   * is if an API returns extremely large amounts of data (e.g. 10,000 rows per request) and
   * you're unable to paginate it.
   *
   * For details of how this works, please see the below. When it is set to `false`,
   * every request will cause subscribed components to rerender, even when the data has not changed.
   *
   * @see https://redux-toolkit.js.org/api/other-exports#copywithstructuralsharing
   */
  structuralSharing?: boolean
}

export interface BaseEndpointTypes<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ResultType
> {
  QueryArg: QueryArg
  BaseQuery: BaseQuery
  ResultType: ResultType
}

export type BaseEndpointDefinition<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ResultType
> = (
  | ([CastAny<BaseQueryResult<BaseQuery>, {}>] extends [NEVER]
      ? never
      : EndpointDefinitionWithQuery<QueryArg, BaseQuery, ResultType>)
  | EndpointDefinitionWithQueryFn<QueryArg, BaseQuery, ResultType>
) & {
  /* phantom type */
  [resultType]?: ResultType
  /* phantom type */
  [baseQuery]?: BaseQuery
} & HasRequiredProps<
    BaseQueryExtraOptions<BaseQuery>,
    { extraOptions: BaseQueryExtraOptions<BaseQuery> },
    { extraOptions?: BaseQueryExtraOptions<BaseQuery> }
  >

export enum DefinitionType {
  query = 'query',
  mutation = 'mutation',
}

export type GetResultDescriptionFn<
  TagTypes extends string,
  ResultType,
  QueryArg,
  ErrorType,
  MetaType
> = (
  result: ResultType | undefined,
  error: ErrorType | undefined,
  arg: QueryArg,
  meta: MetaType
) => ReadonlyArray<TagDescription<TagTypes>>

export type FullTagDescription<TagType> = {
  type: TagType
  id?: number | string
}
export type TagDescription<TagType> = TagType | FullTagDescription<TagType>
export type ResultDescription<
  TagTypes extends string,
  ResultType,
  QueryArg,
  ErrorType,
  MetaType
> =
  | ReadonlyArray<TagDescription<TagTypes>>
  | GetResultDescriptionFn<TagTypes, ResultType, QueryArg, ErrorType, MetaType>

/** @deprecated please use `onQueryStarted` instead */
export interface QueryApi<ReducerPath extends string, Context extends {}> {
  /** @deprecated please use `onQueryStarted` instead */
  dispatch: ThunkDispatch<any, any, AnyAction>
  /** @deprecated please use `onQueryStarted` instead */
  getState(): RootState<any, any, ReducerPath>
  /** @deprecated please use `onQueryStarted` instead */
  extra: unknown
  /** @deprecated please use `onQueryStarted` instead */
  requestId: string
  /** @deprecated please use `onQueryStarted` instead */
  context: Context
}

export interface QueryTypes<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> extends BaseEndpointTypes<QueryArg, BaseQuery, ResultType> {
  /**
   * The endpoint definition type. To be used with some internal generic types.
   * @example
   * ```ts
   * const useMyWrappedHook: UseQuery<typeof api.endpoints.query.Types.QueryDefinition> = ...
   * ```
   */
  QueryDefinition: QueryDefinition<
    QueryArg,
    BaseQuery,
    TagTypes,
    ResultType,
    ReducerPath
  >
  TagTypes: TagTypes
  ReducerPath: ReducerPath
}

export interface QueryExtraOptions<
  TagTypes extends string,
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ReducerPath extends string = string
> {
  type: DefinitionType.query
  /**
   * Used by `query` endpoints. Determines which 'tag' is attached to the cached data returned by the query.
   * Expects an array of tag type strings, an array of objects of tag types with ids, or a function that returns such an array.
   * 1.  `['Post']` - equivalent to `2`
   * 2.  `[{ type: 'Post' }]` - equivalent to `1`
   * 3.  `[{ type: 'Post', id: 1 }]`
   * 4.  `(result, error, arg) => ['Post']` - equivalent to `5`
   * 5.  `(result, error, arg) => [{ type: 'Post' }]` - equivalent to `4`
   * 6.  `(result, error, arg) => [{ type: 'Post', id: 1 }]`
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="providesTags example"
   *
   * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   * type PostsResponse = Post[]
   *
   * const api = createApi({
   *   baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *   tagTypes: ['Posts'],
   *   endpoints: (build) => ({
   *     getPosts: build.query<PostsResponse, void>({
   *       query: () => 'posts',
   *       // highlight-start
   *       providesTags: (result) =>
   *         result
   *           ? [
   *               ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
   *               { type: 'Posts', id: 'LIST' },
   *             ]
   *           : [{ type: 'Posts', id: 'LIST' }],
   *       // highlight-end
   *     })
   *   })
   * })
   * ```
   */
  providesTags?: ResultDescription<
    TagTypes,
    ResultType,
    QueryArg,
    BaseQueryError<BaseQuery>,
    BaseQueryMeta<BaseQuery>
  >
  /**
   * Not to be used. A query should not invalidate tags in the cache.
   */
  invalidatesTags?: never

  /**
   * Can be provided to return a custom cache key value based on the query arguments.
   *
   * This is primarily intended for cases where a non-serializable value is passed as part of the query arg object and should be excluded from the cache key.  It may also be used for cases where an endpoint should only have a single cache entry, such as an infinite loading / pagination implementation.
   *
   * Unlike the `createApi` version which can _only_ return a string, this per-endpoint option can also return an an object, number, or boolean.  If it returns a string, that value will be used as the cache key directly.  If it returns an object / number / boolean, that value will be passed to the built-in `defaultSerializeQueryArgs`.  This simplifies the use case of stripping out args you don't want included in the cache key.
   *
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="serializeQueryArgs : exclude value"
   *
   * import { createApi, fetchBaseQuery, defaultSerializeQueryArgs } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   *
   * interface MyApiClient {
   *   fetchPost: (id: string) => Promise<Post>
   * }
   *
   * createApi({
   *  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *  endpoints: (build) => ({
   *    // Example: an endpoint with an API client passed in as an argument,
   *    // but only the item ID should be used as the cache key
   *    getPost: build.query<Post, { id: string; client: MyApiClient }>({
   *      queryFn: async ({ id, client }) => {
   *        const post = await client.fetchPost(id)
   *        return { data: post }
   *      },
   *      // highlight-start
   *      serializeQueryArgs: ({ queryArgs, endpointDefinition, endpointName }) => {
   *        const { id } = queryArgs
   *        // This can return a string, an object, a number, or a boolean.
   *        // If it returns an object, number or boolean, that value
   *        // will be serialized automatically via `defaultSerializeQueryArgs`
   *        return { id } // omit `client` from the cache key
   *
   *        // Alternately, you can use `defaultSerializeQueryArgs` yourself:
   *        // return defaultSerializeQueryArgs({
   *        //   endpointName,
   *        //   queryArgs: { id },
   *        //   endpointDefinition
   *        // })
   *        // Or  create and return a string yourself:
   *        // return `getPost(${id})`
   *      },
   *      // highlight-end
   *    }),
   *  }),
   *})
   * ```
   */
  serializeQueryArgs?: SerializeQueryArgs<
    QueryArg,
    string | number | boolean | Record<any, any>
  >

  /**
   * Can be provided to merge an incoming response value into the current cache data.
   * If supplied, no automatic structural sharing will be applied - it's up to
   * you to update the cache appropriately.
   *
   * Since RTKQ normally replaces cache entries with the new response, you will usually
   * need to use this with the `serializeQueryArgs` or `forceRefetch` options to keep
   * an existing cache entry so that it can be updated.
   *
   * Since this is wrapped with Immer, you , you may either mutate the `currentCacheValue` directly,
   * or return a new value, but _not_ both at once.
   *
   * Will only be called if the existing `currentCacheData` is _not_ `undefined` - on first response,
   * the cache entry will just save the response data directly.
   *
   * Useful if you don't want a new request to completely override the current cache value,
   * maybe because you have manually updated it from another source and don't want those
   * updates to get lost.
   *
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="merge: pagination"
   *
   * import { createApi, fetchBaseQuery, defaultSerializeQueryArgs } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   *
   * createApi({
   *  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *  endpoints: (build) => ({
   *    listItems: build.query<string[], number>({
   *      query: (pageNumber) => `/listItems?page=${pageNumber}`,
   *     // Only have one cache entry because the arg always maps to one string
   *     serializeQueryArgs: ({ endpointName }) => {
   *       return endpointName
   *      },
   *      // Always merge incoming data to the cache entry
   *      merge: (currentCache, newItems) => {
   *        currentCache.push(...newItems)
   *      },
   *      // Refetch when the page arg changes
   *      forceRefetch({ currentArg, previousArg }) {
   *        return currentArg !== previousArg
   *      },
   *    }),
   *  }),
   *})
   * ```
   */
  merge?(
    currentCacheData: ResultType,
    responseData: ResultType,
    otherArgs: {
      arg: QueryArg
      baseQueryMeta: BaseQueryMeta<BaseQuery>
      requestId: string
      fulfilledTimeStamp: number
    }
  ): ResultType | void

  /**
   * Check to see if the endpoint should force a refetch in cases where it normally wouldn't.
   * This is primarily useful for "infinite scroll" / pagination use cases where
   * RTKQ is keeping a single cache entry that is added to over time, in combination
   * with `serializeQueryArgs` returning a fixed cache key and a `merge` callback
   * set to add incoming data to the cache entry each time.
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="forceRefresh: pagination"
   *
   * import { createApi, fetchBaseQuery, defaultSerializeQueryArgs } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   *
   * createApi({
   *  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *  endpoints: (build) => ({
   *    listItems: build.query<string[], number>({
   *      query: (pageNumber) => `/listItems?page=${pageNumber}`,
   *     // Only have one cache entry because the arg always maps to one string
   *     serializeQueryArgs: ({ endpointName }) => {
   *       return endpointName
   *      },
   *      // Always merge incoming data to the cache entry
   *      merge: (currentCache, newItems) => {
   *        currentCache.push(...newItems)
   *      },
   *      // Refetch when the page arg changes
   *      forceRefetch({ currentArg, previousArg }) {
   *        return currentArg !== previousArg
   *      },
   *    }),
   *  }),
   *})
   * ```
   */
  forceRefetch?(params: {
    currentArg: QueryArg | undefined
    previousArg: QueryArg | undefined
    state: RootState<any, any, string>
    endpointState?: QuerySubState<any>
  }): boolean

  /**
   * All of these are `undefined` at runtime, purely to be used in TypeScript declarations!
   */
  Types?: QueryTypes<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>
}

export type QueryDefinition<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> = BaseEndpointDefinition<QueryArg, BaseQuery, ResultType> &
  QueryExtraOptions<TagTypes, ResultType, QueryArg, BaseQuery, ReducerPath>

export interface MutationTypes<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> extends BaseEndpointTypes<QueryArg, BaseQuery, ResultType> {
  /**
   * The endpoint definition type. To be used with some internal generic types.
   * @example
   * ```ts
   * const useMyWrappedHook: UseMutation<typeof api.endpoints.query.Types.MutationDefinition> = ...
   * ```
   */
  MutationDefinition: MutationDefinition<
    QueryArg,
    BaseQuery,
    TagTypes,
    ResultType,
    ReducerPath
  >
  TagTypes: TagTypes
  ReducerPath: ReducerPath
}

export interface MutationExtraOptions<
  TagTypes extends string,
  ResultType,
  QueryArg,
  BaseQuery extends BaseQueryFn,
  ReducerPath extends string = string
> {
  type: DefinitionType.mutation
  /**
   * Used by `mutation` endpoints. Determines which cached data should be either re-fetched or removed from the cache.
   * Expects the same shapes as `providesTags`.
   *
   * @example
   *
   * ```ts
   * // codeblock-meta title="invalidatesTags example"
   * import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
   * interface Post {
   *   id: number
   *   name: string
   * }
   * type PostsResponse = Post[]
   *
   * const api = createApi({
   *   baseQuery: fetchBaseQuery({ baseUrl: '/' }),
   *   tagTypes: ['Posts'],
   *   endpoints: (build) => ({
   *     getPosts: build.query<PostsResponse, void>({
   *       query: () => 'posts',
   *       providesTags: (result) =>
   *         result
   *           ? [
   *               ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
   *               { type: 'Posts', id: 'LIST' },
   *             ]
   *           : [{ type: 'Posts', id: 'LIST' }],
   *     }),
   *     addPost: build.mutation<Post, Partial<Post>>({
   *       query(body) {
   *         return {
   *           url: `posts`,
   *           method: 'POST',
   *           body,
   *         }
   *       },
   *       // highlight-start
   *       invalidatesTags: [{ type: 'Posts', id: 'LIST' }],
   *       // highlight-end
   *     }),
   *   })
   * })
   * ```
   */
  invalidatesTags?: ResultDescription<
    TagTypes,
    ResultType,
    QueryArg,
    BaseQueryError<BaseQuery>,
    BaseQueryMeta<BaseQuery>
  >
  /**
   * Not to be used. A mutation should not provide tags to the cache.
   */
  providesTags?: never

  /**
   * All of these are `undefined` at runtime, purely to be used in TypeScript declarations!
   */
  Types?: MutationTypes<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>
}

export type MutationDefinition<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> = BaseEndpointDefinition<QueryArg, BaseQuery, ResultType> &
  MutationExtraOptions<TagTypes, ResultType, QueryArg, BaseQuery, ReducerPath>

export type EndpointDefinition<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> =
  | QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>
  | MutationDefinition<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>

export type EndpointDefinitions = Record<
  string,
  EndpointDefinition<any, any, any, any>
>

export function isQueryDefinition(
  e: EndpointDefinition<any, any, any, any>
): e is QueryDefinition<any, any, any, any> {
  return e.type === DefinitionType.query
}

export function isMutationDefinition(
  e: EndpointDefinition<any, any, any, any>
): e is MutationDefinition<any, any, any, any> {
  return e.type === DefinitionType.mutation
}

export type EndpointBuilder<
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ReducerPath extends string
> = {
  /**
   * An endpoint definition that retrieves data, and may provide tags to the cache.
   *
   * @example
   * ```js
   * // codeblock-meta title="Example of all query endpoint options"
   * const api = createApi({
   *  baseQuery,
   *  endpoints: (build) => ({
   *    getPost: build.query({
   *      query: (id) => ({ url: `post/${id}` }),
   *      // Pick out data and prevent nested properties in a hook or selector
   *      transformResponse: (response) => response.data,
   *      // Pick out error and prevent nested properties in a hook or selector
   *      transformErrorResponse: (response) => response.error,
   *      // `result` is the server response
   *      providesTags: (result, error, id) => [{ type: 'Post', id }],
   *      // trigger side effects or optimistic updates
   *      onQueryStarted(id, { dispatch, getState, extra, requestId, queryFulfilled, getCacheEntry, updateCachedData }) {},
   *      // handle subscriptions etc
   *      onCacheEntryAdded(id, { dispatch, getState, extra, requestId, cacheEntryRemoved, cacheDataLoaded, getCacheEntry, updateCachedData }) {},
   *    }),
   *  }),
   *});
   *```
   */
  query<ResultType, QueryArg>(
    definition: OmitFromUnion<
      QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>,
      'type'
    >
  ): QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>
  /**
   * An endpoint definition that alters data on the server or will possibly invalidate the cache.
   *
   * @example
   * ```js
   * // codeblock-meta title="Example of all mutation endpoint options"
   * const api = createApi({
   *   baseQuery,
   *   endpoints: (build) => ({
   *     updatePost: build.mutation({
   *       query: ({ id, ...patch }) => ({ url: `post/${id}`, method: 'PATCH', body: patch }),
   *       // Pick out data and prevent nested properties in a hook or selector
   *       transformResponse: (response) => response.data,
   *       // Pick out error and prevent nested properties in a hook or selector
   *       transformErrorResponse: (response) => response.error,
   *       // `result` is the server response
   *       invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
   *      // trigger side effects or optimistic updates
   *      onQueryStarted(id, { dispatch, getState, extra, requestId, queryFulfilled, getCacheEntry }) {},
   *      // handle subscriptions etc
   *      onCacheEntryAdded(id, { dispatch, getState, extra, requestId, cacheEntryRemoved, cacheDataLoaded, getCacheEntry }) {},
   *     }),
   *   }),
   * });
   * ```
   */
  mutation<ResultType, QueryArg>(
    definition: OmitFromUnion<
      MutationDefinition<
        QueryArg,
        BaseQuery,
        TagTypes,
        ResultType,
        ReducerPath
      >,
      'type'
    >
  ): MutationDefinition<QueryArg, BaseQuery, TagTypes, ResultType, ReducerPath>
}

export type AssertTagTypes = <T extends FullTagDescription<string>>(t: T) => T

export function calculateProvidedBy<ResultType, QueryArg, ErrorType, MetaType>(
  description:
    | ResultDescription<string, ResultType, QueryArg, ErrorType, MetaType>
    | undefined,
  result: ResultType | undefined,
  error: ErrorType | undefined,
  queryArg: QueryArg,
  meta: MetaType | undefined,
  assertTagTypes: AssertTagTypes
): readonly FullTagDescription<string>[] {
  if (isFunction(description)) {
    return description(
      result as ResultType,
      error as undefined,
      queryArg,
      meta as MetaType
    )
      .map(expandTagDescription)
      .map(assertTagTypes)
  }
  if (Array.isArray(description)) {
    return description.map(expandTagDescription).map(assertTagTypes)
  }
  return []
}

function isFunction<T>(t: T): t is Extract<T, Function> {
  return typeof t === 'function'
}

export function expandTagDescription(
  description: TagDescription<string>
): FullTagDescription<string> {
  return typeof description === 'string' ? { type: description } : description
}

export type QueryArgFrom<D extends BaseEndpointDefinition<any, any, any>> =
  D extends BaseEndpointDefinition<infer QA, any, any> ? QA : unknown
export type ResultTypeFrom<D extends BaseEndpointDefinition<any, any, any>> =
  D extends BaseEndpointDefinition<any, any, infer RT> ? RT : unknown

export type ReducerPathFrom<
  D extends EndpointDefinition<any, any, any, any, any>
> = D extends EndpointDefinition<any, any, any, any, infer RP> ? RP : unknown

export type TagTypesFrom<D extends EndpointDefinition<any, any, any, any>> =
  D extends EndpointDefinition<any, any, infer RP, any> ? RP : unknown

export type TagTypesFromApi<T> = T extends Api<any, any, any, infer TagTypes>
  ? TagTypes
  : never

export type DefinitionsFromApi<T> = T extends Api<
  any,
  infer Definitions,
  any,
  any
>
  ? Definitions
  : never

export type TransformedResponse<
  NewDefinitions extends EndpointDefinitions,
  K,
  ResultType
> = K extends keyof NewDefinitions
  ? NewDefinitions[K]['transformResponse'] extends undefined
    ? ResultType
    : ReturnType<NonUndefined<NewDefinitions[K]['transformResponse']>>
  : ResultType

export type OverrideResultType<Definition, NewResultType> =
  Definition extends QueryDefinition<
    infer QueryArg,
    infer BaseQuery,
    infer TagTypes,
    any,
    infer ReducerPath
  >
    ? QueryDefinition<QueryArg, BaseQuery, TagTypes, NewResultType, ReducerPath>
    : Definition extends MutationDefinition<
        infer QueryArg,
        infer BaseQuery,
        infer TagTypes,
        any,
        infer ReducerPath
      >
    ? MutationDefinition<
        QueryArg,
        BaseQuery,
        TagTypes,
        NewResultType,
        ReducerPath
      >
    : never

export type UpdateDefinitions<
  Definitions extends EndpointDefinitions,
  NewTagTypes extends string,
  NewDefinitions extends EndpointDefinitions
> = {
  [K in keyof Definitions]: Definitions[K] extends QueryDefinition<
    infer QueryArg,
    infer BaseQuery,
    any,
    infer ResultType,
    infer ReducerPath
  >
    ? QueryDefinition<
        QueryArg,
        BaseQuery,
        NewTagTypes,
        TransformedResponse<NewDefinitions, K, ResultType>,
        ReducerPath
      >
    : Definitions[K] extends MutationDefinition<
        infer QueryArg,
        infer BaseQuery,
        any,
        infer ResultType,
        infer ReducerPath
      >
    ? MutationDefinition<
        QueryArg,
        BaseQuery,
        NewTagTypes,
        TransformedResponse<NewDefinitions, K, ResultType>,
        ReducerPath
      >
    : never
}
