import { configureStore, createAction, createReducer } from '@reduxjs/toolkit'
import type {
  Api,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
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

test('sensible defaults', () => {
  const api = createApi({
    baseQuery: fetchBaseQuery(),
    endpoints: (build) => ({
      getUser: build.query<unknown, void>({
        query(id) {
          return { url: `user/${id}` }
        },
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
    baseQuery.mockResolvedValue({})
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
    const baseQueryApiMatcher = {
      dispatch: expect.any(Function),
      getState: expect.any(Function),
      signal: expect.any(Object),
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
    let storeRef = setupApiStore(api)
    beforeEach(() => {
      api = getNewApi()
      storeRef = setupApiStore(api)
    })

    test('pre-modification behaviour', async () => {
      storeRef.store.dispatch(api.endpoints.query1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.query2.initiate('in2'))
      storeRef.store.dispatch(api.endpoints.mutation1.initiate('in1'))
      storeRef.store.dispatch(api.endpoints.mutation2.initiate('in2'))
      expect(baseQuery.mock.calls).toEqual([
        ['in1', baseQueryApiMatcher, undefined],
        ['in2', baseQueryApiMatcher, undefined],
        ['in1', baseQueryApiMatcher, undefined],
        ['in2', baseQueryApiMatcher, undefined],
      ])
    })

    test('warn on wrong tagType', async () => {
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
      debugger
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
        ['modified1', baseQueryApiMatcher, undefined],
        ['modified2', baseQueryApiMatcher, undefined],
        ['modified1', baseQueryApiMatcher, undefined],
        ['modified2', baseQueryApiMatcher, undefined],
      ])
    })
  })
})

describe('additional transformResponse behaviors', () => {
  type SuccessResponse = { value: 'success' }
  type EchoResponseData = { banana: 'bread' }
  const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'http://example.com' }),
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
          const res = await fetch('http://example.com/echo', {
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
    baseQuery: fetchBaseQuery({ baseUrl: 'http://example.com' }),
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
      rest.get('http://example.com/success', (_, res, ctx) =>
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
      rest.post('http://example.com/success', (_, res, ctx) =>
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
