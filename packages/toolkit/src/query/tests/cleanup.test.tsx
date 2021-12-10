// tests for "cleanup-after-unsubscribe" behaviour

import React from 'react'

import { createApi, QueryStatus } from '@reduxjs/toolkit/query/react'
import { render, waitFor } from '@testing-library/react'
import { setupApiStore } from './helpers'

const api = createApi({
  baseQuery: () => ({ data: null }),
  endpoints: (build) => ({
    a: build.query<unknown, void>({ query: () => '' }),
    b: build.query<unknown, void>({ query: () => '' }),
  }),
})
const storeRef = setupApiStore(api)

let getSubStateA = () => storeRef.store.getState().api.queries['a(undefined)']
let getSubStateB = () => storeRef.store.getState().api.queries['b(undefined)']

function UsingA() {
  api.endpoints.a.useQuery()
  return <></>
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
  jest.useFakeTimers()
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

  rerender(
    <>
      <UsingA />
    </>
  )

  jest.advanceTimersByTime(120000)

  expect(getSubStateA()).toEqual(statusA)
  expect(getSubStateB()).toBeUndefined()
})

test('data stays in store when one component requiring the data stays in the store', async () => {
  expect(getSubStateA()).toBeUndefined()
  expect(getSubStateB()).toBeUndefined()

  const { rerender } = render(
    <>
      <UsingA />
      <UsingAB />
    </>,
    { wrapper: storeRef.wrapper }
  )
  await waitFor(() => {
    expect(getSubStateA()?.status).toBe(QueryStatus.fulfilled)
    expect(getSubStateB()?.status).toBe(QueryStatus.fulfilled)
  })

  const statusA = getSubStateA()
  const statusB = getSubStateB()

  rerender(
    <>
      <UsingAB />
    </>
  )

  jest.advanceTimersByTime(120000)

  expect(getSubStateA()).toEqual(statusA)
  expect(getSubStateB()).toEqual(statusB)
})
