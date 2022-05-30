import { configureStore } from '@reduxjs/toolkit'
import {
  mockConsole,
  createConsole,
  getLog,
} from 'console-testing-library/pure'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'

let restore: () => void
let nodeEnv: string

beforeEach(() => {
  restore = mockConsole(createConsole())
  nodeEnv = process.env.NODE_ENV!
  ;(process.env as any).NODE_ENV = 'development'
})

afterEach(() => {
  ;(process.env as any).NODE_ENV = nodeEnv
  restore()
})

const baseUrl = 'https://example.com'

function createApis() {
  const api1 = createApi({
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
      q1: builder.query({ query: () => '/success' }),
    }),
  })

  const api1_2 = createApi({
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
      q1: builder.query({ query: () => '/success' }),
    }),
  })

  const api2 = createApi({
    reducerPath: 'api2',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
      q1: builder.query({ query: () => '/success' }),
    }),
  })
  return [api1, api1_2, api2] as const
}

let [api1, api1_2, api2] = createApis()
beforeEach(() => {
  ;[api1, api1_2, api2] = createApis()
})

describe('missing middleware', () => {
  test.each([
    ['development', true],
    ['production', false],
  ])('%s warns if middleware is missing: %s', ([env, shouldWarn]) => {
    ;(process.env as any).NODE_ENV = env
    const store = configureStore({
      reducer: { [api1.reducerPath]: api1.reducer },
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log).toBe(
      shouldWarn
        ? `Warning: Middleware for RTK-Query API at reducerPath "api" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.`
        : ''
    )
  })

  test('does not warn if middleware is not missing', () => {
    const store = configureStore({
      reducer: { [api1.reducerPath]: api1.reducer },
      middleware: (gdm) => gdm().concat(api1.middleware),
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log).toBe(``)
  })

  test('warns only once per api', () => {
    const store = configureStore({
      reducer: { [api1.reducerPath]: api1.reducer },
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log)
      .toBe(`Warning: Middleware for RTK-Query API at reducerPath "api" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.`)
  })

  test('warns multiple times for multiple apis', () => {
    const store = configureStore({
      reducer: {
        [api1.reducerPath]: api1.reducer,
        [api2.reducerPath]: api2.reducer,
      },
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    store.dispatch(api2.endpoints.q1.initiate(undefined))
    expect(getLog().log)
      .toBe(`Warning: Middleware for RTK-Query API at reducerPath "api" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.
Warning: Middleware for RTK-Query API at reducerPath "api2" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.`)
  })
})

describe('missing reducer', () => {
  describe.each([
    ['development', true],
    ['production', false],
  ])('%s warns if reducer is missing: %s', ([env, shouldWarn]) => {
    ;(process.env as any).NODE_ENV = env
    test('middleware not crashing if reducer is missing', async () => {
      const store = configureStore({
        reducer: { x: () => 0 },
        // @ts-expect-error
        middleware: (gdm) => gdm().concat(api1.middleware),
      })
      await store.dispatch(api1.endpoints.q1.initiate(undefined))
    })

    test(`warning behaviour`, () => {
      const store = configureStore({
        reducer: { x: () => 0 },
        // @ts-expect-error
        middleware: (gdm) => gdm().concat(api1.middleware),
      })
      // @ts-expect-error
      api1.endpoints.q1.select(undefined)(store.getState())
      expect(getLog().log).toBe(
        shouldWarn
          ? 'Error: No data found at `state.api`. Did you forget to add the reducer to the store?'
          : ''
      )
    })
  })

  test('does not warn if reducer is not missing', () => {
    const store = configureStore({
      reducer: { [api1.reducerPath]: api1.reducer },
      middleware: (gdm) => gdm().concat(api1.middleware),
    })
    api1.endpoints.q1.select(undefined)(store.getState())
    expect(getLog().log).toBe(``)
  })

  test('warns only once per api', () => {
    const store = configureStore({
      reducer: { x: () => 0 },
      // @ts-expect-error
      middleware: (gdm) => gdm().concat(api1.middleware),
    })
    // @ts-expect-error
    api1.endpoints.q1.select(undefined)(store.getState())
    // @ts-expect-error
    api1.endpoints.q1.select(undefined)(store.getState())
    expect(getLog().log).toBe(
      'Error: No data found at `state.api`. Did you forget to add the reducer to the store?'
    )
  })

  test('warns multiple times for multiple apis', () => {
    const store = configureStore({
      reducer: { x: () => 0 },
      // @ts-expect-error
      middleware: (gdm) => gdm().concat(api1.middleware),
    })
    // @ts-expect-error
    api1.endpoints.q1.select(undefined)(store.getState())
    // @ts-expect-error
    api2.endpoints.q1.select(undefined)(store.getState())
    expect(getLog().log).toBe(
      'Error: No data found at `state.api`. Did you forget to add the reducer to the store?\nError: No data found at `state.api2`. Did you forget to add the reducer to the store?'
    )
  })
})

test('warns only for reducer if everything is missing', async () => {
  const store = configureStore({
    reducer: { x: () => 0 },
  })
  // @ts-expect-error
  api1.endpoints.q1.select(undefined)(store.getState())
  await store.dispatch(api1.endpoints.q1.initiate(undefined))
  expect(getLog().log).toBe(
    'Error: No data found at `state.api`. Did you forget to add the reducer to the store?'
  )
})

describe('warns on multiple apis using the same `reducerPath`', () => {
  test('common: two apis, same order', async () => {
    const store = configureStore({
      reducer: {
        [api1.reducerPath]: api1.reducer,
        [api1_2.reducerPath]: api1_2.reducer,
      },
      middleware: (gDM) => gDM().concat(api1.middleware, api1_2.middleware),
    })
    await store.dispatch(api1.endpoints.q1.initiate(undefined))
    // only second api prints
    expect(getLog().log).toBe(
      `There is a mismatch between slice and middleware for the reducerPath "api".
You can only have one api per reducer path, this will lead to crashes in various situations!
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!`
    )
  })

  test('common: two apis, opposing order', async () => {
    const store = configureStore({
      reducer: {
        [api1.reducerPath]: api1.reducer,
        [api1_2.reducerPath]: api1_2.reducer,
      },
      middleware: (gDM) => gDM().concat(api1_2.middleware, api1.middleware),
    })
    await store.dispatch(api1.endpoints.q1.initiate(undefined))
    // both apis print
    expect(getLog().log).toBe(
      `There is a mismatch between slice and middleware for the reducerPath "api".
You can only have one api per reducer path, this will lead to crashes in various situations!
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!
There is a mismatch between slice and middleware for the reducerPath "api".
You can only have one api per reducer path, this will lead to crashes in various situations!
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!`
    )
  })

  test('common: two apis, only first middleware', async () => {
    const store = configureStore({
      reducer: {
        [api1.reducerPath]: api1.reducer,
        [api1_2.reducerPath]: api1_2.reducer,
      },
      middleware: (gDM) => gDM().concat(api1.middleware),
    })
    await store.dispatch(api1.endpoints.q1.initiate(undefined))

    expect(getLog().log).toBe(
      `There is a mismatch between slice and middleware for the reducerPath "api".
You can only have one api per reducer path, this will lead to crashes in various situations!
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!`
    )
  })

  /**
   * This is the one edge case that we currently cannot detect:
   * Multiple apis with the same reducer key and only the middleware of the last api is being used.
   *
   * It would be great to support this case as well, but for now:
   * "It is what it is."
   */
  test.skip('common: two apis, only second middleware', async () => {
    const store = configureStore({
      reducer: {
        [api1.reducerPath]: api1.reducer,
        [api1_2.reducerPath]: api1_2.reducer,
      },
      middleware: (gDM) => gDM().concat(api1_2.middleware),
    })
    await store.dispatch(api1.endpoints.q1.initiate(undefined))

    expect(getLog().log).toBe(
      `There is a mismatch between slice and middleware for the reducerPath "api".
You can only have one api per reducer path, this will lead to crashes in various situations!
If you have multiple apis, you *have* to specify the reducerPath option when using createApi!`
    )
  })
})

describe('`console.error` on unhandled errors during `initiate`', () => {
  test('error thrown in `baseQuery`', async () => {
    const api = createApi({
      baseQuery(): { data: any } {
        throw new Error('this was kinda expected')
      },
      endpoints: (build) => ({
        baseQuery: build.query<any, void>({ query() {} }),
      }),
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (gdm) => gdm().concat(api.middleware),
    })
    await store.dispatch(api.endpoints.baseQuery.initiate())

    expect(getLog().log)
      .toBe(`An unhandled error occured processing a request for the endpoint "baseQuery".
In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: this was kinda expected]`)
  })

  test('error thrown in `queryFn`', async () => {
    const api = createApi({
      baseQuery() {
        return { data: {} }
      },
      endpoints: (build) => ({
        queryFn: build.query<any, void>({
          queryFn() {
            throw new Error('this was kinda expected')
          },
        }),
      }),
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (gdm) => gdm().concat(api.middleware),
    })
    await store.dispatch(api.endpoints.queryFn.initiate())

    expect(getLog().log)
      .toBe(`An unhandled error occured processing a request for the endpoint "queryFn".
In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: this was kinda expected]`)
  })

  test('error thrown in `transformResponse`', async () => {
    const api = createApi({
      baseQuery() {
        return { data: {} }
      },
      endpoints: (build) => ({
        transformRspn: build.query<any, void>({
          query() {},
          transformResponse() {
            throw new Error('this was kinda expected')
          },
        }),
      }),
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (gdm) => gdm().concat(api.middleware),
    })
    await store.dispatch(api.endpoints.transformRspn.initiate())

    expect(getLog().log)
      .toBe(`An unhandled error occured processing a request for the endpoint "transformRspn".
In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: this was kinda expected]`)
  })

  test('`fetchBaseQuery`: error thrown in `prepareHeaders`', async () => {
    const api = createApi({
      baseQuery: fetchBaseQuery({
        baseUrl,
        prepareHeaders() {
          throw new Error('this was kinda expected')
        },
      }),
      endpoints: (build) => ({
        prep: build.query<any, void>({
          query() {
            return '/success'
          },
        }),
      }),
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (gdm) => gdm().concat(api.middleware),
    })
    await store.dispatch(api.endpoints.prep.initiate())

    expect(getLog().log)
      .toBe(`An unhandled error occured processing a request for the endpoint "prep".
In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: this was kinda expected]`)
  })

  test('`fetchBaseQuery`: error thrown in `validateStatus`', async () => {
    const api = createApi({
      baseQuery: fetchBaseQuery({
        baseUrl,
      }),
      endpoints: (build) => ({
        val: build.query<any, void>({
          query() {
            return {
              url: '/success',

              validateStatus() {
                throw new Error('this was kinda expected')
              },
            }
          },
        }),
      }),
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (gdm) => gdm().concat(api.middleware),
    })
    await store.dispatch(api.endpoints.val.initiate())

    expect(getLog().log)
      .toBe(`An unhandled error occured processing a request for the endpoint "val".
In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: this was kinda expected]`)
  })
})
