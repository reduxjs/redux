import { createSlice } from '@reduxjs/toolkit'
import { createApi } from '@reduxjs/toolkit/query'
import { setupApiStore } from './helpers'

let shouldApiResponseSuccess = true

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const baseQuery = (args?: any) => ({ data: args })
const api = createApi({
  baseQuery,
  tagTypes: ['SUCCEED', 'FAILED'],
  endpoints: (build) => ({
    getUser: build.query<{ url: string; success: boolean }, number>({
      query(id) {
        return { url: `user/${id}`, success: shouldApiResponseSuccess }
      },
      providesTags: (result) => (result?.success ? ['SUCCEED'] : ['FAILED']),
    }),
  }),
})
const { getUser } = api.endpoints

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: '1234',
  },
  reducers: {
    setToken(state, action) {
      state.token = action.payload
    },
  },
})

const storeRef = setupApiStore(api, { auth: authSlice.reducer })

describe('buildSlice', () => {
  beforeEach(() => {
    shouldApiResponseSuccess = true
  })

  it('only resets the api state when resetApiState is dispatched', async () => {
    storeRef.store.dispatch({ type: 'unrelated' }) // trigger "registered middleware" into place
    const initialState = storeRef.store.getState()

    await storeRef.store.dispatch(
      getUser.initiate(1, { subscriptionOptions: { pollingInterval: 10 } })
    )

    expect(storeRef.store.getState()).toEqual({
      api: {
        config: {
          focused: true,
          keepUnusedDataFor: 60,
          middlewareRegistered: true,
          online: true,
          reducerPath: 'api',
          refetchOnFocus: false,
          refetchOnMountOrArgChange: false,
          refetchOnReconnect: false,
        },
        mutations: {},
        provided: {
          SUCCEED: {
            __internal_without_id: ['getUser(1)'],
          },
        },
        queries: {
          'getUser(1)': {
            data: {
              url: 'user/1',
              success: true,
            },
            endpointName: 'getUser',
            fulfilledTimeStamp: expect.any(Number),
            originalArgs: 1,
            requestId: expect.any(String),
            startedTimeStamp: expect.any(Number),
            status: 'fulfilled',
          },
        },
        subscriptions: {
          'getUser(1)': expect.any(Object),
        },
      },
      auth: {
        token: '1234',
      },
    })

    storeRef.store.dispatch(api.util.resetApiState())

    expect(storeRef.store.getState()).toEqual(initialState)
  })

  it('replaces previous tags with new provided tags', async () => {
    await storeRef.store.dispatch(getUser.initiate(1))

    expect(
      api.util.selectInvalidatedBy(storeRef.store.getState(), ['SUCCEED'])
    ).toHaveLength(1)
    expect(
      api.util.selectInvalidatedBy(storeRef.store.getState(), ['FAILED'])
    ).toHaveLength(0)

    shouldApiResponseSuccess = false

    storeRef.store.dispatch(getUser.initiate(1)).refetch()

    await delay(10)

    expect(
      api.util.selectInvalidatedBy(storeRef.store.getState(), ['SUCCEED'])
    ).toHaveLength(0)
    expect(
      api.util.selectInvalidatedBy(storeRef.store.getState(), ['FAILED'])
    ).toHaveLength(1)
  })
})
