import { joinUrls } from './utils'
import { isPlainObject } from '@reduxjs/toolkit'
import type { BaseQueryApi, BaseQueryFn } from './baseQueryTypes'
import type { MaybePromise, Override } from './tsHelpers'

export type ResponseHandler =
  | 'json'
  | 'text'
  | ((response: Response) => Promise<any>)

type CustomRequestInit = Override<
  RequestInit,
  {
    headers?:
      | Headers
      | string[][]
      | Record<string, string | undefined>
      | undefined
  }
>

export interface FetchArgs extends CustomRequestInit {
  url: string
  params?: Record<string, any>
  body?: any
  responseHandler?: ResponseHandler
  validateStatus?: (response: Response, body: any) => boolean
}

/**
 * A mini-wrapper that passes arguments straight through to
 * {@link [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)}.
 * Avoids storing `fetch` in a closure, in order to permit mocking/monkey-patching.
 */
const defaultFetchFn: typeof fetch = (...args) => fetch(...args)

const defaultValidateStatus = (response: Response) =>
  response.status >= 200 && response.status <= 299

const isJsonContentType = (headers: Headers) =>
  headers.get('content-type')?.trim()?.startsWith('application/json')

const handleResponse = async (
  response: Response,
  responseHandler: ResponseHandler
) => {
  if (typeof responseHandler === 'function') {
    return responseHandler(response)
  }

  if (responseHandler === 'text') {
    return response.text()
  }

  if (responseHandler === 'json') {
    const text = await response.text()
    return text.length ? JSON.parse(text) : null
  }
}

export type FetchBaseQueryError =
  | {
      /**
       * * `number`:
       *   HTTP status code
       */
      status: number
      data: unknown
    }
  | {
      /**
       * * `"FETCH_ERROR"`:
       *   An error that occurred during execution of `fetch` or the `fetchFn` callback option
       **/
      status: 'FETCH_ERROR'
      data?: undefined
      error: string
    }
  | {
      /**
       * * `"PARSING_ERROR"`:
       *   An error happened during parsing.
       *   Most likely a non-JSON-response was returned with the default `responseHandler` "JSON",
       *   or an error occurred while executing a custom `responseHandler`.
       **/
      status: 'PARSING_ERROR'
      originalStatus: number
      data: string
      error: string
    }
  | {
      /**
       * * `"CUSTOM_ERROR"`:
       *   A custom error type that you can return from your `queryFn` where another error might not make sense.
       **/
      status: 'CUSTOM_ERROR'
      data?: unknown
      error: string
    }

function stripUndefined(obj: any) {
  if (!isPlainObject(obj)) {
    return obj
  }
  const copy: Record<string, any> = { ...obj }
  for (const [k, v] of Object.entries(copy)) {
    if (v === undefined) delete copy[k]
  }
  return copy
}

export type FetchBaseQueryArgs = {
  baseUrl?: string
  prepareHeaders?: (
    headers: Headers,
    api: Pick<
      BaseQueryApi,
      'getState' | 'extra' | 'endpoint' | 'type' | 'forced'
    >
  ) => MaybePromise<Headers>
  fetchFn?: (
    input: RequestInfo,
    init?: RequestInit | undefined
  ) => Promise<Response>
  paramsSerializer?: (params: Record<string, any>) => string
} & RequestInit

export type FetchBaseQueryMeta = { request: Request; response?: Response }

/**
 * This is a very small wrapper around fetch that aims to simplify requests.
 *
 * @example
 * ```ts
 * const baseQuery = fetchBaseQuery({
 *   baseUrl: 'https://api.your-really-great-app.com/v1/',
 *   prepareHeaders: (headers, { getState }) => {
 *     const token = (getState() as RootState).auth.token;
 *     // If we have a token set in state, let's assume that we should be passing it.
 *     if (token) {
 *       headers.set('authorization', `Bearer ${token}`);
 *     }
 *     return headers;
 *   },
 * })
 * ```
 *
 * @param {string} baseUrl
 * The base URL for an API service.
 * Typically in the format of https://example.com/
 *
 * @param {(headers: Headers, api: { getState: () => unknown; extra: unknown; endpoint: string; type: 'query' | 'mutation'; forced: boolean; }) => Headers} prepareHeaders
 * An optional function that can be used to inject headers on requests.
 * Provides a Headers object, as well as most of the `BaseQueryApi` (`dispatch` is not available).
 * Useful for setting authentication or headers that need to be set conditionally.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/API/Headers
 *
 * @param {(input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>} fetchFn
 * Accepts a custom `fetch` function if you do not want to use the default on the window.
 * Useful in SSR environments if you need to use a library such as `isomorphic-fetch` or `cross-fetch`
 *
 * @param {(params: Record<string, unknown>) => string} paramsSerializer
 * An optional function that can be used to stringify querystring parameters.
 */
export function fetchBaseQuery({
  baseUrl,
  prepareHeaders = (x) => x,
  fetchFn = defaultFetchFn,
  paramsSerializer,
  ...baseFetchOptions
}: FetchBaseQueryArgs = {}): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> {
  if (typeof fetch === 'undefined' && fetchFn === defaultFetchFn) {
    console.warn(
      'Warning: `fetch` is not available. Please supply a custom `fetchFn` property to use `fetchBaseQuery` on SSR environments.'
    )
  }
  return async (arg, api) => {
    const { signal, getState, extra, endpoint, forced, type } = api
    let meta: FetchBaseQueryMeta | undefined
    let {
      url,
      method = 'GET' as const,
      headers = new Headers({}),
      body = undefined,
      params = undefined,
      responseHandler = 'json' as const,
      validateStatus = defaultValidateStatus,
      ...rest
    } = typeof arg == 'string' ? { url: arg } : arg
    let config: RequestInit = {
      ...baseFetchOptions,
      method,
      signal,
      body,
      ...rest,
    }

    config.headers = await prepareHeaders(
      new Headers(stripUndefined(headers)),
      { getState, extra, endpoint, forced, type }
    )

    // Only set the content-type to json if appropriate. Will not be true for FormData, ArrayBuffer, Blob, etc.
    const isJsonifiable = (body: any) =>
      typeof body === 'object' &&
      (isPlainObject(body) ||
        Array.isArray(body) ||
        typeof body.toJSON === 'function')

    if (!config.headers.has('content-type') && isJsonifiable(body)) {
      config.headers.set('content-type', 'application/json')
    }

    if (isJsonifiable(body) && isJsonContentType(config.headers)) {
      config.body = JSON.stringify(body)
    }

    if (params) {
      const divider = ~url.indexOf('?') ? '&' : '?'
      const query = paramsSerializer
        ? paramsSerializer(params)
        : new URLSearchParams(stripUndefined(params))
      url += divider + query
    }

    url = joinUrls(baseUrl, url)

    const request = new Request(url, config)
    const requestClone = request.clone()
    meta = { request: requestClone }

    let response
    try {
      response = await fetchFn(request)
    } catch (e) {
      return { error: { status: 'FETCH_ERROR', error: String(e) }, meta }
    }
    const responseClone = response.clone()

    meta.response = responseClone

    let resultData: any
    let responseText: string = ''
    try {
      let handleResponseError
      await Promise.all([
        handleResponse(response, responseHandler).then(
          (r) => (resultData = r),
          (e) => (handleResponseError = e)
        ),
        // see https://github.com/node-fetch/node-fetch/issues/665#issuecomment-538995182
        // we *have* to "use up" both streams at the same time or they will stop running in node-fetch scenarios
        responseClone.text().then(
          (r) => (responseText = r),
          () => {}
        ),
      ])
      if (handleResponseError) throw handleResponseError
    } catch (e) {
      return {
        error: {
          status: 'PARSING_ERROR',
          originalStatus: response.status,
          data: responseText,
          error: String(e),
        },
        meta,
      }
    }

    return validateStatus(response, resultData)
      ? {
          data: resultData,
          meta,
        }
      : {
          error: {
            status: response.status,
            data: resultData,
          },
          meta,
        }
  }
}
