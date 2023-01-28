import { configureStore, createAction, createReducer } from '@reduxjs/toolkit'
import type {
  Api,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/dist/query/fetchBaseQuery'

import {
  ANY,
  expectType,
  expectExactType,
  setupApiStore,
  waitMs,
  getSerializedHeaders,
} from './helpers'
import { server } from './mocks/server'
import { rest } from 'msw'
import type { SerializeQueryArgs } from '../defaultSerializeQueryArgs'
import { string } from 'yargs'

const originalEnv = process.env.NODE_ENV
beforeAll(() => void ((process.env as any).NODE_ENV = 'development'))
afterAll(() => void ((process.env as any).NODE_ENV = originalEnv))

let spy: jest.SpyInstance
beforeAll(() => {
  spy = jest.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  spy.mockReset()
})
afterAll(() => {
  spy.mockRestore()
})

function paginate<T>(array: T[], page_size: number, page_number: number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size)
}

test('sensible defaults', () => {
  const api = createApi({
    baseQuery: fetchBaseQuery(),
    endpoints: (build) => ({
      getUser: build.query<unknown, void>({
        query(id) {
          return { url: `user/${id}` }
        },
      }),
      updateUser: build.mutation<unknown, void>({
        query: () => '',
      }),
    }),
  })
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (gDM) => gDM().concat(api.middleware),
  })
  expect(api.reducerPath).toBe('api')

  expectType<'api'>(api.reducerPath)
  type TagTypes = typeof api extends Api<any, any, any, infer E>
    ? E
    : 'no match'
  expectType<TagTypes>(ANY as never)
  // @ts-expect-error
  expectType<TagTypes>(0)

  expect(api.endpoints.getUser.name).toBe('getUser')
  expect(api.endpoints.updateUser.name).toBe('updateUser')
})

describe('wrong tagTypes log errors', () => {
  const baseQuery = jest.fn()
  const api = createApi({
    baseQuery,
    tagTypes: ['User'],
    endpoints: (build) => ({
      provideNothing: build.query<unknown, void>({
        query: () => '',
      }),
      provideTypeString: build.query<unknown, void>({
        query: () => '',
        providesTags: ['User'],
      }),
      provideTypeWithId: build.query<unknown, void>({
        query: () => '',
        providesTags: [{ type: 'User', id: 5 }],
      }),
      provideTypeWithIdAndCallback: build.query<unknown, void>({
        query: () => '',
        providesTags: () => [{ type: 'User', id: 5 }],
      }),
      provideWrongTypeString: build.query<unknown, void>({
        query: () => '',
        // @ts-expect-error
        providesTags: ['Users'],
      }),
      provideWrongTypeWithId: build.query<unknown, void>({
        query: () => '',
        // @ts-expect-error
        providesTags: [{ type: 'Users', id: 5 }],
      }),
      provideWrongTypeWithIdAndCallback: build.query<unknown, void>({
        query: () => '',
        // @ts-expect-error
        providesTags: () => [{ type: 'Users', id: 5 }],
      }),
      invalidateNothing: build.query<unknown, void>({
        query: () => '',
      }),
      invalidateTypeString: build.mutation<unknown, void>({
        query: () => '',
        invalidatesTags: ['User'],
      }),
      invalidateTypeWithId: build.mutation<unknown, void>({
        query: () => '',
        invalidatesTags: [{ type: 'User', id: 5 }],
      }),
      invalidateTypeWithIdAndCallback: build.mutation<unknown, void>({
        query: () => '',
        invalidatesTags: () => [{ type: 'User', id: 5 }],
      }),

      invalidateWrongTypeString: build.mutation<unknown, void>({
        query: () => '',
        // @ts-expect-error
        invalidatesTags: ['Users'],
      }),
      invalidateWrongTypeWithId: build.mutation<unknown, void>({
        query: () => '',
        // @ts-expect-error
        invalidatesTags: [{ type: 'Users', id: 5 }],
      }),
      invalidateWrongTypeWithIdAndCallback: build.mutation<unknown, void>({
        query: () => '',
        // @ts-expect-error
        invalidatesTags: () => [{ type: 'Users', id: 5 }],
      }),
    }),
  })
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (gDM) => gDM().concat(api.middleware),
  })

  beforeEach(() => {
    baseQuery.mockResolvedValue({ data: 'foo' })
  })

  test.each<[keyof typeof api.endpoints, boolean?]>([
    ['provideNothing', false],
    ['provideTypeString', false],
    ['provideTypeWithId', false],
    ['provideTypeWithIdAndCallback', false],
    ['provideWrongTypeString', true],
    ['provideWrongTypeWithId', true],
    ['provideWrongTypeWithIdAndCallback', true],
    ['invalidateNothing', false],
    ['invalidateTypeString', false],
    ['invalidateTypeWithId', false],
    ['invalidateTypeWithIdAndCallback', false],
    ['invalidateWrongTypeString', true],
    ['invalidateWrongTypeWithId', true],
    ['invalidateWrongTypeWithIdAndCallback', true],
  ])(`endpoint %s should log an error? %s`, async (endpoint, shouldError) => {
    // @ts-ignore
    store.dispatch(api.endpoints[endpoint].initiate())
    let result: { status: string }
    do {
      await waitMs(5)
      // @ts-ignore
      result = api.endpoints[endpoint].select()(store.getState())
    } while (result.status === 'pending')

    if (shouldError) {
      expect(spy).toHaveBeenCalledWith(
        "Tag type 'Users' was used, but not specified in `tagTypes`!"
      )
    } else {
      expect(spy).not.toHaveBeenCalled()
    }
  })
})

describe('endpoint definition typings', () => {
  const api = createApi({
    baseQuery: (from: 'From'): { data: 'To' } | Promise<{ data: 'To' }> => ({
      data: 'To',
    }),
    endpoints: () => ({}),
    tagTypes: ['typeA', 'typeB'],
  })
  test('query: query & transformResponse types', () => {
    api.injectEndpoints({
      endpoints: (build) => ({
        query: build.query<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query1: build.query<'RetVal', 'Arg'>({
          // @ts-expect-error
          query: (x: 'Error') => 'From' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query2: build.query<'RetVal', 'Arg'>({
          // @ts-expect-error
          query: (x: 'Arg') => 'Error' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query3: build.query<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          // @ts-expect-error
          transformResponse(r: 'Error') {
            return 'RetVal' as const
          },
        }),
        query4: build.query<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          // @ts-expect-error
          transformResponse(r: 'To') {
            return 'Error' as const
          },
        }),
        queryInference1: build.query<'RetVal', 'Arg'>({
          query: (x) => {
            expectType<'Arg'>(x)
            return 'From'
          },
          transformResponse(r) {
            expectType<'To'>(r)
            return 'RetVal'
          },
        }),
        queryInference2: (() => {
          const query = build.query({
            query: (x: 'Arg') => 'From' as const,
            transformResponse(r: 'To') {
              return 'RetVal' as const
            },
          })
          expectType<QueryDefinition<'Arg', any, any, 'RetVal'>>(query)
          return query
        })(),
      }),
    })
  })
  test('mutation: query & transformResponse types', () => {
    api.injectEndpoints({
      endpoints: (build) => ({
        query: build.mutation<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query1: build.mutation<'RetVal', 'Arg'>({
          // @ts-expect-error
          query: (x: 'Error') => 'From' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query2: build.mutation<'RetVal', 'Arg'>({
          // @ts-expect-error
          query: (x: 'Arg') => 'Error' as const,
          transformResponse(r: 'To') {
            return 'RetVal' as const
          },
        }),
        query3: build.mutation<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          // @ts-expect-error
          transformResponse(r: 'Error') {
            return 'RetVal' as const
          },
        }),
        query4: build.mutation<'RetVal', 'Arg'>({
          query: (x: 'Arg') => 'From' as const,
          // @ts-expect-error
          transformResponse(r: 'To') {
            return 'Error' as const
          },
        }),
        mutationInference1: build.mutation<'RetVal', 'Arg'>({
          query: (x) => {
            expectType<'Arg'>(x)
            return 'From'
          },
          transformResponse(r) {
            expectType<'To'>(r)
            return 'RetVal'
          },
        }),
        mutationInference2: (() => {
          const query = build.mutation({
            query: (x: 'Arg') => 'From' as const,
            transformResponse(r: 'To') {
              return 'RetVal' as const
            },
          })
          expectType<MutationDefinition<'Arg', any, any, 'RetVal'>>(query)
          return query
        })(),
      }),
    })
  })

  describe('enhancing endpoint definitions', () => {
    const baseQuery = jest.fn((x: string) => ({ data: 'success' }))
    const commonBaseQueryApi = {
      dispatch: expect.any(Function),
      endpoint: expect.any(String),
      abort: expect.any(Function),
      extra: undefined,
      forced: expect.any(Boolean),
      getState: expect.any(Function),
      signal: expect.any(Object),
      type: expect.any(String),
    }
    beforeEach(() => {
      baseQuery.mockClear()
    })
    function getNewApi() {
      return createApi({
        baseQuery,
        tagTypes: ['old'],
        endpoints: (build) => ({
          query1: build.query<'out1', 'in1'>({ query: (id) => `${id}` }),
          query2: build.query<'out2', 'in2'>({ query: (id) => `${id}` }),
          mutation1: build.mutation<'out1', 'in1'>({ query: (id) => `${id}` }),
          mutation2: build.mutation<'out2', 'in2'>({ query: (id) => `${id}` }),
        }),
      })
    }
    let api = getNewApi()
    beforeEach(() => {
      api = getNewApi()
    })

    test('pre-modification behaviour', async () => {
      const storeRef = setupApiStore(api, undefined, {
        withoutTestLifecycles: true,
      })
      storeRef.store.dispatch(api.endpoints.query1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.query2.initiate('in2'))
      storeRef.store.dispatch(api.endpoints.mutation1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.mutation2.initiate('in2'))

      expect(baseQuery.mock.calls).toEqual([
        [
          'in1',
          {
            dispatch: expect.any(Function),
            endpoint: expect.any(String),
            getState: expect.any(Function),
            signal: expect.any(Object),
            abort: expect.any(Function),
            forced: expect.any(Boolean),
            type: expect.any(String),
          },
          undefined,
        ],
        [
          'in2',
          {
            dispatch: expect.any(Function),
            endpoint: expect.any(String),
            getState: expect.any(Function),
            signal: expect.any(Object),
            abort: expect.any(Function),
            forced: expect.any(Boolean),
            type: expect.any(String),
          },
          undefined,
        ],
        [
          'in1',
          {
            dispatch: expect.any(Function),
            endpoint: expect.any(String),
            getState: expect.any(Function),
            signal: expect.any(Object),
            abort: expect.any(Function),
            // forced: undefined,
            type: expect.any(String),
          },
          undefined,
        ],
        [
          'in2',
          {
            dispatch: expect.any(Function),
            endpoint: expect.any(String),
            getState: expect.any(Function),
            signal: expect.any(Object),
            abort: expect.any(Function),
            // forced: undefined,
            type: expect.any(String),
          },
          undefined,
        ],
      ])
    })

    test('warn on wrong tagType', async () => {
      const storeRef = setupApiStore(api, undefined, {
        withoutTestLifecycles: true,
      })
      // only type-test this part
      if (2 > 1) {
        api.enhanceEndpoints({
          endpoints: {
            query1: {
              // @ts-expect-error
              providesTags: ['new'],
            },
            query2: {
              // @ts-expect-error
              providesTags: ['missing'],
            },
          },
        })
      }

      const enhanced = api.enhanceEndpoints({
        addTagTypes: ['new'],
        endpoints: {
          query1: {
            providesTags: ['new'],
          },
          query2: {
            // @ts-expect-error
            providesTags: ['missing'],
          },
        },
      })

      storeRef.store.dispatch(api.endpoints.query1.initiate('in1'))
      await waitMs(1)
      expect(spy).not.toHaveBeenCalled()

      storeRef.store.dispatch(api.endpoints.query2.initiate('in2'))
      await waitMs(1)
      expect(spy).toHaveBeenCalledWith(
        "Tag type 'missing' was used, but not specified in `tagTypes`!"
      )

      // only type-test this part
      if (2 > 1) {
        enhanced.enhanceEndpoints({
          endpoints: {
            query1: {
              // returned `enhanced` api contains "new" enitityType
              providesTags: ['new'],
            },
            query2: {
              // @ts-expect-error
              providesTags: ['missing'],
            },
          },
        })
      }
    })

    test('modify', () => {
      const storeRef = setupApiStore(api, undefined, {
        withoutTestLifecycles: true,
      })
      api.enhanceEndpoints({
        endpoints: {
          query1: {
            query: (x) => {
              expectExactType('in1' as const)(x)
              return 'modified1'
            },
          },
          query2(definition) {
            definition.query = (x) => {
              expectExactType('in2' as const)(x)
              return 'modified2'
            }
          },
          mutation1: {
            query: (x) => {
              expectExactType('in1' as const)(x)
              return 'modified1'
            },
          },
          mutation2(definition) {
            definition.query = (x) => {
              expectExactType('in2' as const)(x)
              return 'modified2'
            }
          },
          // @ts-expect-error
          nonExisting: {},
        },
      })

      storeRef.store.dispatch(api.endpoints.query1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.query2.initiate('in2'))
      storeRef.store.dispatch(api.endpoints.mutation1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.mutation2.initiate('in2'))

      expect(baseQuery.mock.calls).toEqual([
        ['modified1', commonBaseQueryApi, undefined],
        ['modified2', commonBaseQueryApi, undefined],
        ['modified1', { ...commonBaseQueryApi, forced: undefined }, undefined],
        ['modified2', { ...commonBaseQueryApi, forced: undefined }, undefined],
      ])
    })
  })
})

describe('additional transformResponse behaviors', () => {
  type SuccessResponse = { value: 'success' }
  type EchoResponseData = { banana: 'bread' }
  type ErrorResponse = { value: 'error' }
  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
    endpoints: (build) => ({
      echo: build.mutation({
        query: () => ({ method: 'PUT', url: '/echo' }),
      }),
      mutation: build.mutation({
        query: () => ({
          url: '/echo',
          method: 'POST',
          body: { nested: { banana: 'bread' } },
        }),
        transformResponse: (response: { body: { nested: EchoResponseData } }) =>
          response.body.nested,
      }),
      mutationWithError: build.mutation({
        query: () => ({
          url: '/error',
          method: 'POST',
        }),
        transformErrorResponse: (response) => {
          const data = response.data as ErrorResponse
          return data.value
        },
      }),
      mutationWithMeta: build.mutation({
        query: () => ({
          url: '/echo',
          method: 'POST',
          body: { nested: { banana: 'bread' } },
        }),
        transformResponse: (
          response: { body: { nested: EchoResponseData } },
          meta
        ) => {
          return {
            ...response.body.nested,
            meta: {
              request: { headers: getSerializedHeaders(meta?.request.headers) },
              response: {
                headers: getSerializedHeaders(meta?.response?.headers),
              },
            },
          }
        },
      }),
      query: build.query<SuccessResponse & EchoResponseData, void>({
        query: () => '/success',
        transformResponse: async (response: SuccessResponse) => {
          const res = await fetch('https://example.com/echo', {
            method: 'POST',
            body: JSON.stringify({ banana: 'bread' }),
          }).then((res) => res.json())
          const additionalData = JSON.parse(res.body) as EchoResponseData
          return { ...response, ...additionalData }
        },
      }),
      queryWithMeta: build.query<SuccessResponse, void>({
        query: () => '/success',
        transformResponse: async (response: SuccessResponse, meta) => {
          return {
            ...response,
            meta: {
              request: { headers: getSerializedHeaders(meta?.request.headers) },
              response: {
                headers: getSerializedHeaders(meta?.response?.headers),
              },
            },
          }
        },
      }),
    }),
  })

  const storeRef = setupApiStore(api)

  test('transformResponse handles an async transformation and returns the merged data (query)', async () => {
    const result = await storeRef.store.dispatch(api.endpoints.query.initiate())

    expect(result.data).toEqual({ value: 'success', banana: 'bread' })
  })

  test('transformResponse transforms a response from a mutation', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.mutation.initiate({})
    )

    expect('data' in result && result.data).toEqual({ banana: 'bread' })
  })

  test('transformResponse transforms a response from a mutation with an error', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.mutationWithError.initiate({})
    )

    expect('error' in result && result.error).toEqual('error')
  })

  test('transformResponse can inject baseQuery meta into the end result from a mutation', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.mutationWithMeta.initiate({})
    )

    expect('data' in result && result.data).toEqual({
      banana: 'bread',
      meta: {
        request: {
          headers: {
            'content-type': 'application/json',
          },
        },
        response: {
          headers: {
            'content-type': 'application/json',
            'x-powered-by': 'msw',
          },
        },
      },
    })
  })

  test('transformResponse can inject baseQuery meta into the end result from a query', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.queryWithMeta.initiate()
    )

    expect(result.data).toEqual({
      value: 'success',
      meta: {
        request: {
          headers: {},
        },
        response: {
          headers: {
            'content-type': 'application/json',
            'x-powered-by': 'msw',
          },
        },
      },
    })
  })
})

describe('query endpoint lifecycles - onStart, onSuccess, onError', () => {
  const initialState = {
    count: null as null | number,
  }
  const setCount = createAction<number>('setCount')
  const testReducer = createReducer(initialState, (builder) => {
    builder.addCase(setCount, (state, action) => {
      state.count = action.payload
    })
  })

  type SuccessResponse = { value: 'success' }
  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
    endpoints: (build) => ({
      echo: build.mutation({
        query: () => ({ method: 'PUT', url: '/echo' }),
      }),
      query: build.query<SuccessResponse, void>({
        query: () => '/success',
        async onQueryStarted(_, api) {
          api.dispatch(setCount(0))
          try {
            await api.queryFulfilled
            api.dispatch(setCount(1))
          } catch {
            api.dispatch(setCount(-1))
          }
        },
      }),
      mutation: build.mutation<SuccessResponse, void>({
        query: () => ({ url: '/success', method: 'POST' }),
        async onQueryStarted(_, api) {
          api.dispatch(setCount(0))
          try {
            await api.queryFulfilled
            api.dispatch(setCount(1))
          } catch {
            api.dispatch(setCount(-1))
          }
        },
      }),
    }),
  })

  const storeRef = setupApiStore(api, { testReducer })

  test('query lifecycle events fire properly', async () => {
    // We intentionally fail the first request so we can test all lifecycles
    server.use(
      rest.get('https://example.com/success', (_, res, ctx) =>
        res.once(ctx.status(500), ctx.json({ value: 'failed' }))
      )
    )

    expect(storeRef.store.getState().testReducer.count).toBe(null)
    const failAttempt = storeRef.store.dispatch(api.endpoints.query.initiate())
    expect(storeRef.store.getState().testReducer.count).toBe(0)
    await failAttempt
    await waitMs(10)
    expect(storeRef.store.getState().testReducer.count).toBe(-1)

    const successAttempt = storeRef.store.dispatch(
      api.endpoints.query.initiate()
    )
    expect(storeRef.store.getState().testReducer.count).toBe(0)
    await successAttempt
    await waitMs(10)
    expect(storeRef.store.getState().testReducer.count).toBe(1)
  })

  test('mutation lifecycle events fire properly', async () => {
    // We intentionally fail the first request so we can test all lifecycles
    server.use(
      rest.post('https://example.com/success', (_, res, ctx) =>
        res.once(ctx.status(500), ctx.json({ value: 'failed' }))
      )
    )

    expect(storeRef.store.getState().testReducer.count).toBe(null)
    const failAttempt = storeRef.store.dispatch(
      api.endpoints.mutation.initiate()
    )
    expect(storeRef.store.getState().testReducer.count).toBe(0)
    await failAttempt
    expect(storeRef.store.getState().testReducer.count).toBe(-1)

    const successAttempt = storeRef.store.dispatch(
      api.endpoints.mutation.initiate()
    )
    expect(storeRef.store.getState().testReducer.count).toBe(0)
    await successAttempt
    expect(storeRef.store.getState().testReducer.count).toBe(1)
  })
})

test('providesTags and invalidatesTags can use baseQueryMeta', async () => {
  let _meta: FetchBaseQueryMeta | undefined

  type SuccessResponse = { value: 'success' }

  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
    tagTypes: ['success'],
    endpoints: (build) => ({
      query: build.query<SuccessResponse, void>({
        query: () => '/success',
        providesTags: (_result, _error, _arg, meta) => {
          _meta = meta
          return ['success']
        },
      }),
      mutation: build.mutation<SuccessResponse, void>({
        query: () => ({ url: '/success', method: 'POST' }),
        invalidatesTags: (_result, _error, _arg, meta) => {
          _meta = meta
          return ['success']
        },
      }),
    }),
  })

  const storeRef = setupApiStore(api, undefined, {
    withoutTestLifecycles: true,
  })

  await storeRef.store.dispatch(api.endpoints.query.initiate())
  expect('request' in _meta! && 'response' in _meta!).toBe(true)

  _meta = undefined

  await storeRef.store.dispatch(api.endpoints.mutation.initiate())

  expect('request' in _meta! && 'response' in _meta!).toBe(true)
})

describe('structuralSharing flag behaviors', () => {
  type SuccessResponse = { value: 'success' }

  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
    tagTypes: ['success'],
    endpoints: (build) => ({
      enabled: build.query<SuccessResponse, void>({
        query: () => '/success',
      }),
      disabled: build.query<SuccessResponse, void>({
        query: () => ({ url: '/success' }),
        structuralSharing: false,
      }),
    }),
  })

  const storeRef = setupApiStore(api)

  it('enables structural sharing for query endpoints by default', async () => {
    await storeRef.store.dispatch(api.endpoints.enabled.initiate())
    const firstRef = api.endpoints.enabled.select()(storeRef.store.getState())

    await storeRef.store.dispatch(
      api.endpoints.enabled.initiate(undefined, { forceRefetch: true })
    )

    const secondRef = api.endpoints.enabled.select()(storeRef.store.getState())

    expect(firstRef.requestId).not.toEqual(secondRef.requestId)
    expect(firstRef.data === secondRef.data).toBeTruthy()
  })

  it('allows a query endpoint to opt-out of structural sharing', async () => {
    await storeRef.store.dispatch(api.endpoints.disabled.initiate())
    const firstRef = api.endpoints.disabled.select()(storeRef.store.getState())

    await storeRef.store.dispatch(
      api.endpoints.disabled.initiate(undefined, { forceRefetch: true })
    )

    const secondRef = api.endpoints.disabled.select()(storeRef.store.getState())

    expect(firstRef.requestId).not.toEqual(secondRef.requestId)
    expect(firstRef.data === secondRef.data).toBeFalsy()
  })
})

describe('custom serializeQueryArgs per endpoint', () => {
  const customArgsSerializer: SerializeQueryArgs<number> = ({
    endpointName,
    queryArgs,
  }) => `${endpointName}-${queryArgs}`

  type SuccessResponse = { value: 'success' }

  const serializer1 = jest.fn(customArgsSerializer)

  interface MyApiClient {
    fetchPost: (id: string) => Promise<SuccessResponse>
  }

  const dummyClient: MyApiClient = {
    async fetchPost(id) {
      return { value: 'success' }
    },
  }

  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
    serializeQueryArgs: ({ endpointName, queryArgs }) =>
      `base-${endpointName}-${queryArgs}`,
    endpoints: (build) => ({
      queryWithNoSerializer: build.query<SuccessResponse, number>({
        query: (arg) => `${arg}`,
      }),
      queryWithCustomSerializer: build.query<SuccessResponse, number>({
        query: (arg) => `${arg}`,
        serializeQueryArgs: serializer1,
      }),
      queryWithCustomObjectSerializer: build.query<
        SuccessResponse,
        { id: number; client: MyApiClient }
      >({
        query: (arg) => `${arg.id}`,
        serializeQueryArgs: ({
          endpointDefinition,
          endpointName,
          queryArgs,
        }) => {
          const { id } = queryArgs
          return { id }
        },
      }),
      queryWithCustomNumberSerializer: build.query<
        SuccessResponse,
        { id: number; client: MyApiClient }
      >({
        query: (arg) => `${arg.id}`,
        serializeQueryArgs: ({
          endpointDefinition,
          endpointName,
          queryArgs,
        }) => {
          const { id } = queryArgs
          return id
        },
      }),
      listItems: build.query<string[], number>({
        query: (pageNumber) => `/listItems?page=${pageNumber}`,
        serializeQueryArgs: ({ endpointName }) => {
          return endpointName
        },
        merge: (currentCache, newItems) => {
          currentCache.push(...newItems)
        },
        forceRefetch({ currentArg, previousArg }) {
          return currentArg !== previousArg
        },
      }),
      listItems2: build.query<{ items: string[]; meta?: any }, number>({
        query: (pageNumber) => `/listItems2?page=${pageNumber}`,
        serializeQueryArgs: ({ endpointName }) => {
          return endpointName
        },
        transformResponse(items: string[]) {
          return { items }
        },
        merge: (currentCache, newData, meta) => {
          currentCache.items.push(...newData.items)
          currentCache.meta = meta
        },
        forceRefetch({ currentArg, previousArg }) {
          return currentArg !== previousArg
        },
      }),
    }),
  })

  const storeRef = setupApiStore(api)

  it('Works via createApi', async () => {
    await storeRef.store.dispatch(
      api.endpoints.queryWithNoSerializer.initiate(99)
    )

    expect(serializer1).toHaveBeenCalledTimes(0)

    await storeRef.store.dispatch(
      api.endpoints.queryWithCustomSerializer.initiate(42)
    )

    expect(serializer1).toHaveBeenCalled()

    expect(
      storeRef.store.getState().api.queries['base-queryWithNoSerializer-99']
    ).toBeTruthy()

    expect(
      storeRef.store.getState().api.queries['queryWithCustomSerializer-42']
    ).toBeTruthy()
  })

  const serializer2 = jest.fn(customArgsSerializer)

  const injectedApi = api.injectEndpoints({
    endpoints: (build) => ({
      injectedQueryWithCustomSerializer: build.query<SuccessResponse, number>({
        query: (arg) => `${arg}`,
        serializeQueryArgs: serializer2,
      }),
    }),
  })

  it('Works via injectEndpoints', async () => {
    expect(serializer2).toHaveBeenCalledTimes(0)

    await storeRef.store.dispatch(
      injectedApi.endpoints.injectedQueryWithCustomSerializer.initiate(5)
    )

    expect(serializer2).toHaveBeenCalled()
    expect(
      storeRef.store.getState().api.queries[
        'injectedQueryWithCustomSerializer-5'
      ]
    ).toBeTruthy()
  })

  test('Serializes a returned object for query args', async () => {
    await storeRef.store.dispatch(
      api.endpoints.queryWithCustomObjectSerializer.initiate({
        id: 42,
        client: dummyClient,
      })
    )

    expect(
      storeRef.store.getState().api.queries[
        'queryWithCustomObjectSerializer({"id":42})'
      ]
    ).toBeTruthy()
  })

  test('Serializes a returned primitive for query args', async () => {
    await storeRef.store.dispatch(
      api.endpoints.queryWithCustomNumberSerializer.initiate({
        id: 42,
        client: dummyClient,
      })
    )

    expect(
      storeRef.store.getState().api.queries[
        'queryWithCustomNumberSerializer(42)'
      ]
    ).toBeTruthy()
  })

  test('serializeQueryArgs + merge allows refetching as args change with same cache key', async () => {
    const allItems = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i']
    const PAGE_SIZE = 3

    server.use(
      rest.get('https://example.com/listItems', (req, res, ctx) => {
        const pageString = req.url.searchParams.get('page')
        const pageNum = parseInt(pageString || '0')

        const results = paginate(allItems, PAGE_SIZE, pageNum)
        return res(ctx.json(results))
      })
    )

    // Page number shouldn't matter here, because the cache key ignores that.
    // We just need to select the only cache entry.
    const selectListItems = api.endpoints.listItems.select(0)

    await storeRef.store.dispatch(api.endpoints.listItems.initiate(1))

    const initialEntry = selectListItems(storeRef.store.getState())
    expect(initialEntry.data).toEqual(['a', 'b', 'c'])

    await storeRef.store.dispatch(api.endpoints.listItems.initiate(2))
    const updatedEntry = selectListItems(storeRef.store.getState())
    expect(updatedEntry.data).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })

  test('merge receives a meta object as an argument', async () => {
    const allItems = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'i']
    const PAGE_SIZE = 3

    server.use(
      rest.get('https://example.com/listItems2', (req, res, ctx) => {
        const pageString = req.url.searchParams.get('page')
        const pageNum = parseInt(pageString || '0')

        const results = paginate(allItems, PAGE_SIZE, pageNum)
        return res(ctx.json(results))
      })
    )

    const selectListItems = api.endpoints.listItems2.select(0)

    await storeRef.store.dispatch(api.endpoints.listItems2.initiate(1))
    await storeRef.store.dispatch(api.endpoints.listItems2.initiate(2))
    const cacheEntry = selectListItems(storeRef.store.getState())

    // Should have passed along the third arg from `merge` containing these fields
    expect(cacheEntry.data?.meta).toEqual({
      requestId: expect.any(String),
      fulfilledTimeStamp: expect.any(Number),
      arg: 2,
      baseQueryMeta: expect.any(Object),
    })
  })
})
