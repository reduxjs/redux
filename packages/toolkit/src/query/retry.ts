import type { BaseQueryEnhancer } from './baseQueryTypes'
import { HandledError } from './HandledError'

/**
 * Exponential backoff based on the attempt number.
 *
 * @remarks
 * 1. 600ms * random(0.4, 1.4)
 * 2. 1200ms * random(0.4, 1.4)
 * 3. 2400ms * random(0.4, 1.4)
 * 4. 4800ms * random(0.4, 1.4)
 * 5. 9600ms * random(0.4, 1.4)
 *
 * @param attempt - Current attempt
 * @param maxRetries - Maximum number of retries
 */
async function defaultBackoff(attempt: number = 0, maxRetries: number = 5) {
  const attempts = Math.min(attempt, maxRetries)

  const timeout = ~~((Math.random() + 0.4) * (300 << attempts)) // Force a positive int in the case we make this an option
  await new Promise((resolve) =>
    setTimeout((res: any) => resolve(res), timeout)
  )
}

export interface RetryOptions {
  /**
   * How many times the query will be retried (default: 5)
   */
  maxRetries?: number
  /**
   * Function used to determine delay between retries
   */
  backoff?: (attempt: number, maxRetries: number) => Promise<void>
}

function fail(e: any): never {
  throw Object.assign(new HandledError({ error: e }), {
    throwImmediately: true,
  })
}

const retryWithBackoff: BaseQueryEnhancer<
  unknown,
  RetryOptions,
  RetryOptions | void
> = (baseQuery, defaultOptions) => async (args, api, extraOptions) => {
  const options = {
    maxRetries: 5,
    backoff: defaultBackoff,
    ...defaultOptions,
    ...extraOptions,
  }
  let retry = 0

  while (true) {
    try {
      const result = await baseQuery(args, api, extraOptions)
      // baseQueries _should_ return an error property, so we should check for that and throw it to continue retrying
      if (result.error) {
        throw new HandledError(result)
      }
      return result
    } catch (e: any) {
      retry++
      if (e.throwImmediately || retry > options.maxRetries) {
        if (e instanceof HandledError) {
          return e.value
        }

        // We don't know what this is, so we have to rethrow it
        throw e
      }
      await options.backoff(retry, options.maxRetries)
    }
  }
}

/**
 * A utility that can wrap `baseQuery` in the API definition to provide retries with a basic exponential backoff.
 *
 * @example
 *
 * ```ts
 * // codeblock-meta title="Retry every request 5 times by default"
 * import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react'
 * interface Post {
 *   id: number
 *   name: string
 * }
 * type PostsResponse = Post[]
 *
 * // maxRetries: 5 is the default, and can be omitted. Shown for documentation purposes.
 * const staggeredBaseQuery = retry(fetchBaseQuery({ baseUrl: '/' }), { maxRetries: 5 });
 * export const api = createApi({
 *   baseQuery: staggeredBaseQuery,
 *   endpoints: (build) => ({
 *     getPosts: build.query<PostsResponse, void>({
 *       query: () => ({ url: 'posts' }),
 *     }),
 *     getPost: build.query<PostsResponse, string>({
 *       query: (id) => ({ url: `post/${id}` }),
 *       extraOptions: { maxRetries: 8 }, // You can override the retry behavior on each endpoint
 *     }),
 *   }),
 * });
 *
 * export const { useGetPostsQuery, useGetPostQuery } = api;
 * ```
 */
export const retry = /* @__PURE__ */ Object.assign(retryWithBackoff, { fail })
