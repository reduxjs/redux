import type { SerializedError } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import type { BaseQueryFn, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { Post } from './mocks/server'
import { posts } from './mocks/server'
import { actionsReducer, setupApiStore } from './helpers'
import type { QuerySubState } from '@reduxjs/toolkit/dist/query/core/apiState'

describe('queryFn base implementation tests', () => {
  const baseQuery: BaseQueryFn<string, { wrappedByBaseQuery: string }, string> =
    jest.fn((arg: string) => ({
      data: { wrappedByBaseQuery: arg },
    }))

  const api = createApi({
    baseQuery,
    endpoints: (build) => ({
      withQuery: build.query<string, string>({
        query(arg: string) {
          return `resultFrom(${arg})`
        },
        transformResponse(response) {
          return response.wrappedByBaseQuery
        },
      }),
      withQueryFn: build.query<string, string>({
        queryFn(arg: string) {
          return { data: `resultFrom(${arg})` }
        },
      }),
      withInvalidDataQueryFn: build.query<string, string>({
        // @ts-expect-error
        queryFn(arg: string) {
          return { data: 5 }
        },
      }),
      withErrorQueryFn: build.query<string, string>({
        queryFn(arg: string) {
          return { error: `resultFrom(${arg})` }
        },
      }),
      withInvalidErrorQueryFn: build.query<string, string>({
        // @ts-expect-error
        queryFn(arg: string) {
          return { error: 5 }
        },
      }),
      withThrowingQueryFn: build.query<string, string>({
        queryFn(arg: string) {
          throw new Error(`resultFrom(${arg})`)
        },
      }),
      withAsyncQueryFn: build.query<string, string>({
        async queryFn(arg: string) {
          return { data: `resultFrom(${arg})` }
        },
      }),
      withInvalidDataAsyncQueryFn: build.query<string, string>({
        // @ts-expect-error
        async queryFn(arg: string) {
          return { data: 5 }
        },
      }),
      withAsyncErrorQueryFn: build.query<string, string>({
        async queryFn(arg: string) {
          return { error: `resultFrom(${arg})` }
        },
      }),
      withInvalidAsyncErrorQueryFn: build.query<string, string>({
        // @ts-expect-error
        async queryFn(arg: string) {
          return { error: 5 }
        },
      }),
      withAsyncThrowingQueryFn: build.query<string, string>({
        async queryFn(arg: string) {
          throw new Error(`resultFrom(${arg})`)
        },
      }),
      mutationWithQueryFn: build.mutation<string, string>({
        queryFn(arg: string) {
          return { data: `resultFrom(${arg})` }
        },
      }),
      mutationWithInvalidDataQueryFn: build.mutation<string, string>({
        // @ts-expect-error
        queryFn(arg: string) {
          return { data: 5 }
        },
      }),
      mutationWithErrorQueryFn: build.mutation<string, string>({
        queryFn(arg: string) {
          return { error: `resultFrom(${arg})` }
        },
      }),
      mutationWithInvalidErrorQueryFn: build.mutation<string, string>({
        // @ts-expect-error
        queryFn(arg: string) {
          return { error: 5 }
        },
      }),
      mutationWithThrowingQueryFn: build.mutation<string, string>({
        queryFn(arg: string) {
          throw new Error(`resultFrom(${arg})`)
        },
      }),
      mutationWithAsyncQueryFn: build.mutation<string, string>({
        async queryFn(arg: string) {
          return { data: `resultFrom(${arg})` }
        },
      }),
      mutationWithInvalidAsyncQueryFn: build.mutation<string, string>({
        // @ts-expect-error
        async queryFn(arg: string) {
          return { data: 5 }
        },
      }),
      mutationWithAsyncErrorQueryFn: build.mutation<string, string>({
        async queryFn(arg: string) {
          return { error: `resultFrom(${arg})` }
        },
      }),
      mutationWithInvalidAsyncErrorQueryFn: build.mutation<string, string>({
        // @ts-expect-error
        async queryFn(arg: string) {
          return { error: 5 }
        },
      }),
      mutationWithAsyncThrowingQueryFn: build.mutation<string, string>({
        async queryFn(arg: string) {
          throw new Error(`resultFrom(${arg})`)
        },
      }),
      // @ts-expect-error
      withNeither: build.query<string, string>({}),
      // @ts-expect-error
      mutationWithNeither: build.mutation<string, string>({}),
    }),
  })

  const {
    withQuery,
    withQueryFn,
    withErrorQueryFn,
    withThrowingQueryFn,
    withAsyncQueryFn,
    withAsyncErrorQueryFn,
    withAsyncThrowingQueryFn,
    mutationWithQueryFn,
    mutationWithErrorQueryFn,
    mutationWithThrowingQueryFn,
    mutationWithAsyncQueryFn,
    mutationWithAsyncErrorQueryFn,
    mutationWithAsyncThrowingQueryFn,
    withNeither,
    mutationWithNeither,
  } = api.endpoints

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
    },
    middleware: (gDM) => gDM({}).concat(api.middleware),
  })

  test.each([
    ['withQuery', withQuery, 'data'],
    ['withQueryFn', withQueryFn, 'data'],
    ['withErrorQueryFn', withErrorQueryFn, 'error'],
    ['withThrowingQueryFn', withThrowingQueryFn, 'throw'],
    ['withAsyncQueryFn', withAsyncQueryFn, 'data'],
    ['withAsyncErrorQueryFn', withAsyncErrorQueryFn, 'error'],
    ['withAsyncThrowingQueryFn', withAsyncThrowingQueryFn, 'throw'],
  ])('%s1', async (endpointName, endpoint, expectedResult) => {
    const thunk = endpoint.initiate(endpointName)
    let result: undefined | QuerySubState<any> = undefined
    await expect(async () => {
      result = await store.dispatch(thunk)
    }).toHaveConsoleOutput(
      endpointName.includes('Throw')
        ? `An unhandled error occurred processing a request for the endpoint "${endpointName}".
        In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: resultFrom(${endpointName})]`
        : ''
    )
    if (expectedResult === 'data') {
      expect(result).toEqual(
        expect.objectContaining({
          data: `resultFrom(${endpointName})`,
        })
      )
    } else if (expectedResult === 'error') {
      expect(result).toEqual(
        expect.objectContaining({
          error: `resultFrom(${endpointName})`,
        })
      )
    } else {
      expect(result).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            message: `resultFrom(${endpointName})`,
          }),
        })
      )
    }
  })

  test.each([
    ['mutationWithQueryFn', mutationWithQueryFn, 'data'],
    ['mutationWithErrorQueryFn', mutationWithErrorQueryFn, 'error'],
    ['mutationWithThrowingQueryFn', mutationWithThrowingQueryFn, 'throw'],
    ['mutationWithAsyncQueryFn', mutationWithAsyncQueryFn, 'data'],
    ['mutationWithAsyncErrorQueryFn', mutationWithAsyncErrorQueryFn, 'error'],
    [
      'mutationWithAsyncThrowingQueryFn',
      mutationWithAsyncThrowingQueryFn,
      'throw',
    ],
  ])('%s', async (endpointName, endpoint, expectedResult) => {
    const thunk = endpoint.initiate(endpointName)
    let result:
      | undefined
      | { data: string }
      | { error: string | SerializedError } = undefined
    await expect(async () => {
      result = await store.dispatch(thunk)
    }).toHaveConsoleOutput(
      endpointName.includes('Throw')
        ? `An unhandled error occurred processing a request for the endpoint "${endpointName}".
        In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: resultFrom(${endpointName})]`
        : ''
    )

    if (expectedResult === 'data') {
      expect(result).toEqual(
        expect.objectContaining({
          data: `resultFrom(${endpointName})`,
        })
      )
    } else if (expectedResult === 'error') {
      expect(result).toEqual(
        expect.objectContaining({
          error: `resultFrom(${endpointName})`,
        })
      )
    } else {
      expect(result).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            message: `resultFrom(${endpointName})`,
          }),
        })
      )
    }
  })

  test('neither provided', async () => {
    {
      const thunk = withNeither.initiate('withNeither')
      let result: QuerySubState<any>
      await expect(async () => {
        result = await store.dispatch(thunk)
      }).toHaveConsoleOutput(
        `An unhandled error occurred processing a request for the endpoint "withNeither".
        In the case of an unhandled error, no tags will be "provided" or "invalidated". [TypeError: endpointDefinition.queryFn is not a function]`
      )
      expect(result!.error).toEqual(
        expect.objectContaining({
          message: 'endpointDefinition.queryFn is not a function',
        })
      )
    }
    {
      let result:
        | undefined
        | { data: string }
        | { error: string | SerializedError } = undefined
      const thunk = mutationWithNeither.initiate('mutationWithNeither')
      await expect(async () => {
        result = await store.dispatch(thunk)
      }).toHaveConsoleOutput(
        `An unhandled error occurred processing a request for the endpoint "mutationWithNeither".
        In the case of an unhandled error, no tags will be "provided" or "invalidated". [TypeError: endpointDefinition.queryFn is not a function]`
      )
      expect((result as any).error).toEqual(
        expect.objectContaining({
          message: 'endpointDefinition.queryFn is not a function',
        })
      )
    }
  })
})

describe('usage scenario tests', () => {
  const mockData = { id: 1, name: 'Banana' }
  const mockDocResult = {
    exists: () => true,
    data: () => mockData,
  }
  const get = jest.fn(() => Promise.resolve(mockDocResult))
  const doc = jest.fn((name) => ({
    get,
  }))
  const collection = jest.fn((name) => ({ get, doc }))
  const firestore = () => {
    return { collection, doc }
  }

  const baseQuery = fetchBaseQuery({ baseUrl: 'https://example.com/' })
  const api = createApi({
    baseQuery,
    endpoints: (build) => ({
      getRandomUser: build.query<Post, void>({
        async queryFn(_arg: void, _queryApi, _extraOptions, fetchWithBQ) {
          // get a random post
          const randomResult = await fetchWithBQ('posts/random')
          if (randomResult.error) {
            throw randomResult.error
          }
          const post = randomResult.data as Post
          const result = await fetchWithBQ(`/post/${post.id}`)
          return result.data
            ? { data: result.data as Post }
            : { error: result.error as FetchBaseQueryError }
        },
      }),
      getFirebaseUser: build.query<typeof mockData, number>({
        async queryFn(arg: number) {
          const getResult = await firestore().collection('users').doc(arg).get()
          if (!getResult.exists()) {
            throw new Error('Missing user')
          }
          return { data: getResult.data() }
        },
      }),
      getMissingFirebaseUser: build.query<typeof mockData, number>({
        async queryFn(arg: number) {
          const getResult = await firestore().collection('users').doc(arg).get()
          // intentionally throw if it exists to keep the mocking overhead low
          if (getResult.exists()) {
            throw new Error('Missing user')
          }
          return { data: getResult.data() }
        },
      }),
    }),
  })

  const storeRef = setupApiStore(api, {
    ...actionsReducer,
  })

  /**
   * Allow for a scenario where you can chain X requests
   * https://discord.com/channels/102860784329052160/103538784460615680/825430959247720449
   * const resp1 = await api.get(url);
   * const resp2 = await api.get(`${url2}/id=${resp1.data.id}`);
   */

  it('can chain multiple queries together', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.getRandomUser.initiate()
    )
    expect(result.data).toEqual(posts[1])
  })

  it('can wrap a service like Firebase', async () => {
    const result = await storeRef.store.dispatch(
      api.endpoints.getFirebaseUser.initiate(1)
    )
    expect(result.data).toEqual(mockData)
  })

  it('can wrap a service like Firebase and handle errors', async () => {
    let result: QuerySubState<any>
    await expect(async () => {
      result = await storeRef.store.dispatch(
        api.endpoints.getMissingFirebaseUser.initiate(1)
      )
    })
      .toHaveConsoleOutput(`An unhandled error occurred processing a request for the endpoint "getMissingFirebaseUser".
    In the case of an unhandled error, no tags will be "provided" or "invalidated". [Error: Missing user]`)

    expect(result!.data).toBeUndefined()
    expect(result!.error).toEqual(
      expect.objectContaining({
        message: 'Missing user',
        name: 'Error',
      })
    )
  })
})
