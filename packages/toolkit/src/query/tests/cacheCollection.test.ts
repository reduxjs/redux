import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { configureStore } from '@reduxjs/toolkit'
import { waitMs } from './helpers'
import type { Middleware, Reducer } from 'redux'
import {
  THIRTY_TWO_BIT_MAX_INT,
  THIRTY_TWO_BIT_MAX_TIMER_SECONDS,
} from '../core/buildMiddleware/cacheCollection'

beforeAll(() => {
  jest.useFakeTimers('legacy')
})

const onCleanup = jest.fn()

beforeEach(() => {
  onCleanup.mockClear()
})

test(`query: await cleanup, defaults`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
  jest.advanceTimersByTime(59000), await waitMs()
  expect(onCleanup).not.toHaveBeenCalled()
  jest.advanceTimersByTime(2000), await waitMs()
  expect(onCleanup).toHaveBeenCalled()
})

test(`query: await cleanup, keepUnusedDataFor set`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
      keepUnusedDataFor: 29,
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
  jest.advanceTimersByTime(28000), await waitMs()
  expect(onCleanup).not.toHaveBeenCalled()
  jest.advanceTimersByTime(2000), await waitMs()
  expect(onCleanup).toHaveBeenCalled()
})

test(`query: handles large keepUnuseDataFor values over 32-bit ms`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
      keepUnusedDataFor: THIRTY_TWO_BIT_MAX_TIMER_SECONDS - 10,
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()

  // Shouldn't have been called right away
  jest.advanceTimersByTime(1000), await waitMs()
  expect(onCleanup).not.toHaveBeenCalled()

  // Shouldn't have been called any time in the next few minutes
  jest.advanceTimersByTime(1_000_000), await waitMs()
  expect(onCleanup).not.toHaveBeenCalled()

  // _Should_ be called _wayyyy_ in the future (like 24.8 days from now)
  jest.advanceTimersByTime(THIRTY_TWO_BIT_MAX_TIMER_SECONDS * 1000),
    await waitMs()
  expect(onCleanup).toHaveBeenCalled()
})

describe(`query: await cleanup, keepUnusedDataFor set`, () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
        query2: build.query<unknown, string>({
          query: () => '/success',
          keepUnusedDataFor: 35,
        }),
        query3: build.query<unknown, string>({
          query: () => '/success',
          keepUnusedDataFor: 0,
        }),
      }),
      keepUnusedDataFor: 29,
    })
  )

  test('global keepUnusedDataFor', async () => {
    store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
    jest.advanceTimersByTime(28000), await waitMs()
    expect(onCleanup).not.toHaveBeenCalled()
    jest.advanceTimersByTime(2000), await waitMs()
    expect(onCleanup).toHaveBeenCalled()
  })

  test('endpoint keepUnusedDataFor', async () => {
    store.dispatch(api.endpoints.query2.initiate('arg')).unsubscribe()
    jest.advanceTimersByTime(34000), await waitMs()
    expect(onCleanup).not.toHaveBeenCalled()
    jest.advanceTimersByTime(2000), await waitMs()
    expect(onCleanup).toHaveBeenCalled()
  })

  test('endpoint keepUnusedDataFor: 0 ', async () => {
    expect(onCleanup).not.toHaveBeenCalled()
    store.dispatch(api.endpoints.query3.initiate('arg')).unsubscribe()
    expect(onCleanup).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1), await waitMs()
    expect(onCleanup).toHaveBeenCalled()
  })
})

function storeForApi<
  A extends {
    reducerPath: 'api'
    reducer: Reducer<any, any>
    middleware: Middleware
    util: { resetApiState(): any }
  }
>(api: A) {
  const store = configureStore({
    reducer: { api: api.reducer },
    middleware: (gdm) =>
      gdm({ serializableCheck: false, immutableCheck: false }).concat(
        api.middleware
      ),
  })
  let hadQueries = false
  store.subscribe(() => {
    const queryState = store.getState().api.queries
    if (hadQueries && Object.keys(queryState).length === 0) {
      onCleanup()
    }
    hadQueries = hadQueries || Object.keys(queryState).length > 0
  })
  return { api, store }
}
