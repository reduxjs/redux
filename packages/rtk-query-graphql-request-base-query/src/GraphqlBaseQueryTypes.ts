import type { BaseQueryApi } from '@reduxjs/toolkit/dist/query/baseQueryTypes'
import type {
  GraphQLClient,
  RequestOptions,
  RequestDocument,
  ClientError
} from 'graphql-request'

export type Document = RequestDocument
export type RequestHeaders = RequestOptions['requestHeaders']
export type PrepareHeaders = (
  headers: Headers,
  api: Pick<BaseQueryApi, 'getState' | 'endpoint' | 'type' | 'forced' | 'extra'>
) => MaybePromise<Headers>

export type ErrorResponse = {
  message: string;
  stack: string;
  name: string;
};

export type GraphqlRequestBaseQueryArgs<E = ErrorResponse> = (
  | {
      url: string
    }
  | { client: GraphQLClient }
) & {
  requestHeaders?: RequestHeaders
  prepareHeaders?: PrepareHeaders,
  customErrors?: (args: ClientError) =>  E;
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
