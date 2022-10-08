// tests for "cleanup-after-unsubscribe" behaviour

import React, { Profiler, ProfilerOnRenderCallback } from 'react'

import { createListenerMiddleware } from '@reduxjs/toolkit'
import { createApi, QueryStatus } from '@reduxjs/toolkit/query/react'
import { render, waitFor, act, screen } from '@testing-library/react'
import { setupApiStore } from './helpers'
import { delay } from '../../utils'

const tick = () => new Promise((res) => setImmediate(res))

export const runAllTimers = async () => jest.runAllTimers() && (await tick())

const api = createApi({
  baseQuery: () => ({ data: 42 }),
  endpoints: (build) => ({
    a: build.query<unknown, void>({ query: () => '' }),
    b: build.query<unknown, void>({ query: () => '' }),
  }),
})
const storeRef = setupApiStore(api)

let getSubStateA = () => storeRef.store.getState().api.queries['a(undefined)']
let getSubStateB = () => storeRef.store.getState().api.queries['b(undefined)']

function UsingA() {
  const { data } = api.endpoints.a.useQuery()

  return <>Result: {data} </>
}

function UsingB() {
  api.endpoints.b.useQuery()

  return <></>
}

function UsingAB() {
  api.endpoints.a.useQuery()
  api.endpoints.b.useQuery()

  return <></>
}

beforeAll(() => {
  jest.useFakeTimers('legacy')
})

test('data stays in store when component stays rendered', async () => {
  expect(getSubStateA()).toBeUndefined()

  render(<UsingA />, { wrapper: storeRef.wrapper })
  await waitFor(() =>
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
  )

  jest.advanceTimersByTime(120000)

  await waitFor(() =>
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
  )
})

test('data is removed from store after 60 seconds', async () => {
  expect(getSubStateA()).toBeUndefined()

  const { unmount } = render(<UsingA />, { wrapper: storeRef.wrapper })
  await waitFor(() =>
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
  )

  unmount()

  jest.advanceTimersByTime(59000)

  expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)

  jest.advanceTimersByTime(2000)

  expect(getSubStateA()).toBeUndefined()
})

test('data stays in store when component stays rendered while data for another component is removed after it unmounted', async () => {
  expect(getSubStateA()).toBeUndefined()
  expect(getSubStateB()).toBeUndefined()

  const { rerender } = render(
    <>
      <UsingA />
      <UsingB />
    </>,
    { wrapper: storeRef.wrapper }
  )
  await waitFor(() => {
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
    expect(getSubStateB()?.status).toBe(QueryStatus.fulfilled)
  })

  const statusA = getSubStateA()

  await act(async () => {
    rerender(
      <>
        <UsingA />
      </>
    )

    jest.advanceTimersByTime(10)
  })

  jest.advanceTimersByTime(120000)

  expect(getSubStateA()).toEqual(statusA)
  expect(getSubStateB()).toBeUndefined()
})

test('data stays in store when one component requiring the data stays in the store', async () => {
  expect(getSubStateA()).toBeUndefined()
  expect(getSubStateB()).toBeUndefined()

  const { rerender } = render(
    <>
      <UsingA key="a" />
      <UsingAB key="ab" />
    </>,
    { wrapper: storeRef.wrapper }
  )
  await waitFor(() => {
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
    expect(getSubStateB()?.status).toBe(QueryStatus.fulfilled)
  })

  const statusA = getSubStateA()
  const statusB = getSubStateB()

  await act(async () => {
    rerender(
      <>
        <UsingAB key="ab" />
      </>
    )
    jest.advanceTimersByTime(10)
    jest.runAllTimers()
  })

  await act(async () => {
    jest.advanceTimersByTime(120000)
    jest.runAllTimers()
  })

  expect(getSubStateA()).toEqual(statusA)
  expect(getSubStateB()).toEqual(statusB)
})

test('Minimizes the number of subscription dispatches when multiple components ask for the same data', async () => {
  const listenerMiddleware = createListenerMiddleware()
  const storeRef = setupApiStore(api, undefined, {
    middleware: {
      concat: [listenerMiddleware.middleware],
    },
    withoutTestLifecycles: true,
  })

  const onProfile: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    console.table({
      phase,
      actualDuration,
      baseDuration,
    })
  }

  let getSubscriptionsA = () =>
    storeRef.store.getState().api.subscriptions['a(undefined)']

  let actionTypes: string[] = []

  listenerMiddleware.startListening({
    predicate: () => true,
    effect: (action) => {
      actionTypes.push(action.type)
    },
  })

  const NUM_LIST_ITEMS = 1000

  function ParentComponent() {
    const listItems = Array.from({ length: NUM_LIST_ITEMS }).map((_, i) => (
      <UsingA key={i} />
    ))

    return <>{listItems}</>
  }

  const start = Date.now()

  render(
    // <Profiler id="a" onRender={onProfile}>
    <ParentComponent />,
    // </Profiler>,
    {
      wrapper: storeRef.wrapper,
    }
  )

  const afterRender = Date.now()

  jest.advanceTimersByTime(10)

  const afterTimers1 = Date.now()

  await waitFor(() => {
    return screen.getAllByText(/42/).length > 0
  })

  const afterScreen = Date.now()

  await runAllTimers()

  const end = Date.now()

  const timeElapsed = end - start
  // const renderTime = afterRender - start
  // const timer1Time = afterTimers1 - afterRender
  // const screenTime = afterScreen - afterTimers1
  // const timer2Time = end - afterScreen

  // console.table({
  //   timeElapsed,
  //   renderTime,
  //   timer1Time,
  //   screenTime,
  //   timer2Time,
  // })

  // console.log('Getting final subscriptions')
  const subscriptions = getSubscriptionsA()
  // console.log(actionTypes)

  expect(Object.keys(subscriptions!).length).toBe(NUM_LIST_ITEMS)

  expect(actionTypes).toEqual([
    'api/config/middlewareRegistered',
    'api/executeQuery/pending',
    'api/internalSubscriptions/subscriptionsUpdated',
    'api/executeQuery/fulfilled',
  ])

  // Could be flaky in CI, but we'll see.
  // Currently seeing 800ms in local dev, 6300 without the batching fixes
  // console.log('Elapsed subscription time: ', timeElapsed)
  expect(timeElapsed).toBeLessThan(1500)
}, 25000)
