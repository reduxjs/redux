import { createSlice } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { setupApiStore } from './helpers'
import { server } from './mocks/server'
import { default as crossFetch } from 'cross-fetch'
import { rest } from 'msw'

const defaultHeaders: Record<string, string> = {
  fake: 'header',
  delete: 'true',
  delete2: '1',
}

const baseUrl = 'http://example.com'

// @ts-ignore
const fetchFn = jest.fn<Promise<any>, any[]>(global.fetch)

const baseQuery = fetchBaseQuery({
  baseUrl,
  fetchFn: fetchFn as any,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token

    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    // A user could customize their behavior here, so we'll just test that custom scenarios would work.
    const potentiallyConflictingKeys = Object.keys(defaultHeaders)
    potentiallyConflictingKeys.forEach((key) => {
      // Check for presence of a default key, if the incoming endpoint headers don't specify it as '', then set it
      const existingValue = headers.get(key)
      if (!existingValue && existingValue !== '') {
        headers.set(key, String(defaultHeaders[key]))
        // If an endpoint sets a header with a value of '', just delete the header.
      } else if (headers.get(key) === '') {
        headers.delete(key)
      }
    })

    return headers
  },
})

const api = createApi({
  baseQuery,
  endpoints(build) {
    return {
      query: build.query({ query: () => ({ url: '/echo', headers: {} }) }),
      mutation: build.mutation({
        query: () => ({ url: '/echo', method: 'POST', credentials: 'omit' }),
      }),
    }
  },
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '',
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
  },
})

const storeRef = setupApiStore(api, { auth: authSlice.reducer })
type RootState = ReturnType<typeof storeRef.store.getState>

describe('fetchBaseQuery', () => {
  describe('basic functionality', () => {
    it('should return an object for a simple GET request when it is json data', async () => {
      const req = baseQuery(
        '/success',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.data).toEqual({ value: 'success' })
    })

    it('should return undefined for a simple GET request when the response is empty', async () => {
      const req = baseQuery(
        '/empty',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.data).toBeUndefined()
    })

    it('should return an error and status for error responses', async () => {
      const req = baseQuery(
        '/error',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.error).toEqual({
        status: 500,
        data: { value: 'error' },
      })
    })

    it('should handle a connection loss semi-gracefully', async () => {
      fetchFn.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const req = baseQuery(
        '/success',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBe(undefined)
      expect(res.error).toEqual({
        status: 'FETCH_ERROR',
        error: 'TypeError: Failed to fetch',
      })
    })
  })

  describe('non-JSON-body', () => {
    it('success: should return data ("text" responseHandler)', async () => {
      server.use(
        rest.get('http://example.com/success', (_, res, ctx) =>
          res.once(ctx.text(`this is not json!`))
        )
      )

      const req = baseQuery(
        { url: '/success', responseHandler: 'text' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.data).toEqual(`this is not json!`)
    })

    it('success: should fail gracefully (default="json" responseHandler)', async () => {
      server.use(
        rest.get('http://example.com/success', (_, res, ctx) =>
          res.once(ctx.text(`this is not json!`))
        )
      )

      const req = baseQuery(
        '/success',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.error).toEqual({
        status: 'PARSING_ERROR',
        error: 'SyntaxError: Unexpected token h in JSON at position 1',
        originalStatus: 200,
        data: `this is not json!`,
      })
    })

    it('server error: should fail normally with a 500 status ("text" responseHandler)', async () => {
      server.use(
        rest.get('http://example.com/error', (_, res, ctx) =>
          res(ctx.status(500), ctx.text(`this is not json!`))
        )
      )

      const req = baseQuery(
        { url: '/error', responseHandler: 'text' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.error).toEqual({
        status: 500,
        data: `this is not json!`,
      })
    })

    it('server error: should fail gracefully (default="json" responseHandler)', async () => {
      server.use(
        rest.get('http://example.com/error', (_, res, ctx) =>
          res(ctx.status(500), ctx.text(`this is not json!`))
        )
      )

      const req = baseQuery(
        '/error',
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )
      expect(req).toBeInstanceOf(Promise)
      const res = await req
      expect(res).toBeInstanceOf(Object)
      expect(res.meta?.request).toBeInstanceOf(Request)
      expect(res.meta?.response).toBeInstanceOf(Object)
      expect(res.error).toEqual({
        status: 'PARSING_ERROR',
        error: 'SyntaxError: Unexpected token h in JSON at position 1',
        originalStatus: 500,
        data: `this is not json!`,
      })
    })
  })

  describe('arg.body', () => {
    test('an object provided to body will be serialized when content-type is json', async () => {
      const data = {
        test: 'value',
      }

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', body: data, method: 'POST' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['content-type']).toBe('application/json')
      expect(request.body).toEqual(data)
    })

    test('an array provided to body will be serialized when content-type is json', async () => {
      const data = ['test', 'value']

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', body: data, method: 'POST' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['content-type']).toBe('application/json')
      expect(request.body).toEqual(data)
    })

    test('an object provided to body will not be serialized when content-type is not json', async () => {
      const data = {
        test: 'value',
      }

      let request: any
      ;({ data: request } = await baseQuery(
        {
          url: '/echo',
          body: data,
          method: 'POST',
          headers: { 'content-type': 'text/html' },
        },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['content-type']).toBe('text/html')
      expect(request.body).toEqual('[object Object]')
    })

    test('an array provided to body will not be serialized when content-type is not json', async () => {
      const data = ['test', 'value']

      let request: any
      ;({ data: request } = await baseQuery(
        {
          url: '/echo',
          body: data,
          method: 'POST',
          headers: { 'content-type': 'text/html' },
        },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['content-type']).toBe('text/html')
      expect(request.body).toEqual(data.join(','))
    })
  })

  describe('arg.params', () => {
    it('should not serialize missing params', async () => {
      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.url).toEqual(`${baseUrl}/echo`)
    })

    it('should serialize numeric and boolean params', async () => {
      const params = { a: 1, b: true }

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', params },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.url).toEqual(`${baseUrl}/echo?a=1&b=true`)
    })

    it('should merge params into existing url querystring', async () => {
      const params = { a: 1, b: true }

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo?banana=pudding', params },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.url).toEqual(`${baseUrl}/echo?banana=pudding&a=1&b=true`)
    })

    it('should accept a URLSearchParams instance', async () => {
      const params = new URLSearchParams({ apple: 'fruit' })

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', params },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.url).toEqual(`${baseUrl}/echo?apple=fruit`)
    })

    it('should strip undefined values from the end params', async () => {
      const params = { apple: 'fruit', banana: undefined, randy: null }

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', params },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.url).toEqual(`${baseUrl}/echo?apple=fruit&randy=null`)
    })
  })

  describe('validateStatus', () => {
    test('validateStatus can return an error even on normal 200 responses', async () => {
      // This is a scenario where an API may always return a 200, but indicates there is an error when success = false
      const res = await baseQuery(
        {
          url: '/nonstandard-error',
          validateStatus: (response, body) =>
            response.status === 200 && body.success === false ? false : true,
        },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      )

      expect(res.error).toEqual({
        status: 200,
        data: {
          success: false,
          message: 'This returns a 200 but is really an error',
        },
      })
    })
  })

  describe('arg.headers and prepareHeaders', () => {
    test('uses the default headers set in prepareHeaders', async () => {
      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo' },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['fake']).toBe(defaultHeaders['fake'])
      expect(request.headers['delete']).toBe(defaultHeaders['delete'])
      expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
    })

    test('adds endpoint-level headers to the defaults', async () => {
      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', headers: { authorization: 'Bearer banana' } },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['authorization']).toBe('Bearer banana')
      expect(request.headers['fake']).toBe(defaultHeaders['fake'])
      expect(request.headers['delete']).toBe(defaultHeaders['delete'])
      expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
    })

    test('it does not set application/json when content-type is set', async () => {
      let request: any
      ;({ data: request } = await baseQuery(
        {
          url: '/echo',
          headers: {
            authorization: 'Bearer banana',
            'content-type': 'custom-content-type',
          },
        },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['authorization']).toBe('Bearer banana')
      expect(request.headers['content-type']).toBe('custom-content-type')
      expect(request.headers['fake']).toBe(defaultHeaders['fake'])
      expect(request.headers['delete']).toBe(defaultHeaders['delete'])
      expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
    })

    test('respects the headers from an endpoint over the base headers', async () => {
      const fake = 'fake endpoint value'

      let request: any
      ;({ data: request } = await baseQuery(
        { url: '/echo', headers: { fake, delete: '', delete2: '' } },
        {
          signal: new AbortController().signal,
          dispatch: storeRef.store.dispatch,
          getState: storeRef.store.getState,
          extra: undefined,
        },
        {}
      ))

      expect(request.headers['fake']).toBe(fake)
      expect(request.headers['delete']).toBeUndefined()
      expect(request.headers['delete2']).toBeUndefined()
    })

    test('prepareHeaders is able to be an async function', async () => {
      let request: any

      const token = 'accessToken'
      const getAccessTokenAsync = async () => token

      const _baseQuery = fetchBaseQuery({
        baseUrl,
        prepareHeaders: async (headers) => {
          headers.set('authorization', `Bearer ${await getAccessTokenAsync()}`)
          return headers
        },
      })

      const doRequest = async () =>
        _baseQuery(
          { url: '/echo' },
          {
            signal: new AbortController().signal,
            dispatch: storeRef.store.dispatch,
            getState: storeRef.store.getState,
            extra: undefined,
          },
          {}
        )

      ;({ data: request } = await doRequest())

      expect(request.headers['authorization']).toBe(`Bearer ${token}`)
    })

    test('prepareHeaders is able to select from a state', async () => {
      let request: any

      const doRequest = async () =>
        baseQuery(
          { url: '/echo' },
          {
            signal: new AbortController().signal,
            dispatch: storeRef.store.dispatch,
            getState: storeRef.store.getState,
            extra: undefined,
          },
          {}
        )

      ;({ data: request } = await doRequest())

      expect(request.headers['authorization']).toBeUndefined()

      // Set a token and the follow up request should have the header injected by prepareHeaders
      const token = 'fakeToken!'
      storeRef.store.dispatch(authSlice.actions.setToken(token))
      ;({ data: request } = await doRequest())

      expect(request.headers['authorization']).toBe(`Bearer ${token}`)
    })
  })

  test('lets a header be undefined', async () => {
    let request: any
    ;({ data: request } = await baseQuery(
      { url: '/echo', headers: undefined },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    ))

    expect(request.headers['fake']).toBe(defaultHeaders['fake'])
    expect(request.headers['delete']).toBe(defaultHeaders['delete'])
    expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
  })

  test('allows for possibly undefined header key/values', async () => {
    const banana = '1' as '1' | undefined
    let request: any
    ;({ data: request } = await baseQuery(
      { url: '/echo', headers: { banana } },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    ))

    expect(request.headers['banana']).toBe('1')
    expect(request.headers['fake']).toBe(defaultHeaders['fake'])
    expect(request.headers['delete']).toBe(defaultHeaders['delete'])
    expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
  })

  test('strips undefined values from the headers', async () => {
    const banana = undefined as '1' | undefined
    let request: any
    ;({ data: request } = await baseQuery(
      { url: '/echo', headers: { banana } },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    ))

    expect(request.headers['banana']).toBeUndefined()
    expect(request.headers['fake']).toBe(defaultHeaders['fake'])
    expect(request.headers['delete']).toBe(defaultHeaders['delete'])
    expect(request.headers['delete2']).toBe(defaultHeaders['delete2'])
  })
})

describe('fetchFn', () => {
  test('accepts a custom fetchFn', async () => {
    const baseUrl = 'http://example.com'
    const params = new URLSearchParams({ apple: 'fruit' })

    const baseQuery = fetchBaseQuery({
      baseUrl,
      fetchFn: crossFetch,
    })

    let request: any
    ;({ data: request } = await baseQuery(
      { url: '/echo', params },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    ))

    expect(request.url).toEqual(`${baseUrl}/echo?apple=fruit`)
  })

  test('respects mocking window.fetch after a fetch base query is created', async () => {
    const baseUrl = 'http://example.com'
    const baseQuery = fetchBaseQuery({ baseUrl })

    const fakeResponse = {
      ok: true,
      status: 200,
      text: async () => `{ "url": "mock-return-url" }`,
      clone: () => fakeResponse,
    }

    const spiedFetch = jest.spyOn(window, 'fetch')
    spiedFetch.mockResolvedValueOnce(fakeResponse as any)

    const { data } = await baseQuery(
      { url: '/echo' },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    )
    expect(data).toEqual({ url: 'mock-return-url' })

    spiedFetch.mockClear()
  })
})

describe('FormData', () => {
  test('sets the right headers when sending FormData', async () => {
    const body = new FormData()
    body.append('username', 'test')
    body.append(
      'file',
      new Blob([JSON.stringify({ hello: 'there' }, null, 2)], {
        type: 'application/json',
      })
    )

    const res = await baseQuery(
      { url: '/echo', method: 'POST', body },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    )
    const request: any = res.data
    expect(request.headers['content-type']).not.toContain('application/json')
  })
})

describe('still throws on completely unexpected errors', () => {
  test('', async () => {
    const error = new Error('some unexpected error')
    const req = baseQuery(
      {
        url: '/success',
        validateStatus() {
          throw error
        },
      },
      {
        signal: new AbortController().signal,
        dispatch: storeRef.store.dispatch,
        getState: storeRef.store.getState,
        extra: undefined,
      },
      {}
    )
    expect(req).toBeInstanceOf(Promise)
    await expect(req).rejects.toBe(error)
  })
})
