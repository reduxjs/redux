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

function createApis() {
  const api1 = createApi({
    reducerPath: 'api1',
    baseQuery: fetchBaseQuery({}),
    endpoints: (builder) => ({
      q1: builder.query({ query: () => '/success' }),
    }),
  })

  const api2 = createApi({
    reducerPath: 'api2',
    baseQuery: fetchBaseQuery({}),
    endpoints: (builder) => ({
      q1: builder.query({ query: () => '/success' }),
    }),
  })
  return [api1, api2] as const
}

let [api1, api2] = createApis()
beforeEach(() => {
  ;[api1, api2] = createApis()
})

describe('missing middleware', () => {
  test.each([
    ['development', true],
    ['production', false],
  ])('%s warns if middleware is missing: %s', ([env, shouldWarn]) => {
    ;(process.env as any).NODE_ENV = env
    const store = configureStore({ reducer: { api1: api1.reducer } })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log).toBe(
      shouldWarn
        ? `Warning: Middleware for RTK-Query API at reducerPath "api1" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.`
        : ''
    )
  })

  test('does not warn if middleware is not missing', () => {
    const store = configureStore({
      reducer: { api1: api1.reducer },
      middleware: (gdm) => gdm().concat(api1.middleware),
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log).toBe(``)
  })

  test('warns only once per api', () => {
    const store = configureStore({ reducer: { api1: api1.reducer } })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    expect(getLog().log)
      .toBe(`Warning: Middleware for RTK-Query API at reducerPath "api1" has not been added to the store.
Features like automatic cache collection, automatic refetching etc. will not be available.`)
  })

  test('warns multiple times for multiple apis', () => {
    const store = configureStore({
      reducer: { api1: api1.reducer, api2: api2.reducer },
    })
    store.dispatch(api1.endpoints.q1.initiate(undefined))
    store.dispatch(api2.endpoints.q1.initiate(undefined))
    expect(getLog().log)
      .toBe(`Warning: Middleware for RTK-Query API at reducerPath "api1" has not been added to the store.
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
          ? 'Error: No data found at `state.api1`. Did you forget to add the reducer to the store?'
          : ''
      )
    })
  })

  test('does not warn if reducer is not missing', () => {
    const store = configureStore({
      reducer: { api1: api1.reducer },
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
      'Error: No data found at `state.api1`. Did you forget to add the reducer to the store?'
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
      'Error: No data found at `state.api1`. Did you forget to add the reducer to the store?\nError: No data found at `state.api2`. Did you forget to add the reducer to the store?'
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
    'Error: No data found at `state.api1`. Did you forget to add the reducer to the store?'
  )
})
