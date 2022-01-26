import type { BaseQueryApi } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type { GraphQLClient } from 'graphql-request'

type P = Parameters<GraphQLClient['request']>
export type Document = P[0]
export type Variables = P[1]
export type RequestHeaders = P[2]

export type GraphqlRequestBaseQueryArgs = {
  options:
    | {
        url: string
        requestHeaders?: RequestHeaders
      }
    | { client: GraphQLClient }
  prepareHeaders?: (
    headers: Headers,
    api: Pick<BaseQueryApi, 'getState' | 'endpoint' | 'type' | 'forced'>
  ) => MaybePromise<Headers>
}

export type QueryReturnValue<T = unknown, E = unknown, M = unknown> =
  | {
      error: E
      data?: undefined
      meta?: M
    }
  | {
      error?: undefined
      data: T
      meta?: M
    }
export type MaybePromise<T> = T | PromiseLike<T>
