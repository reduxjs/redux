import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit'
import type { RootState } from './core/apiState'
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
} from './tsHelpers'
import type { NEVER } from './fakeBaseQuery'

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
   *   endpoints: (build) => ({
   *     getPosts: build.query<PostsResponse, void>({
   *       // highlight-start
   *       query: () => 'posts',
   *       // highlight-end
   *     })
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
    meta: BaseQueryMeta<BaseQuery>
  ): ResultType | Promise<ResultType>
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
   *         return { error: { status: 500, data: "Coin landed on it's edge!" } }
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
  ErrorType
> = (
  result: ResultType | undefined,
  error: ErrorType | undefined,
  arg: QueryArg
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
  ErrorType
> =
  | ReadonlyArray<TagDescription<TagTypes>>
  | GetResultDescriptionFn<TagTypes, ResultType, QueryArg, ErrorType>

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
    BaseQueryError<BaseQuery>
  >
  /**
   * Not to be used. A query should not invalidate tags in the cache.
   */
  invalidatesTags?: never
}

export type QueryDefinition<
  QueryArg,
  BaseQuery extends BaseQueryFn,
  TagTypes extends string,
  ResultType,
  ReducerPath extends string = string
> = BaseEndpointDefinition<QueryArg, BaseQuery, ResultType> &
  QueryExtraOptions<TagTypes, ResultType, QueryArg, BaseQuery, ReducerPath>

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
    BaseQueryError<BaseQuery>
  >
  /**
   * Not to be used. A mutation should not provide tags to the cache.
   */
  providesTags?: never
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
      QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType>,
      'type'
    >
  ): QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType>
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

export function calculateProvidedBy<ResultType, QueryArg, ErrorType>(
  description:
    | ResultDescription<string, ResultType, QueryArg, ErrorType>
    | undefined,
  result: ResultType | undefined,
  error: ErrorType | undefined,
  queryArg: QueryArg,
  assertTagTypes: AssertTagTypes
): readonly FullTagDescription<string>[] {
  if (isFunction(description)) {
    return description(result as ResultType, error as undefined, queryArg)
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

function expandTagDescription(
  description: TagDescription<string>
): FullTagDescription<string> {
  return typeof description === 'string' ? { type: description } : description
}

export type QueryArgFrom<D extends BaseEndpointDefinition<any, any, any>> =
  D extends BaseEndpointDefinition<infer QA, any, any> ? QA : unknown
export type ResultTypeFrom<D extends BaseEndpointDefinition<any, any, any>> =
  D extends BaseEndpointDefinition<any, any, infer RT> ? RT : unknown

export type ReducerPathFrom<D extends EndpointDefinition<any, any, any, any>> =
  D extends EndpointDefinition<any, any, any, infer RP> ? RP : unknown

export type TagTypesFrom<D extends EndpointDefinition<any, any, any, any>> =
  D extends EndpointDefinition<any, any, infer RP, any> ? RP : unknown

export type ReplaceTagTypes<
  Definitions extends EndpointDefinitions,
  NewTagTypes extends string
> = {
  [K in keyof Definitions]: Definitions[K] extends QueryDefinition<
    infer QueryArg,
    infer BaseQuery,
    any,
    infer ResultType,
    infer ReducerPath
  >
    ? QueryDefinition<QueryArg, BaseQuery, NewTagTypes, ResultType, ReducerPath>
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
        ResultType,
        ReducerPath
      >
    : never
}
