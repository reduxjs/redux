import { createApi } from '@reduxjs/toolkit/query/react'
import { actionsReducer, hookWaitFor, setupApiStore, waitMs } from './helpers'
import { skipToken } from '../core/buildSelectors'
import { renderHook, act } from '@testing-library/react'

interface Post {
  id: string
  title: string
  contents: string
}

const baseQuery = jest.fn()
beforeEach(() => baseQuery.mockReset())

const api = createApi({
  baseQuery: (...args: any[]) => {
    const result = baseQuery(...args)
    if (typeof result === 'object' && 'then' in result)
      return result
        .then((data: any) => ({ data, meta: 'meta' }))
        .catch((e: any) => ({ error: e }))
    return { data: result, meta: 'meta' }
  },
  tagTypes: ['Post'],
  endpoints: (build) => ({
    post: build.query<Post, string>({
      query: (id) => `post/${id}`,
      providesTags: ['Post'],
    }),
    updatePost: build.mutation<void, Pick<Post, 'id'> & Partial<Post>>({
      query: ({ id, ...patch }) => ({
        url: `post/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const currentItem = api.endpoints.post.select(arg.id)(getState())
        if (currentItem?.data) {
          dispatch(
            api.util.upsertQueryData('post', arg.id, {
              ...currentItem.data,
              ...arg,
            })
          )
        }
      },
      invalidatesTags: (result) => (result ? ['Post'] : []),
    }),
  }),
})

const storeRef = setupApiStore(api, {
  ...actionsReducer,
})

describe('basic lifecycle', () => {
  let onStart = jest.fn(),
    onError = jest.fn(),
    onSuccess = jest.fn()

  const extendedApi = api.injectEndpoints({
    endpoints: (build) => ({
      test: build.mutation({
        query: (x) => x,
        async onQueryStarted(arg, api) {
          onStart(arg)
          try {
            const result = await api.queryFulfilled
            onSuccess(result)
          } catch (e) {
            onError(e)
          }
        },
      }),
    }),
    overrideExisting: true,
  })

  beforeEach(() => {
    onStart.mockReset()
    onError.mockReset()
    onSuccess.mockReset()
  })

  test('success', async () => {
    const { result } = renderHook(
      () => extendedApi.endpoints.test.useMutation(),
      {
        wrapper: storeRef.wrapper,
      }
    )

    baseQuery.mockResolvedValue('success')

    expect(onStart).not.toHaveBeenCalled()
    expect(baseQuery).not.toHaveBeenCalled()
    act(() => void result.current[0]('arg'))
    expect(onStart).toHaveBeenCalledWith('arg')
    expect(baseQuery).toHaveBeenCalledWith('arg', expect.any(Object), undefined)

    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    await act(() => waitMs(5))
    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith({ data: 'success', meta: 'meta' })
  })

  test('error', async () => {
    const { result } = renderHook(
      () => extendedApi.endpoints.test.useMutation(),
      {
        wrapper: storeRef.wrapper,
      }
    )

    baseQuery.mockRejectedValue('error')

    expect(onStart).not.toHaveBeenCalled()
    expect(baseQuery).not.toHaveBeenCalled()
    act(() => void result.current[0]('arg'))
    expect(onStart).toHaveBeenCalledWith('arg')
    expect(baseQuery).toHaveBeenCalledWith('arg', expect.any(Object), undefined)

    expect(onError).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
    await act(() => waitMs(5))
    expect(onError).toHaveBeenCalledWith({
      error: 'error',
      isUnhandledError: false,
      meta: undefined,
    })
    expect(onSuccess).not.toHaveBeenCalled()
  })
})

describe('upsertQueryData', () => {
  test('updates cache values, can apply inverse patch', async () => {
    baseQuery
      .mockResolvedValueOnce({
        id: '3',
        title: 'All about cheese.',
        contents: 'TODO',
      })
      // TODO I have no idea why the query is getting called multiple times,
      // but passing an additional mocked value (_any_ value)
      // seems to silence some annoying "got an undefined result" logging
      .mockResolvedValueOnce(42)
    const { result } = renderHook(() => api.endpoints.post.useQuery('3'), {
      wrapper: storeRef.wrapper,
    })
    await hookWaitFor(() => expect(result.current.isSuccess).toBeTruthy())

    const dataBefore = result.current.data
    expect(dataBefore).toEqual({
      id: '3',
      title: 'All about cheese.',
      contents: 'TODO',
    })

    await act(async () => {
      storeRef.store.dispatch(
        api.util.upsertQueryData('post', '3', {
          id: '3',
          title: 'All about cheese.',
          contents: 'I love cheese!',
        })
      )
    })

    expect(result.current.data).not.toBe(dataBefore)
    expect(result.current.data).toEqual({
      id: '3',
      title: 'All about cheese.',
      contents: 'I love cheese!',
    })
  })

  test('does update non-existing values', async () => {
    baseQuery
      // throw an error to make sure there is no cached data
      .mockImplementationOnce(async () => {
        throw new Error('failed to load')
      })
      .mockResolvedValueOnce(42)

    // a subscriber is needed to have the data stay in the cache
    // Not sure if this is the wanted behaviour, I would have liked
    // it to stay in the cache for the x amount of time the cache
    // is preserved normally after the last subscriber was unmounted
    const { result, rerender } = renderHook(
      () => api.endpoints.post.useQuery('4'),
      {
        wrapper: storeRef.wrapper,
      }
    )
    await hookWaitFor(() => expect(result.current.isError).toBeTruthy())

    let returnValue!: ReturnType<ReturnType<typeof api.util.upsertQueryData>>
    // upsert the data
    act(() => {
      returnValue = storeRef.store.dispatch(
        api.util.upsertQueryData('post', '4', {
          id: '4',
          title: 'All about cheese',
          contents: 'I love cheese!',
        })
      )
    })

    // rerender the hook
    rerender()
    // wait until everything has settled
    await hookWaitFor(() => expect(result.current.isSuccess).toBeTruthy())

    // the cached data is returned as the result
    expect(result.current.data).toStrictEqual({
      id: '4',
      title: 'All about cheese',
      contents: 'I love cheese!',
    })
  })
})

describe('full integration', () => {
  test('success case', async () => {
    baseQuery
      .mockResolvedValueOnce({
        id: '3',
        title: 'All about cheese.',
        contents: 'TODO',
      })
      .mockResolvedValueOnce({
        id: '3',
        title: 'Meanwhile, this changed server-side.',
        contents: 'Delicious cheese!',
      })
      .mockResolvedValueOnce({
        id: '3',
        title: 'Meanwhile, this changed server-side.',
        contents: 'Delicious cheese!',
      })
      .mockResolvedValueOnce(42)
    const { result } = renderHook(
      () => ({
        query: api.endpoints.post.useQuery('3'),
        mutation: api.endpoints.updatePost.useMutation(),
      }),
      {
        wrapper: storeRef.wrapper,
      }
    )
    await hookWaitFor(() => expect(result.current.query.isSuccess).toBeTruthy())

    expect(result.current.query.data).toEqual({
      id: '3',
      title: 'All about cheese.',
      contents: 'TODO',
    })

    await act(async () => {
      await result.current.mutation[0]({
        id: '3',
        contents: 'Delicious cheese!',
      })
    })

    expect(result.current.query.data).toEqual({
      id: '3',
      title: 'Meanwhile, this changed server-side.',
      contents: 'Delicious cheese!',
    })

    await hookWaitFor(() =>
      expect(result.current.query.data).toEqual({
        id: '3',
        title: 'Meanwhile, this changed server-side.',
        contents: 'Delicious cheese!',
      })
    )
  })

  test('error case', async () => {
    baseQuery
      .mockResolvedValueOnce({
        id: '3',
        title: 'All about cheese.',
        contents: 'TODO',
      })
      .mockRejectedValueOnce('some error!')
      .mockResolvedValueOnce({
        id: '3',
        title: 'Meanwhile, this changed server-side.',
        contents: 'TODO',
      })
      .mockResolvedValueOnce(42)

    const { result } = renderHook(
      () => ({
        query: api.endpoints.post.useQuery('3'),
        mutation: api.endpoints.updatePost.useMutation(),
      }),
      {
        wrapper: storeRef.wrapper,
      }
    )
    await hookWaitFor(() => expect(result.current.query.isSuccess).toBeTruthy())

    expect(result.current.query.data).toEqual({
      id: '3',
      title: 'All about cheese.',
      contents: 'TODO',
    })

    await act(async () => {
      await result.current.mutation[0]({
        id: '3',
        contents: 'Delicious cheese!',
      })
    })

    // optimistic update
    expect(result.current.query.data).toEqual({
      id: '3',
      title: 'All about cheese.',
      contents: 'Delicious cheese!',
    })

    // mutation failed - will not invalidate query and not refetch data from the server
    await expect(() =>
      hookWaitFor(
        () =>
          expect(result.current.query.data).toEqual({
            id: '3',
            title: 'Meanwhile, this changed server-side.',
            contents: 'TODO',
          }),
        50
      )
    ).rejects.toBeTruthy()

    act(() => void result.current.query.refetch())

    // manually refetching gives up-to-date data
    await hookWaitFor(
      () =>
        expect(result.current.query.data).toEqual({
          id: '3',
          title: 'Meanwhile, this changed server-side.',
          contents: 'TODO',
        }),
      50
    )
  })
})
