import type { SerializedError } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { expectExactType, expectType } from './helpers'

const api = createApi({
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    test: build.query<string, void>({ query: () => '' }),
    mutation: build.mutation<string, void>({ query: () => '' }),
  }),
})

describe.skip('TS only tests', () => {
  test('query selector union', () => {
    const result = api.endpoints.test.select()({} as any)

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isLoading) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })
  test('useQuery union', () => {
    const result = api.endpoints.test.useQuery()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isLoading) {
      expectExactType(undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isFetching) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as boolean)(result.isLoading)
      expectExactType(false as boolean)(result.isSuccess)
      expectExactType(false as false)(result.isError)
    }

    expectExactType('' as string | undefined)(result.currentData)
    // @ts-expect-error
    expectExactType('' as string)(result.currentData)

    if (result.isSuccess) {
      if (!result.isFetching) {
        expectExactType('' as string)(result.currentData)
      } else {
        expectExactType('' as string | undefined)(result.currentData)
        // @ts-expect-error
        expectExactType('' as string)(result.currentData)
      }
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })
  // pre41-remove-start
  test('useQuery TS4.1 union', () => {
    const result = api.useTestQuery()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isLoading) {
      expectExactType(undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isFetching) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as boolean)(result.isLoading)
      expectExactType(false as boolean)(result.isSuccess)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })
  // pre41-remove-end

  test('useLazyQuery union', () => {
    const [_trigger, result] = api.endpoints.test.useLazyQuery()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isLoading) {
      expectExactType(undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isFetching) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as boolean)(result.isLoading)
      expectExactType(false as boolean)(result.isSuccess)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })

  // pre41-remove-start
  test('useLazyQuery TS4.1 union', () => {
    const [_trigger, result] = api.useLazyTestQuery()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isLoading) {
      expectExactType(undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
      expectExactType(false as false)(result.isFetching)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as boolean)(result.isFetching)
    }
    if (result.isFetching) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as boolean)(result.isLoading)
      expectExactType(false as boolean)(result.isSuccess)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })
  // pre41-remove-end

  test('queryHookResult (without selector) union', () => {
    const useQueryStateResult = api.endpoints.test.useQueryState()
    const useQueryResult = api.endpoints.test.useQuery()
    const useQueryStateWithSelectFromResult = api.endpoints.test.useQueryState(
      undefined,
      {
        selectFromResult: () => true,
      }
    )

    const { refetch: _omit, ...useQueryResultWithoutMethods } = useQueryResult
    expectExactType(useQueryStateResult)(useQueryResultWithoutMethods)
    expectExactType(useQueryStateWithSelectFromResult)(
      // @ts-expect-error
      useQueryResultWithoutMethods
    )
  })

  test('useQueryState (with selectFromResult)', () => {
    const result = api.endpoints.test.useQueryState(undefined, {
      selectFromResult({
        data,
        isLoading,
        isFetching,
        isError,
        isSuccess,
        isUninitialized,
      }) {
        return {
          data: data ?? 1,
          isLoading,
          isFetching,
          isError,
          isSuccess,
          isUninitialized,
        }
      },
    })
    expectExactType({
      data: '' as string | number,
      isUninitialized: false,
      isLoading: true,
      isFetching: true,
      isSuccess: false,
      isError: false,
    })(result)
  })

  test('useQuery (with selectFromResult)', () => {
    const result = api.endpoints.test.useQuery(undefined, {
      selectFromResult({
        data,
        isLoading,
        isFetching,
        isError,
        isSuccess,
        isUninitialized,
      }) {
        return {
          data: data ?? 1,
          isLoading,
          isFetching,
          isError,
          isSuccess,
          isUninitialized,
        }
      },
    })
    expectExactType({
      data: '' as string | number,
      isUninitialized: false,
      isLoading: true,
      isFetching: true,
      isSuccess: false,
      isError: false,
      refetch: () => {},
    })(result)
  })

  test('useMutation union', () => {
    const [_trigger, result] = api.endpoints.mutation.useMutation()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isLoading) {
      expectExactType(undefined as undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })

  test('useMutation (with selectFromResult)', () => {
    const [_trigger, result] = api.endpoints.mutation.useMutation({
      selectFromResult({
        data,
        isLoading,
        isError,
        isSuccess,
        isUninitialized,
      }) {
        return {
          data: data ?? 'hi',
          isLoading,
          isError,
          isSuccess,
          isUninitialized,
        }
      },
    })
    expectExactType({
      data: '' as string,
      isUninitialized: false,
      isLoading: true,
      isSuccess: false,
      isError: false,
      reset: () => {},
    })(result)
  })

  // pre41-remove-start
  test('useMutation TS4.1 union', () => {
    const [_trigger, result] = api.useMutationMutation()

    if (result.isUninitialized) {
      expectExactType(undefined)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isLoading) {
      expectExactType(undefined as undefined)(result.data)
      expectExactType(
        undefined as SerializedError | FetchBaseQueryError | undefined
      )(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isError)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isError) {
      expectExactType('' as string | undefined)(result.data)
      expectExactType({} as SerializedError | FetchBaseQueryError)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isSuccess)
    }
    if (result.isSuccess) {
      expectExactType('' as string)(result.data)
      expectExactType(undefined)(result.error)

      expectExactType(false as false)(result.isUninitialized)
      expectExactType(false as false)(result.isLoading)
      expectExactType(false as false)(result.isError)
    }

    // @ts-expect-error
    expectType<never>(result)
    // is always one of those four
    if (
      !result.isUninitialized &&
      !result.isLoading &&
      !result.isError &&
      !result.isSuccess
    ) {
      expectType<never>(result)
    }
  })
  // pre41-remove-end
})
