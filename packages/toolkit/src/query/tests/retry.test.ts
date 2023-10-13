import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { createApi, retry } from '@reduxjs/toolkit/query'
import { setupApiStore, waitMs } from './helpers'
import type { RetryOptions } from '../retry'

beforeEach(() => {
  jest.useFakeTimers('legacy')
})

const loopTimers = async (max: number = 12) => {
  let count = 0
  while (count < max) {
    await waitMs(1)
    jest.advanceTimersByTime(120000)
    count++
  }
}

describe('configuration', () => {
  test('retrying without any config options', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery)
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(7)

    expect(baseBaseQuery).toHaveBeenCalledTimes(6)
  })

  test('retrying with baseQuery config that overrides default behavior (maxRetries: 5)', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 3 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(5)

    expect(baseBaseQuery).toHaveBeenCalledTimes(4)
  })

  test('retrying with endpoint config that overrides baseQuery config', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 3 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
        q2: build.query({
          query: () => {},
          extraOptions: { maxRetries: 8 },
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.q1.initiate({}))
    await loopTimers(5)

    expect(baseBaseQuery).toHaveBeenCalledTimes(4)

    baseBaseQuery.mockClear()

    storeRef.store.dispatch(api.endpoints.q2.initiate({}))

    await loopTimers(10)

    expect(baseBaseQuery).toHaveBeenCalledTimes(9)
  })

  test('stops retrying a query after a success', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery
      .mockResolvedValueOnce({ error: 'rejected' })
      .mockResolvedValueOnce({ error: 'rejected' })
      .mockResolvedValue({ data: { success: true } })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 10 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.mutation({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(6)

    expect(baseBaseQuery).toHaveBeenCalledTimes(3)
  })

  test('retrying also works with mutations', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 3 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        m1: build.mutation({
          query: () => ({ method: 'PUT' }),
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.m1.initiate({}))

    await loopTimers(5)

    expect(baseBaseQuery).toHaveBeenCalledTimes(4)
  })

  test('retrying stops after a success from a mutation', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery
      .mockRejectedValueOnce(new Error('rejected'))
      .mockRejectedValueOnce(new Error('rejected'))
      .mockResolvedValue({ data: { success: true } })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 3 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        m1: build.mutation({
          query: () => ({ method: 'PUT' }),
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.m1.initiate({}))

    await loopTimers(5)

    expect(baseBaseQuery).toHaveBeenCalledTimes(3)
  })
  test('non-error-cases should **not** retry', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ data: { success: true } })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 3 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(2)

    expect(baseBaseQuery).toHaveBeenCalledTimes(1)
  })
  test('calling retry.fail(error) will skip retrying and expose the error directly', async () => {
    const error = { message: 'banana' }

    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockImplementation((input) => {
      retry.fail(error)
      return { data: `this won't happen` }
    })

    const baseQuery = retry(baseBaseQuery)
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    const result = await storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(2)

    expect(baseBaseQuery).toHaveBeenCalledTimes(1)
    expect(result.error).toEqual(error)
    expect(result).toEqual({
      endpointName: 'q1',
      error,
      isError: true,
      isLoading: false,
      isSuccess: false,
      isUninitialized: false,
      originalArgs: expect.any(Object),
      requestId: expect.any(String),
      startedTimeStamp: expect.any(Number),
      status: 'rejected',
    })
  })

  test('wrapping retry(retry(..., { maxRetries: 3 }), { maxRetries: 3 }) should retry 16 times', async () => {
    /**
     * Note:
     * This will retry 16 total times because we try the initial + 3 retries (sum: 4), then retry that process 3 times (starting at 0 for a total of 4)... 4x4=16 (allegedly)
     */
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(retry(baseBaseQuery, { maxRetries: 3 }), {
      maxRetries: 3,
    })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers(18)

    expect(baseBaseQuery).toHaveBeenCalledTimes(16)
  })

  test('accepts a custom backoff fn', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, {
      maxRetries: 8,
      backoff: async (attempt, maxRetries) => {
        const attempts = Math.min(attempt, maxRetries)
        const timeout = attempts * 300 // Scale up by 300ms per request, ex: 300ms, 600ms, 900ms, 1200ms...
        await new Promise((resolve) =>
          setTimeout((res: any) => resolve(res), timeout)
        )
      },
    })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers()

    expect(baseBaseQuery).toHaveBeenCalledTimes(9)
  })

  test('accepts a custom retryCondition fn', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const overrideMaxRetries = 3

    const baseQuery = retry(baseBaseQuery, {
      retryCondition: (_, __, { attempt }) => attempt <= overrideMaxRetries,
    })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers()

    expect(baseBaseQuery).toHaveBeenCalledTimes(overrideMaxRetries + 1)
  })

  test('retryCondition with endpoint config that overrides baseQuery config', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, {
      maxRetries: 10,
    })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
          extraOptions: {
            retryCondition: (_, __, { attempt }) => attempt <= 5,
          },
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.q1.initiate({}))

    await loopTimers()

    expect(baseBaseQuery).toHaveBeenCalledTimes(6)
  })

  test('retryCondition also works with mutations', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()

    baseBaseQuery
      .mockRejectedValueOnce(new Error('rejected'))
      .mockRejectedValueOnce(new Error('hello retryCondition'))
      .mockRejectedValueOnce(new Error('rejected'))
      .mockResolvedValue({ error: 'hello retryCondition' })

    const baseQuery = retry(baseBaseQuery, {})
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        m1: build.mutation({
          query: () => ({ method: 'PUT' }),
          extraOptions: {
            retryCondition: (e) => e.data === 'hello retryCondition',
          },
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })
    storeRef.store.dispatch(api.endpoints.m1.initiate({}))

    await loopTimers()

    expect(baseBaseQuery).toHaveBeenCalledTimes(4)
  })

  test('Specifying maxRetries as 0 in RetryOptions prevents retries', async () => {
    const baseBaseQuery = jest.fn<
      ReturnType<BaseQueryFn>,
      Parameters<BaseQueryFn>
    >()
    baseBaseQuery.mockResolvedValue({ error: 'rejected' })

    const baseQuery = retry(baseBaseQuery, { maxRetries: 0 })
    const api = createApi({
      baseQuery,
      endpoints: (build) => ({
        q1: build.query({
          query: () => {},
        }),
      }),
    })

    const storeRef = setupApiStore(api, undefined, {
      withoutTestLifecycles: true,
    })

    storeRef.store.dispatch(api.endpoints.q1.initiate({}))
    await loopTimers(2)

    expect(baseBaseQuery).toHaveBeenCalledTimes(1)
  });

  test.skip('RetryOptions only accepts one of maxRetries or retryCondition', () => {
    // @ts-expect-error Should complain if both exist at once
    const ro: RetryOptions = {
      maxRetries: 5,
      retryCondition: () => false,
    }
  })
})
