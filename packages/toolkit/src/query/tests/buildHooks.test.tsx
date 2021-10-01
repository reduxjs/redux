import * as React from 'react'
import {
  createApi,
  fetchBaseQuery,
  QueryStatus,
  skipToken,
} from '@reduxjs/toolkit/query/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest } from 'msw'
import {
  actionsReducer,
  expectExactType,
  expectType,
  setupApiStore,
  useRenderCounter,
  waitMs,
} from './helpers'
import { server } from './mocks/server'
import type { AnyAction } from 'redux'
import type { SubscriptionOptions } from '@reduxjs/toolkit/dist/query/core/apiState'
import type { SerializedError } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react-hooks'

// Just setup a temporary in-memory counter for tests that `getIncrementedAmount`.
// This can be used to test how many renders happen due to data changes or
// the refetching behavior of components.
let amount = 0

const api = createApi({
  baseQuery: async (arg: any) => {
    await waitMs()
    if (arg?.body && 'amount' in arg.body) {
      amount += 1
    }

    if (arg?.body && 'forceError' in arg.body) {
      return {
        error: {
          status: 500,
          data: null,
        },
      }
    }

    return {
      data: arg?.body ? { ...arg.body, ...(amount ? { amount } : {}) } : {},
    }
  },
  endpoints: (build) => ({
    getUser: build.query<any, number>({
      query: (arg) => arg,
    }),
    getIncrementedAmount: build.query<any, void>({
      query: () => ({
        url: '',
        body: {
          amount,
        },
      }),
    }),
    updateUser: build.mutation<{ name: string }, { name: string }>({
      query: (update) => ({ body: update }),
    }),
    getError: build.query({
      query: (query) => '/error',
    }),
  }),
})

const storeRef = setupApiStore(api, {
  actions(state: AnyAction[] = [], action: AnyAction) {
    return [...state, action]
  },
})

afterEach(() => {
  amount = 0
})

let getRenderCount: () => number = () => 0

describe('hooks tests', () => {
  describe('useQuery', () => {
    test('useQuery hook basic render count assumptions', async () => {
      function User() {
        const { isFetching } = api.endpoints.getUser.useQuery(1)
        getRenderCount = useRenderCounter()

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(getRenderCount()).toBe(2) // By the time this runs, the initial render will happen, and the query will start immediately running by the time we can expect this

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(3)
    })

    test('useQuery hook sets isFetching=true whenever a request is in flight', async () => {
      function User() {
        const [value, setValue] = React.useState(0)

        const { isFetching } = api.endpoints.getUser.useQuery(1, {
          skip: value < 1,
        })
        getRenderCount = useRenderCounter()

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button onClick={() => setValue((val) => val + 1)}>
              Increment value
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(getRenderCount()).toBe(1)

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      fireEvent.click(screen.getByText('Increment value')) // setState = 1, perform request = 2
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(4)

      fireEvent.click(screen.getByText('Increment value'))
      // Being that nothing has changed in the args, this should never fire.
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
      expect(getRenderCount()).toBe(5) // even though there was no request, the button click updates the state so this is an expected render
    })

    test('useQuery hook sets isLoading=true only on initial request', async () => {
      let refetch: any, isLoading: boolean, isFetching: boolean
      function User() {
        const [value, setValue] = React.useState(0)

        ;({ isLoading, isFetching, refetch } = api.endpoints.getUser.useQuery(
          2,
          {
            skip: value < 1,
          }
        ))
        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button onClick={() => setValue((val) => val + 1)}>
              Increment value
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      // Being that we skipped the initial request on mount, this should be false
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )
      fireEvent.click(screen.getByText('Increment value'))
      // Condition is met, should load
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      ) // Make sure the original loading has completed.
      fireEvent.click(screen.getByText('Increment value'))
      // Being that we already have data, isLoading should be false
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )
      // We call a refetch, should still be `false`
      act(() => refetch())
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    })

    test('useQuery hook sets isLoading and isFetching to the correct states', async () => {
      let refetchMe: () => void = () => {}
      function User() {
        const [value, setValue] = React.useState(0)
        getRenderCount = useRenderCounter()

        const { isLoading, isFetching, refetch } =
          api.endpoints.getUser.useQuery(22, { skip: value < 1 })
        refetchMe = refetch
        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <button onClick={() => setValue((val) => val + 1)}>
              Increment value
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(getRenderCount()).toBe(1)

      expect(screen.getByTestId('isLoading').textContent).toBe('false')
      expect(screen.getByTestId('isFetching').textContent).toBe('false')

      fireEvent.click(screen.getByText('Increment value')) // renders: set state = 1, perform request = 2
      // Condition is met, should load
      await waitFor(() => {
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      })

      // Make sure the request is done for sure.
      await waitFor(() => {
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      })
      expect(getRenderCount()).toBe(4)

      fireEvent.click(screen.getByText('Increment value'))
      // Being that we already have data and changing the value doesn't trigger a new request, only the button click should impact the render
      await waitFor(() => {
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      })
      expect(getRenderCount()).toBe(5)

      // We call a refetch, should set `isFetching` to true, then false when complete/errored
      act(() => refetchMe())
      await waitFor(() => {
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      })
      await waitFor(() => {
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      })
      expect(getRenderCount()).toBe(7)
    })

    test('`isLoading` does not jump back to true, while `isFetching` does', async () => {
      const loadingHist: boolean[] = [],
        fetchingHist: boolean[] = []

      function User({ id }: { id: number }) {
        const { isLoading, isFetching, status } =
          api.endpoints.getUser.useQuery(id)

        React.useEffect(() => {
          loadingHist.push(isLoading)
        }, [isLoading])
        React.useEffect(() => {
          fetchingHist.push(isFetching)
        }, [isFetching])
        return (
          <div data-testid="status">
            {status === QueryStatus.fulfilled && id}
          </div>
        )
      }

      let { rerender } = render(<User id={1} />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('1')
      )
      rerender(<User id={2} />)

      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('2')
      )

      expect(loadingHist).toEqual([true, false])
      expect(fetchingHist).toEqual([true, false, true, false])
    })

    test('useQuery hook respects refetchOnMountOrArgChange: true', async () => {
      let data, isLoading, isFetching
      function User() {
        ;({ data, isLoading, isFetching } =
          api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: true,
          }))
        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="amount">{String(data?.amount)}</div>
          </div>
        )
      }

      const { unmount } = render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )

      unmount()

      render(<User />, { wrapper: storeRef.wrapper })
      // Let's make sure we actually fetch, and we increment
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('2')
      )
    })

    test('useQuery does not refetch when refetchOnMountOrArgChange: NUMBER condition is not met', async () => {
      let data, isLoading, isFetching
      function User() {
        ;({ data, isLoading, isFetching } =
          api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 10,
          }))
        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="amount">{String(data?.amount)}</div>
          </div>
        )
      }

      const { unmount } = render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )

      unmount()

      render(<User />, { wrapper: storeRef.wrapper })
      // Let's make sure we actually fetch, and we increment. Should be false because we do this immediately
      // and the condition is set to 10 seconds
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )
    })

    test('useQuery refetches when refetchOnMountOrArgChange: NUMBER condition is met', async () => {
      let data, isLoading, isFetching
      function User() {
        ;({ data, isLoading, isFetching } =
          api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 0.5,
          }))
        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="amount">{String(data?.amount)}</div>
          </div>
        )
      }

      const { unmount } = render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )

      unmount()

      // Wait to make sure we've passed the `refetchOnMountOrArgChange` value
      await waitMs(510)

      render(<User />, { wrapper: storeRef.wrapper })
      // Let's make sure we actually fetch, and we increment
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('2')
      )
    })

    test('refetchOnMountOrArgChange works as expected when changing skip from false->true', async () => {
      let data, isLoading, isFetching
      function User() {
        const [skip, setSkip] = React.useState(true)
        ;({ data, isLoading, isFetching } =
          api.endpoints.getIncrementedAmount.useQuery(undefined, {
            refetchOnMountOrArgChange: 0.5,
            skip,
          }))

        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="amount">{String(data?.amount)}</div>
            <button onClick={() => setSkip((prev) => !prev)}>
              change skip
            </button>
            ;
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      expect(screen.getByTestId('isLoading').textContent).toBe('false')
      expect(screen.getByTestId('amount').textContent).toBe('undefined')

      fireEvent.click(screen.getByText('change skip'))

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )
    })

    test('refetchOnMountOrArgChange works as expected when changing skip from false->true with a cached query', async () => {
      // 1. we need to mount a skipped query, then toggle skip to generate a cached result
      // 2. we need to mount a skipped component after that, then toggle skip as well. should pull from the cache.
      // 3. we need to mount another skipped component, then toggle skip after the specified duration and expect the time condition to be satisfied

      let data, isLoading, isFetching
      function User() {
        const [skip, setSkip] = React.useState(true)
        ;({ data, isLoading, isFetching } =
          api.endpoints.getIncrementedAmount.useQuery(undefined, {
            skip,
            refetchOnMountOrArgChange: 0.5,
          }))

        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <div data-testid="amount">{String(data?.amount)}</div>
            <button onClick={() => setSkip((prev) => !prev)}>
              change skip
            </button>
            ;
          </div>
        )
      }

      let { unmount } = render(<User />, { wrapper: storeRef.wrapper })

      // skipped queries do nothing by default, so we need to toggle that to get a cached result
      fireEvent.click(screen.getByText('change skip'))

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('1')
      )

      unmount()

      await waitMs(100)

      // This will pull from the cache as the time criteria is not met.
      ;({ unmount } = render(<User />, {
        wrapper: storeRef.wrapper,
      }))

      // skipped queries return nothing
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
      expect(screen.getByTestId('amount').textContent).toBe('undefined')

      // toggle skip -> true... won't refetch as the time critera is not met, and just loads the cached values
      fireEvent.click(screen.getByText('change skip'))
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
      expect(screen.getByTestId('amount').textContent).toBe('1')

      unmount()

      await waitMs(500)
      ;({ unmount } = render(<User />, {
        wrapper: storeRef.wrapper,
      }))

      // toggle skip -> true... will cause a refetch as the time criteria is now satisfied
      fireEvent.click(screen.getByText('change skip'))

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      await waitFor(() =>
        expect(screen.getByTestId('amount').textContent).toBe('2')
      )
    })
  })

  describe('useLazyQuery', () => {
    let data: any

    afterEach(() => {
      data = undefined
    })

    let getRenderCount: () => number = () => 0
    test('useLazyQuery does not automatically fetch when mounted and has undefined data', async () => {
      function User() {
        const [fetchUser, { data: hookData, isFetching, isUninitialized }] =
          api.endpoints.getUser.useLazyQuery()
        getRenderCount = useRenderCounter()

        data = hookData

        return (
          <div>
            <div data-testid="isUninitialized">{String(isUninitialized)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button data-testid="fetchButton" onClick={() => fetchUser(1)}>
              fetchUser
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(getRenderCount()).toBe(1)

      await waitFor(() =>
        expect(screen.getByTestId('isUninitialized').textContent).toBe('true')
      )
      await waitFor(() => expect(data).toBeUndefined())

      fireEvent.click(screen.getByTestId('fetchButton'))
      expect(getRenderCount()).toBe(2)

      await waitFor(() =>
        expect(screen.getByTestId('isUninitialized').textContent).toBe('false')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(3)

      fireEvent.click(screen.getByTestId('fetchButton'))
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(5)
    })

    test('useLazyQuery accepts updated subscription options and only dispatches updateSubscriptionOptions when values are updated', async () => {
      let interval = 1000
      function User() {
        const [options, setOptions] = React.useState<SubscriptionOptions>()
        const [fetchUser, { data: hookData, isFetching, isUninitialized }] =
          api.endpoints.getUser.useLazyQuery(options)
        getRenderCount = useRenderCounter()

        data = hookData

        return (
          <div>
            <div data-testid="isUninitialized">{String(isUninitialized)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>

            <button data-testid="fetchButton" onClick={() => fetchUser(1)}>
              fetchUser
            </button>
            <button
              data-testid="updateOptions"
              onClick={() =>
                setOptions({
                  pollingInterval: interval,
                })
              }
            >
              updateOptions
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(getRenderCount()).toBe(1) // hook mount

      await waitFor(() =>
        expect(screen.getByTestId('isUninitialized').textContent).toBe('true')
      )
      await waitFor(() => expect(data).toBeUndefined())

      fireEvent.click(screen.getByTestId('fetchButton'))
      expect(getRenderCount()).toBe(2)

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(3)

      fireEvent.click(screen.getByTestId('updateOptions')) // setState = 1
      expect(getRenderCount()).toBe(4)

      fireEvent.click(screen.getByTestId('fetchButton')) // perform new request = 2
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(6)

      interval = 1000

      fireEvent.click(screen.getByTestId('updateOptions')) // setState = 1
      expect(getRenderCount()).toBe(7)

      fireEvent.click(screen.getByTestId('fetchButton'))
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      expect(getRenderCount()).toBe(9)

      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.updateSubscriptionOptions.match)
      ).toHaveLength(1)
    })

    test('useLazyQuery accepts updated args and unsubscribes the original query', async () => {
      function User() {
        const [fetchUser, { data: hookData, isFetching, isUninitialized }] =
          api.endpoints.getUser.useLazyQuery()

        data = hookData

        return (
          <div>
            <div data-testid="isUninitialized">{String(isUninitialized)}</div>
            <div data-testid="isFetching">{String(isFetching)}</div>

            <button data-testid="fetchUser1" onClick={() => fetchUser(1)}>
              fetchUser1
            </button>
            <button data-testid="fetchUser2" onClick={() => fetchUser(2)}>
              fetchUser2
            </button>
          </div>
        )
      }

      const { unmount } = render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isUninitialized').textContent).toBe('true')
      )
      await waitFor(() => expect(data).toBeUndefined())

      fireEvent.click(screen.getByTestId('fetchUser1'))

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      // Being that there is only the initial query, no unsubscribe should be dispatched
      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.unsubscribeQueryResult.match)
      ).toHaveLength(0)

      fireEvent.click(screen.getByTestId('fetchUser2'))

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.unsubscribeQueryResult.match)
      ).toHaveLength(1)

      fireEvent.click(screen.getByTestId('fetchUser1'))

      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.unsubscribeQueryResult.match)
      ).toHaveLength(2)

      // we always unsubscribe the original promise and create a new one
      fireEvent.click(screen.getByTestId('fetchUser1'))
      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.unsubscribeQueryResult.match)
      ).toHaveLength(3)

      unmount()

      // We unsubscribe after the component unmounts
      expect(
        storeRef.store
          .getState()
          .actions.filter(api.internalActions.unsubscribeQueryResult.match)
      ).toHaveLength(4)
    })
  })

  describe('useMutation', () => {
    test('useMutation hook sets and unsets the isLoading flag when running', async () => {
      function User() {
        const [updateUser, { isLoading }] =
          api.endpoints.updateUser.useMutation()

        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <button onClick={() => updateUser({ name: 'Banana' })}>
              Update User
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )
      fireEvent.click(screen.getByText('Update User'))
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )
    })

    test('useMutation hook sets data to the resolved response on success', async () => {
      const result = { name: 'Banana' }

      function User() {
        const [updateUser, { data }] = api.endpoints.updateUser.useMutation()

        return (
          <div>
            <div data-testid="result">{JSON.stringify(data)}</div>
            <button onClick={() => updateUser({ name: 'Banana' })}>
              Update User
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      fireEvent.click(screen.getByText('Update User'))
      await waitFor(() =>
        expect(screen.getByTestId('result').textContent).toBe(
          JSON.stringify(result)
        )
      )
    })

    test('useMutation hook callback returns various properties to handle the result', async () => {
      function User() {
        const [updateUser] = api.endpoints.updateUser.useMutation()
        const [successMsg, setSuccessMsg] = React.useState('')
        const [errMsg, setErrMsg] = React.useState('')
        const [isAborted, setIsAborted] = React.useState(false)

        const handleClick = async () => {
          const res = updateUser({ name: 'Banana' })

          // no-op simply for clearer type assertions
          res.then((result) => {
            expectExactType<
              | {
                  error: { status: number; data: unknown } | SerializedError
                }
              | {
                  data: {
                    name: string
                  }
                }
            >(result)
          })

          expectType<{
            endpointName: string
            originalArgs: { name: string }
            track?: boolean
          }>(res.arg)
          expectType<string>(res.requestId)
          expectType<() => void>(res.abort)
          expectType<() => Promise<{ name: string }>>(res.unwrap)
          expectType<() => void>(res.unsubscribe)

          // abort the mutation immediately to force an error
          res.abort()
          res
            .unwrap()
            .then((result) => {
              expectType<{ name: string }>(result)
              setSuccessMsg(`Successfully updated user ${result.name}`)
            })
            .catch((err) => {
              setErrMsg(
                `An error has occurred updating user ${res.arg.originalArgs.name}`
              )
              if (err.name === 'AbortError') {
                setIsAborted(true)
              }
            })
        }

        return (
          <div>
            <button onClick={handleClick}>Update User and abort</button>
            <div>{successMsg}</div>
            <div>{errMsg}</div>
            <div>{isAborted ? 'Request was aborted' : ''}</div>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      expect(screen.queryByText(/An error has occurred/i)).toBeNull()
      expect(screen.queryByText(/Successfully updated user/i)).toBeNull()
      expect(screen.queryByText('Request was aborted')).toBeNull()

      fireEvent.click(
        screen.getByRole('button', { name: 'Update User and abort' })
      )
      await screen.findByText('An error has occurred updating user Banana')
      expect(screen.queryByText(/Successfully updated user/i)).toBeNull()
      screen.getByText('Request was aborted')
    })
  })

  describe('usePrefetch', () => {
    test('usePrefetch respects force arg', async () => {
      const { usePrefetch } = api
      const USER_ID = 4
      function User() {
        const { isFetching } = api.endpoints.getUser.useQuery(USER_ID)
        const prefetchUser = usePrefetch('getUser', { force: true })

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button
              onMouseEnter={() => prefetchUser(USER_ID, { force: true })}
              data-testid="highPriority"
            >
              High priority action intent
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      // Resolve initial query
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      userEvent.hover(screen.getByTestId('highPriority'))
      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        error: undefined,
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.pending,
      })

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      })
    })

    test('usePrefetch does not make an additional request if already in the cache and force=false', async () => {
      const { usePrefetch } = api
      const USER_ID = 2

      function User() {
        // Load the initial query
        const { isFetching } = api.endpoints.getUser.useQuery(USER_ID)
        const prefetchUser = usePrefetch('getUser', { force: false })

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button
              onMouseEnter={() => prefetchUser(USER_ID)}
              data-testid="lowPriority"
            >
              Low priority user action intent
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      // Let the initial query resolve
      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      // Try to prefetch what we just loaded
      userEvent.hover(screen.getByTestId('lowPriority'))

      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      })

      await waitMs()

      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      })
    })

    test('usePrefetch respects ifOlderThan when it evaluates to true', async () => {
      const { usePrefetch } = api
      const USER_ID = 47

      function User() {
        // Load the initial query
        const { isFetching } = api.endpoints.getUser.useQuery(USER_ID)
        const prefetchUser = usePrefetch('getUser', { ifOlderThan: 0.2 })

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button
              onMouseEnter={() => prefetchUser(USER_ID)}
              data-testid="lowPriority"
            >
              Low priority user action intent
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      // Wait 400ms, making it respect ifOlderThan
      await waitMs(400)

      // This should run the query being that we're past the threshold
      userEvent.hover(screen.getByTestId('lowPriority'))
      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.pending,
      })

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )

      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        data: {},
        endpointName: 'getUser',
        fulfilledTimeStamp: expect.any(Number),
        isError: false,
        isLoading: false,
        isSuccess: true,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: QueryStatus.fulfilled,
      })
    })

    test('usePrefetch returns the last success result when ifOlderThan evalutes to false', async () => {
      const { usePrefetch } = api
      const USER_ID = 2

      function User() {
        // Load the initial query
        const { isFetching } = api.endpoints.getUser.useQuery(USER_ID)
        const prefetchUser = usePrefetch('getUser', { ifOlderThan: 10 })

        return (
          <div>
            <div data-testid="isFetching">{String(isFetching)}</div>
            <button
              onMouseEnter={() => prefetchUser(USER_ID)}
              data-testid="lowPriority"
            >
              Low priority user action intent
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      await waitFor(() =>
        expect(screen.getByTestId('isFetching').textContent).toBe('false')
      )
      await waitMs()

      // Get a snapshot of the last result
      const latestQueryData = api.endpoints.getUser.select(USER_ID)(
        storeRef.store.getState() as any
      )

      userEvent.hover(screen.getByTestId('lowPriority'))
      //  Serve up the result from the cache being that the condition wasn't met
      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual(latestQueryData)
    })

    test('usePrefetch executes a query even if conditions fail when the cache is empty', async () => {
      const { usePrefetch } = api
      const USER_ID = 2

      function User() {
        const prefetchUser = usePrefetch('getUser', { ifOlderThan: 10 })

        return (
          <div>
            <button
              onMouseEnter={() => prefetchUser(USER_ID)}
              data-testid="lowPriority"
            >
              Low priority user action intent
            </button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })

      userEvent.hover(screen.getByTestId('lowPriority'))

      expect(
        api.endpoints.getUser.select(USER_ID)(storeRef.store.getState() as any)
      ).toEqual({
        endpointName: 'getUser',
        isError: false,
        isLoading: true,
        isSuccess: false,
        isUninitialized: false,
        originalArgs: USER_ID,
        requestId: expect.any(String),
        startedTimeStamp: expect.any(Number),
        status: 'pending',
      })
    })
  })

  describe('useQuery and useMutation invalidation behavior', () => {
    const api = createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      tagTypes: ['User'],
      endpoints: (build) => ({
        checkSession: build.query<any, void>({
          query: () => '/me',
          providesTags: ['User'],
        }),
        login: build.mutation<any, any>({
          query: () => ({ url: '/login', method: 'POST' }),
          invalidatesTags: ['User'],
        }),
      }),
    })

    const storeRef = setupApiStore(api, {
      actions(state: AnyAction[] = [], action: AnyAction) {
        return [...state, action]
      },
    })
    test('initially failed useQueries that provide an tag will refetch after a mutation invalidates it', async () => {
      const checkSessionData = { name: 'matt' }
      server.use(
        rest.get('https://example.com/me', (req, res, ctx) => {
          return res.once(ctx.status(500))
        }),
        rest.get('https://example.com/me', (req, res, ctx) => {
          return res(ctx.json(checkSessionData))
        }),
        rest.post('https://example.com/login', (req, res, ctx) => {
          return res(ctx.status(200))
        })
      )
      let data, isLoading, isError
      function User() {
        ;({ data, isError, isLoading } = api.endpoints.checkSession.useQuery())
        const [login, { isLoading: loginLoading }] =
          api.endpoints.login.useMutation()

        return (
          <div>
            <div data-testid="isLoading">{String(isLoading)}</div>
            <div data-testid="isError">{String(isError)}</div>
            <div data-testid="user">{JSON.stringify(data)}</div>
            <div data-testid="loginLoading">{String(loginLoading)}</div>
            <button onClick={() => login(null)}>Login</button>
          </div>
        )
      }

      render(<User />, { wrapper: storeRef.wrapper })
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isLoading').textContent).toBe('false')
      )
      await waitFor(() =>
        expect(screen.getByTestId('isError').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('user').textContent).toBe('')
      )

      fireEvent.click(screen.getByRole('button', { name: /Login/i }))

      await waitFor(() =>
        expect(screen.getByTestId('loginLoading').textContent).toBe('true')
      )
      await waitFor(() =>
        expect(screen.getByTestId('loginLoading').textContent).toBe('false')
      )
      // login mutation will cause the original errored out query to refire, clearing the error and setting the user
      await waitFor(() =>
        expect(screen.getByTestId('isError').textContent).toBe('false')
      )
      await waitFor(() =>
        expect(screen.getByTestId('user').textContent).toBe(
          JSON.stringify(checkSessionData)
        )
      )

      const { checkSession, login } = api.endpoints
      expect(storeRef.store.getState().actions).toMatchSequence(
        api.internalActions.middlewareRegistered.match,
        checkSession.matchPending,
        checkSession.matchRejected,
        login.matchPending,
        login.matchFulfilled,
        checkSession.matchPending,
        checkSession.matchFulfilled
      )
    })
  })
})

describe('hooks with createApi defaults set', () => {
  const defaultApi = createApi({
    baseQuery: async (arg: any) => {
      await waitMs()
      if ('amount' in arg?.body) {
        amount += 1
      }
      return {
        data: arg?.body
          ? { ...arg.body, ...(amount ? { amount } : {}) }
          : undefined,
      }
    },
    endpoints: (build) => ({
      getIncrementedAmount: build.query<any, void>({
        query: () => ({
          url: '',
          body: {
            amount,
          },
        }),
      }),
    }),
    refetchOnMountOrArgChange: true,
  })

  const storeRef = setupApiStore(defaultApi)
  test('useQuery hook respects refetchOnMountOrArgChange: true when set in createApi options', async () => {
    let data, isLoading, isFetching

    function User() {
      ;({ data, isLoading } =
        defaultApi.endpoints.getIncrementedAmount.useQuery())
      return (
        <div>
          <div data-testid="isLoading">{String(isLoading)}</div>
          <div data-testid="amount">{String(data?.amount)}</div>
        </div>
      )
    }

    const { unmount } = render(<User />, { wrapper: storeRef.wrapper })

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('true')
    )
    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    )

    await waitFor(() =>
      expect(screen.getByTestId('amount').textContent).toBe('1')
    )

    unmount()

    function OtherUser() {
      ;({ data, isFetching } =
        defaultApi.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: true,
        }))
      return (
        <div>
          <div data-testid="isFetching">{String(isFetching)}</div>
          <div data-testid="amount">{String(data?.amount)}</div>
        </div>
      )
    }

    render(<OtherUser />, { wrapper: storeRef.wrapper })
    // Let's make sure we actually fetch, and we increment
    await waitFor(() =>
      expect(screen.getByTestId('isFetching').textContent).toBe('true')
    )
    await waitFor(() =>
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
    )

    await waitFor(() =>
      expect(screen.getByTestId('amount').textContent).toBe('2')
    )
  })

  test('useQuery hook overrides default refetchOnMountOrArgChange: false that was set by createApi', async () => {
    let data, isLoading, isFetching

    function User() {
      ;({ data, isLoading } =
        defaultApi.endpoints.getIncrementedAmount.useQuery())
      return (
        <div>
          <div data-testid="isLoading">{String(isLoading)}</div>
          <div data-testid="amount">{String(data?.amount)}</div>
        </div>
      )
    }

    let { unmount } = render(<User />, { wrapper: storeRef.wrapper })

    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('true')
    )
    await waitFor(() =>
      expect(screen.getByTestId('isLoading').textContent).toBe('false')
    )

    await waitFor(() =>
      expect(screen.getByTestId('amount').textContent).toBe('1')
    )

    unmount()

    function OtherUser() {
      ;({ data, isFetching } =
        defaultApi.endpoints.getIncrementedAmount.useQuery(undefined, {
          refetchOnMountOrArgChange: false,
        }))
      return (
        <div>
          <div data-testid="isFetching">{String(isFetching)}</div>
          <div data-testid="amount">{String(data?.amount)}</div>
        </div>
      )
    }

    render(<OtherUser />, { wrapper: storeRef.wrapper })

    await waitFor(() =>
      expect(screen.getByTestId('isFetching').textContent).toBe('false')
    )
    await waitFor(() =>
      expect(screen.getByTestId('amount').textContent).toBe('1')
    )
  })

  describe('selectFromResult (query) behaviors', () => {
    let startingId = 3
    const initialPosts = [
      { id: 1, name: 'A sample post', fetched_at: new Date().toUTCString() },
      {
        id: 2,
        name: 'A post about rtk-query',
        fetched_at: new Date().toUTCString(),
      },
    ]
    let posts = [] as typeof initialPosts

    beforeEach(() => {
      startingId = 3
      posts = [...initialPosts]

      const handlers = [
        rest.get('http://example.com/posts', (req, res, ctx) => {
          return res(ctx.json(posts))
        }),
        rest.put<Partial<Post>>(
          'http://example.com/post/:id',
          (req, res, ctx) => {
            const id = Number(req.params.id)
            const idx = posts.findIndex((post) => post.id === id)

            const newPosts = posts.map((post, index) =>
              index !== idx
                ? post
                : {
                    ...req.body,
                    id,
                    name: req.body.name || post.name,
                    fetched_at: new Date().toUTCString(),
                  }
            )
            posts = [...newPosts]

            return res(ctx.json(posts))
          }
        ),
        rest.post('http://example.com/post', (req, res, ctx) => {
          let post = req.body as Omit<Post, 'id'>
          startingId += 1
          posts.concat({
            ...post,
            fetched_at: new Date().toISOString(),
            id: startingId,
          })
          return res(ctx.json(posts))
        }),
      ]

      server.use(...handlers)
    })

    interface Post {
      id: number
      name: string
      fetched_at: string
    }

    type PostsResponse = Post[]

    const api = createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'http://example.com/' }),
      tagTypes: ['Posts'],
      endpoints: (build) => ({
        getPosts: build.query<PostsResponse, void>({
          query: () => ({ url: 'posts' }),
          providesTags: (result) =>
            result ? result.map(({ id }) => ({ type: 'Posts', id })) : [],
        }),
        updatePost: build.mutation<Post, Partial<Post>>({
          query: ({ id, ...body }) => ({
            url: `post/${id}`,
            method: 'PUT',
            body,
          }),
          invalidatesTags: (result, error, { id }) => [{ type: 'Posts', id }],
        }),
        addPost: build.mutation<Post, Partial<Post>>({
          query: (body) => ({
            url: `post`,
            method: 'POST',
            body,
          }),
          invalidatesTags: ['Posts'],
        }),
      }),
    })

    const storeRef = setupApiStore(api)

    // @pre41-ts-ignore
    expectExactType(api.useGetPostsQuery)(api.endpoints.getPosts.useQuery)
    // @pre41-ts-ignore
    expectExactType(api.useUpdatePostMutation)(
      // @pre41-ts-ignore
      api.endpoints.updatePost.useMutation
    )
    // @pre41-ts-ignore
    expectExactType(api.useAddPostMutation)(api.endpoints.addPost.useMutation)

    test('useQueryState serves a deeply memoized value and does not rerender unnecessarily', async () => {
      function Posts() {
        const { data: posts } = api.endpoints.getPosts.useQuery()
        const [addPost] = api.endpoints.addPost.useMutation()
        return (
          <div>
            <button
              data-testid="addPost"
              onClick={() => addPost({ name: `some text ${posts?.length}` })}
            >
              Add random post
            </button>
          </div>
        )
      }

      function SelectedPost() {
        const { post } = api.endpoints.getPosts.useQueryState(undefined, {
          selectFromResult: ({ data }) => ({
            post: data?.find((post) => post.id === 1),
          }),
        })
        getRenderCount = useRenderCounter()

        /**
         * Notes on the renderCount behavior
         *
         * We initialize at 0, and the first render will bump that 1 while post is `undefined`.
         * Once the request resolves, it will be at 2. What we're looking for is to make sure that
         * any requests that don't directly change the value of the selected item will have no impact
         * on rendering.
         */

        return <div />
      }

      render(
        <div>
          <Posts />
          <SelectedPost />
        </div>,
        { wrapper: storeRef.wrapper }
      )

      expect(getRenderCount()).toBe(1)

      const addBtn = screen.getByTestId('addPost')

      await waitFor(() => expect(getRenderCount()).toBe(2))

      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))
      // We fire off a few requests that would typically cause a rerender as JSON.parse() on a request would always be a new object.
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))
      // Being that it didn't rerender, we can be assured that the behavior is correct
    })

    /**
     * This test shows that even though a user can select a specific post, the fetching/loading flags
     * will still cause rerenders for the query. This should show that if you're using selectFromResult,
     * the 'performance' value comes with selecting _only_ the data.
     */
    test('useQuery with selectFromResult with all flags destructured rerenders like the default useQuery behavior', async () => {
      function Posts() {
        const { data: posts } = api.endpoints.getPosts.useQuery()
        const [addPost] = api.endpoints.addPost.useMutation()
        getRenderCount = useRenderCounter()
        return (
          <div>
            <button
              data-testid="addPost"
              onClick={() =>
                addPost({
                  name: `some text ${posts?.length}`,
                  fetched_at: new Date().toISOString(),
                })
              }
            >
              Add random post
            </button>
          </div>
        )
      }

      function SelectedPost() {
        getRenderCount = useRenderCounter()

        const { post } = api.endpoints.getPosts.useQuery(undefined, {
          selectFromResult: ({
            data,
            isUninitialized,
            isLoading,
            isFetching,
            isSuccess,
            isError,
          }) => ({
            post: data?.find((post) => post.id === 1),
            isUninitialized,
            isLoading,
            isFetching,
            isSuccess,
            isError,
          }),
        })

        return <div />
      }

      render(
        <div>
          <Posts />
          <SelectedPost />
        </div>,
        { wrapper: storeRef.wrapper }
      )
      expect(getRenderCount()).toBe(2)

      const addBtn = screen.getByTestId('addPost')

      await waitFor(() => expect(getRenderCount()).toBe(3))

      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(5))
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(9))
    })

    test('useQuery with selectFromResult option serves a deeply memoized value and does not rerender unnecessarily', async () => {
      function Posts() {
        const { data: posts } = api.endpoints.getPosts.useQuery()
        const [addPost] = api.endpoints.addPost.useMutation()
        return (
          <div>
            <button
              data-testid="addPost"
              onClick={() =>
                addPost({
                  name: `some text ${posts?.length}`,
                  fetched_at: new Date().toISOString(),
                })
              }
            >
              Add random post
            </button>
          </div>
        )
      }

      function SelectedPost() {
        getRenderCount = useRenderCounter()
        const { post } = api.endpoints.getPosts.useQuery(undefined, {
          selectFromResult: ({ data }) => ({
            post: data?.find((post) => post.id === 1),
          }),
        })

        return <div />
      }

      render(
        <div>
          <Posts />
          <SelectedPost />
        </div>,
        { wrapper: storeRef.wrapper }
      )
      expect(getRenderCount()).toBe(1)

      const addBtn = screen.getByTestId('addPost')

      await waitFor(() => expect(getRenderCount()).toBe(2))

      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))
    })

    test('useQuery with selectFromResult option serves a deeply memoized value, then ONLY updates when the underlying data changes', async () => {
      let expectablePost: Post | undefined
      function Posts() {
        const { data: posts } = api.endpoints.getPosts.useQuery()
        const [addPost] = api.endpoints.addPost.useMutation()
        const [updatePost] = api.endpoints.updatePost.useMutation()

        return (
          <div>
            <button
              data-testid="addPost"
              onClick={() =>
                addPost({
                  name: `some text ${posts?.length}`,
                  fetched_at: new Date().toISOString(),
                })
              }
            >
              Add random post
            </button>
            <button
              data-testid="updatePost"
              onClick={() => updatePost({ id: 1, name: 'supercoooll!' })}
            >
              Update post
            </button>
          </div>
        )
      }

      function SelectedPost() {
        const { post } = api.endpoints.getPosts.useQuery(undefined, {
          selectFromResult: ({ data }) => ({
            post: data?.find((post) => post.id === 1),
          }),
        })
        getRenderCount = useRenderCounter()

        React.useEffect(() => {
          expectablePost = post
        }, [post])

        return (
          <div>
            <div data-testid="postName">{post?.name}</div>
          </div>
        )
      }

      render(
        <div>
          <Posts />
          <SelectedPost />
        </div>,
        { wrapper: storeRef.wrapper }
      )
      expect(getRenderCount()).toBe(1)

      const addBtn = screen.getByTestId('addPost')
      const updateBtn = screen.getByTestId('updatePost')

      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(2))

      fireEvent.click(updateBtn)
      await waitFor(() => expect(getRenderCount()).toBe(3))
      expect(expectablePost?.name).toBe('supercoooll!')

      fireEvent.click(addBtn)
      await waitFor(() => expect(getRenderCount()).toBe(3))
    })

    test('useQuery with selectFromResult option has a type error if the result is not an object', async () => {
      function SelectedPost() {
        const _res1 = api.endpoints.getPosts.useQuery(undefined, {
          // selectFromResult must always return an object
          // @ts-expect-error
          selectFromResult: ({ data }) => data?.length ?? 0,
        })

        const res2 = api.endpoints.getPosts.useQuery(undefined, {
          // selectFromResult must always return an object
          selectFromResult: ({ data }) => ({ size: data?.length ?? 0 }),
        })

        return (
          <div>
            <div data-testid="size2">{res2.size}</div>
          </div>
        )
      }

      render(
        <div>
          <SelectedPost />
        </div>,
        { wrapper: storeRef.wrapper }
      )

      expect(screen.getByTestId('size2').textContent).toBe('0')
    })
  })

  describe('selectFromResult (mutation) behavior', () => {
    const api = createApi({
      baseQuery: async (arg: any) => {
        await waitMs()
        if ('amount' in arg?.body) {
          amount += 1
        }
        return {
          data: arg?.body
            ? { ...arg.body, ...(amount ? { amount } : {}) }
            : undefined,
        }
      },
      endpoints: (build) => ({
        increment: build.mutation<{ amount: number }, number>({
          query: (amount) => ({
            url: '',
            method: 'POST',
            body: {
              amount,
            },
          }),
        }),
      }),
    })

    const storeRef = setupApiStore(api, {
      ...actionsReducer,
    })

    it('causes no more than one rerender when using selectFromResult with an empty object', async () => {
      function Counter() {
        const [increment] = api.endpoints.increment.useMutation({
          selectFromResult: () => ({}),
        })
        getRenderCount = useRenderCounter()

        return (
          <div>
            <button
              data-testid="incrementButton"
              onClick={() => increment(1)}
            ></button>
          </div>
        )
      }

      render(<Counter />, { wrapper: storeRef.wrapper })

      expect(getRenderCount()).toBe(1)

      fireEvent.click(screen.getByTestId('incrementButton'))
      await waitMs(200) // give our baseQuery a chance to return
      expect(getRenderCount()).toBe(2)

      fireEvent.click(screen.getByTestId('incrementButton'))
      await waitMs(200)
      expect(getRenderCount()).toBe(3)

      const { increment } = api.endpoints

      expect(storeRef.store.getState().actions).toMatchSequence(
        api.internalActions.middlewareRegistered.match,
        increment.matchPending,
        increment.matchFulfilled,
        api.internalActions.unsubscribeMutationResult.match,
        increment.matchPending,
        increment.matchFulfilled
      )
    })

    it('causes rerenders when only selected data changes', async () => {
      function Counter() {
        const [increment, { data }] = api.endpoints.increment.useMutation({
          selectFromResult: ({ data }) => ({ data }),
        })
        getRenderCount = useRenderCounter()

        return (
          <div>
            <button
              data-testid="incrementButton"
              onClick={() => increment(1)}
            ></button>
            <div data-testid="data">{JSON.stringify(data)}</div>
          </div>
        )
      }

      render(<Counter />, { wrapper: storeRef.wrapper })

      expect(getRenderCount()).toBe(1)

      fireEvent.click(screen.getByTestId('incrementButton'))
      await waitFor(() =>
        expect(screen.getByTestId('data').textContent).toBe(
          JSON.stringify({ amount: 1 })
        )
      )
      expect(getRenderCount()).toBe(3)

      fireEvent.click(screen.getByTestId('incrementButton'))
      await waitFor(() =>
        expect(screen.getByTestId('data').textContent).toBe(
          JSON.stringify({ amount: 2 })
        )
      )
      expect(getRenderCount()).toBe(5)
    })

    it('causes the expected # of rerenders when NOT using selectFromResult', async () => {
      function Counter() {
        const [increment, data] = api.endpoints.increment.useMutation()
        getRenderCount = useRenderCounter()

        return (
          <div>
            <button
              data-testid="incrementButton"
              onClick={() => increment(1)}
            ></button>
            <div data-testid="status">{String(data.status)}</div>
          </div>
        )
      }

      render(<Counter />, { wrapper: storeRef.wrapper })

      expect(getRenderCount()).toBe(1) // mount, uninitialized status in substate

      fireEvent.click(screen.getByTestId('incrementButton'))

      expect(getRenderCount()).toBe(2) // will be pending, isLoading: true,
      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('pending')
      )
      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('fulfilled')
      )
      expect(getRenderCount()).toBe(3)

      fireEvent.click(screen.getByTestId('incrementButton'))
      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('pending')
      )
      await waitFor(() =>
        expect(screen.getByTestId('status').textContent).toBe('fulfilled')
      )
      expect(getRenderCount()).toBe(5)
    })

    test('useMutation return value contains originalArgs', async () => {
      const { result } = renderHook(api.endpoints.increment.useMutation, {
        wrapper: storeRef.wrapper,
      })

      const firstRenderResult = result.current
      expect(firstRenderResult[1].originalArgs).toBe(undefined)
      firstRenderResult[0](5)
      const secondRenderResult = result.current
      expect(firstRenderResult[1].originalArgs).toBe(undefined)
      expect(secondRenderResult[1].originalArgs).toBe(5)
    })

    it('useMutation with selectFromResult option has a type error if the result is not an object', async () => {
      function Counter() {
        const [increment] = api.endpoints.increment.useMutation({
          // selectFromResult must always return an object
          // @ts-expect-error
          selectFromResult: () => 42,
        })

        return (
          <div>
            <button
              data-testid="incrementButton"
              onClick={() => increment(1)}
            ></button>
          </div>
        )
      }

      render(<Counter />, { wrapper: storeRef.wrapper })
    })
  })
})

describe('skip behaviour', () => {
  const uninitialized = {
    status: QueryStatus.uninitialized,
    refetch: expect.any(Function),
    data: undefined,
    isError: false,
    isFetching: false,
    isLoading: false,
    isSuccess: false,
    isUninitialized: true,
  }

  function subscriptionCount(key: string) {
    return Object.keys(storeRef.store.getState().api.subscriptions[key] || {})
      .length
  }

  test('normal skip', async () => {
    const { result, rerender } = renderHook(
      ([arg, options]: Parameters<typeof api.endpoints.getUser.useQuery>) =>
        api.endpoints.getUser.useQuery(arg, options),
      {
        wrapper: storeRef.wrapper,
        initialProps: [1, { skip: true }],
      }
    )

    expect(result.current).toEqual(uninitialized)
    expect(subscriptionCount('getUser(1)')).toBe(0)

    rerender([1])
    expect(result.current).toMatchObject({ status: QueryStatus.pending })
    expect(subscriptionCount('getUser(1)')).toBe(1)

    rerender([1, { skip: true }])
    expect(result.current).toEqual(uninitialized)
    expect(subscriptionCount('getUser(1)')).toBe(0)
  })

  test('skipToken', async () => {
    const { result, rerender } = renderHook(
      ([arg, options]: Parameters<typeof api.endpoints.getUser.useQuery>) =>
        api.endpoints.getUser.useQuery(arg, options),
      {
        wrapper: storeRef.wrapper,
        initialProps: [skipToken],
      }
    )

    expect(result.current).toEqual(uninitialized)
    expect(subscriptionCount('getUser(1)')).toBe(0)
    // also no subscription on `getUser(skipToken)` or similar:
    expect(storeRef.store.getState().api.subscriptions).toEqual({})

    rerender([1])
    expect(result.current).toMatchObject({ status: QueryStatus.pending })
    expect(subscriptionCount('getUser(1)')).toBe(1)
    expect(storeRef.store.getState().api.subscriptions).not.toEqual({})

    rerender([skipToken])
    expect(result.current).toEqual(uninitialized)
    expect(subscriptionCount('getUser(1)')).toBe(0)
  })
})
