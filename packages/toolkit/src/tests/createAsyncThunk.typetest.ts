/* eslint-disable no-lone-blocks */
import type { AnyAction, SerializedError, AsyncThunk } from '@reduxjs/toolkit'
import { createAsyncThunk, createReducer, unwrapResult } from '@reduxjs/toolkit'
import type { ThunkDispatch } from 'redux-thunk'

import type { AxiosError } from 'axios'
import apiRequest from 'axios'
import type { IsAny, IsUnknown } from '@internal/tsHelpers'
import { expectType } from './helpers'
import { AsyncThunkPayloadCreator } from '@internal/createAsyncThunk'

const defaultDispatch = (() => {}) as ThunkDispatch<{}, any, AnyAction>
const anyAction = { type: 'foo' } as AnyAction

// basic usage
;(async function () {
  const async = createAsyncThunk('test', (id: number) =>
    Promise.resolve(id * 2)
  )

  const reducer = createReducer({}, (builder) =>
    builder
      .addCase(async.pending, (_, action) => {
        expectType<ReturnType<typeof async['pending']>>(action)
      })
      .addCase(async.fulfilled, (_, action) => {
        expectType<ReturnType<typeof async['fulfilled']>>(action)
        expectType<number>(action.payload)
      })
      .addCase(async.rejected, (_, action) => {
        expectType<ReturnType<typeof async['rejected']>>(action)
        expectType<Partial<Error> | undefined>(action.error)
      })
  )

  const promise = defaultDispatch(async(3))

  expectType<string>(promise.requestId)
  expectType<number>(promise.arg)
  expectType<(reason?: string) => void>(promise.abort)

  const result = await promise

  if (async.fulfilled.match(result)) {
    expectType<ReturnType<typeof async['fulfilled']>>(result)
    // @ts-expect-error
    expectType<ReturnType<typeof async['rejected']>>(result)
  } else {
    expectType<ReturnType<typeof async['rejected']>>(result)
    // @ts-expect-error
    expectType<ReturnType<typeof async['fulfilled']>>(result)
  }

  promise
    .then(unwrapResult)
    .then((result) => {
      expectType<number>(result)
      // @ts-expect-error
      expectType<Error>(result)
    })
    .catch((error) => {
      // catch is always any-typed, nothing we can do here
    })
})()

// More complex usage of thunk args
;(async function () {
  interface BookModel {
    id: string
    title: string
  }

  type BooksState = BookModel[]

  const fakeBooks: BookModel[] = [
    { id: 'b', title: 'Second' },
    { id: 'a', title: 'First' },
  ]

  const correctDispatch = (() => {}) as ThunkDispatch<
    BookModel[],
    { userAPI: Function },
    AnyAction
  >

  // Verify that the the first type args to createAsyncThunk line up right
  const fetchBooksTAC = createAsyncThunk<
    BookModel[],
    number,
    {
      state: BooksState
      extra: { userAPI: Function }
    }
  >(
    'books/fetch',
    async (arg, { getState, dispatch, extra, requestId, signal }) => {
      const state = getState()

      expectType<number>(arg)
      expectType<BookModel[]>(state)
      expectType<{ userAPI: Function }>(extra)
      return fakeBooks
    }
  )

  correctDispatch(fetchBooksTAC(1))
  // @ts-expect-error
  defaultDispatch(fetchBooksTAC(1))
})()
/**
 * returning a rejected action from the promise creator is possible
 */
;(async () => {
  type ReturnValue = { data: 'success' }
  type RejectValue = { data: 'error' }

  const fetchBooksTAC = createAsyncThunk<
    ReturnValue,
    number,
    {
      rejectValue: RejectValue
    }
  >('books/fetch', async (arg, { rejectWithValue }) => {
    return rejectWithValue({ data: 'error' })
  })

  const returned = await defaultDispatch(fetchBooksTAC(1))
  if (fetchBooksTAC.rejected.match(returned)) {
    expectType<undefined | RejectValue>(returned.payload)
    expectType<RejectValue>(returned.payload!)
  } else {
    expectType<ReturnValue>(returned.payload)
  }

  expectType<ReturnValue>(unwrapResult(returned))
  // @ts-expect-error
  expectType<RejectValue>(unwrapResult(returned))
})()

{
  interface Item {
    name: string
  }

  interface ErrorFromServer {
    error: string
  }

  interface CallsResponse {
    data: Item[]
  }

  const fetchLiveCallsError = createAsyncThunk<
    Item[],
    string,
    {
      rejectValue: ErrorFromServer
    }
  >('calls/fetchLiveCalls', async (organizationId, { rejectWithValue }) => {
    try {
      const result = await apiRequest.get<CallsResponse>(
        `organizations/${organizationId}/calls/live/iwill404`
      )
      return result.data.data
    } catch (err) {
      let error: AxiosError<ErrorFromServer> = err as any // cast for access to AxiosError properties
      if (!error.response) {
        // let it be handled as any other unknown error
        throw err
      }
      return rejectWithValue(error.response && error.response.data)
    }
  })

  defaultDispatch(fetchLiveCallsError('asd')).then((result) => {
    if (fetchLiveCallsError.fulfilled.match(result)) {
      //success
      expectType<ReturnType<typeof fetchLiveCallsError['fulfilled']>>(result)
      expectType<Item[]>(result.payload)
    } else {
      expectType<ReturnType<typeof fetchLiveCallsError['rejected']>>(result)
      if (result.payload) {
        // rejected with value
        expectType<ErrorFromServer>(result.payload)
      } else {
        // rejected by throw
        expectType<undefined>(result.payload)
        expectType<SerializedError>(result.error)
        // @ts-expect-error
        expectType<IsAny<typeof result['error'], true, false>>(true)
      }
    }
    defaultDispatch(fetchLiveCallsError('asd'))
      .then((result) => {
        expectType<Item[] | ErrorFromServer | undefined>(result.payload)
        // @ts-expect-error
        expectType<Item[]>(unwrapped)
        return result
      })
      .then(unwrapResult)
      .then((unwrapped) => {
        expectType<Item[]>(unwrapped)
        // @ts-expect-error
        expectType<ErrorFromServer>(unwrapResult(unwrapped))
      })
  })
}

/**
 * payloadCreator first argument type has impact on asyncThunk argument
 */
{
  // no argument: asyncThunk has no argument
  {
    const asyncThunk = createAsyncThunk('test', () => 0)
    expectType<() => any>(asyncThunk)
    // @ts-expect-error cannot be called with an argument
    asyncThunk(0 as any)
  }

  // one argument, specified as undefined: asyncThunk has no argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: undefined) => 0)
    expectType<() => any>(asyncThunk)
    // @ts-expect-error cannot be called with an argument
    asyncThunk(0 as any)
  }

  // one argument, specified as void: asyncThunk has no argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: void) => 0)
    expectType<() => any>(asyncThunk)
    // @ts-expect-error cannot be called with an argument
    asyncThunk(0 as any)
  }

  // one argument, specified as optional number: asyncThunk has optional number argument
  // this test will fail with strictNullChecks: false, that is to be expected
  // in that case, we have to forbid this behaviour or it will make arguments optional everywhere
  {
    const asyncThunk = createAsyncThunk('test', (arg?: number) => 0)
    expectType<(arg?: number) => any>(asyncThunk)
    asyncThunk()
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk('string')
  }

  // one argument, specified as number|undefined: asyncThunk has optional number argument
  // this test will fail with strictNullChecks: false, that is to be expected
  // in that case, we have to forbid this behaviour or it will make arguments optional everywhere
  {
    const asyncThunk = createAsyncThunk('test', (arg: number | undefined) => 0)
    expectType<(arg?: number) => any>(asyncThunk)
    asyncThunk()
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk('string')
  }

  // one argument, specified as number|void: asyncThunk has optional number argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: number | void) => 0)
    expectType<(arg?: number) => any>(asyncThunk)
    asyncThunk()
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk('string')
  }

  // one argument, specified as any: asyncThunk has required any argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: any) => 0)
    expectType<IsAny<Parameters<typeof asyncThunk>[0], true, false>>(true)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }

  // one argument, specified as unknown: asyncThunk has required unknown argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: unknown) => 0)
    expectType<IsUnknown<Parameters<typeof asyncThunk>[0], true, false>>(true)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }

  // one argument, specified as number: asyncThunk has required number argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: number) => 0)
    expectType<(arg: number) => any>(asyncThunk)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }

  // two arguments, first specified as undefined: asyncThunk has no argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: undefined, thunkApi) => 0)
    expectType<() => any>(asyncThunk)
    // @ts-expect-error cannot be called with an argument
    asyncThunk(0 as any)
  }

  // two arguments, first specified as void: asyncThunk has no argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: void, thunkApi) => 0)
    expectType<() => any>(asyncThunk)
    // @ts-expect-error cannot be called with an argument
    asyncThunk(0 as any)
  }

  // two arguments, first specified as number|undefined: asyncThunk has optional number argument
  // this test will fail with strictNullChecks: false, that is to be expected
  // in that case, we have to forbid this behaviour or it will make arguments optional everywhere
  {
    const asyncThunk = createAsyncThunk(
      'test',
      (arg: number | undefined, thunkApi) => 0
    )
    expectType<(arg?: number) => any>(asyncThunk)
    asyncThunk()
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk('string')
  }

  // two arguments, first specified as number|void: asyncThunk has optional number argument
  {
    const asyncThunk = createAsyncThunk(
      'test',
      (arg: number | void, thunkApi) => 0
    )
    expectType<(arg?: number) => any>(asyncThunk)
    asyncThunk()
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk('string')
  }

  // two arguments, first specified as any: asyncThunk has required any argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: any, thunkApi) => 0)
    expectType<IsAny<Parameters<typeof asyncThunk>[0], true, false>>(true)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }

  // two arguments, first specified as unknown: asyncThunk has required unknown argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: unknown, thunkApi) => 0)
    expectType<IsUnknown<Parameters<typeof asyncThunk>[0], true, false>>(true)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }

  // two arguments, first specified as number: asyncThunk has required number argument
  {
    const asyncThunk = createAsyncThunk('test', (arg: number, thunkApi) => 0)
    expectType<(arg: number) => any>(asyncThunk)
    asyncThunk(5)
    // @ts-expect-error
    asyncThunk()
  }
}

{
  // createAsyncThunk without generics
  const thunk = createAsyncThunk('test', () => {
    return 'ret' as const
  })
  expectType<AsyncThunk<'ret', void, {}>>(thunk)
}

{
  // createAsyncThunk without generics, accessing `api` does not break return type
  const thunk = createAsyncThunk('test', (_: void, api) => {
    console.log(api)
    return 'ret' as const
  })
  expectType<AsyncThunk<'ret', void, {}>>(thunk)
}

{
  type Funky = { somethingElse: 'Funky!' }
  function funkySerializeError(err: any): Funky {
    return { somethingElse: 'Funky!' }
  }

  // has to stay on one line or type tests fail in older TS versions
  // prettier-ignore
  // @ts-expect-error
  const shouldFail = createAsyncThunk('without generics', () => {}, { serializeError: funkySerializeError })

  const shouldWork = createAsyncThunk<
    any,
    void,
    { serializedErrorType: Funky }
  >('with generics', () => {}, {
    serializeError: funkySerializeError,
  })

  if (shouldWork.rejected.match(anyAction)) {
    expectType<Funky>(anyAction.error)
  }
}

/**
 * `idGenerator` option takes no arguments, and returns a string
 */
{
  const returnsNumWithArgs = (foo: any) => 100
  // has to stay on one line or type tests fail in older TS versions
  // prettier-ignore
  // @ts-expect-error
  const shouldFailNumWithArgs = createAsyncThunk('foo', () => {}, { idGenerator: returnsNumWithArgs })

  const returnsNumWithoutArgs = () => 100
  // prettier-ignore
  // @ts-expect-error
  const shouldFailNumWithoutArgs = createAsyncThunk('foo', () => {}, { idGenerator: returnsNumWithoutArgs })

  const returnsStrWithArgs = (foo: any) => 'foo'
  // prettier-ignore
  // @ts-expect-error
  const shouldFailStrArgs = createAsyncThunk('foo', () => {}, { idGenerator: returnsStrWithArgs })

  const returnsStrWithoutArgs = () => 'foo'
  const shouldSucceed = createAsyncThunk('foo', () => {}, {
    idGenerator: returnsStrWithoutArgs,
  })
}

// meta return values
{
  // return values
  createAsyncThunk<'ret', void, {}>('test', (_, api) => 'ret' as const)
  createAsyncThunk<'ret', void, { fulfilledMeta: string }>('test', (_, api) =>
    api.fulfillWithValue('ret' as const, '')
  )
  createAsyncThunk<'ret', void, { fulfilledMeta: string }>(
    'test',
    // @ts-expect-error has to be a fulfilledWithValue call
    (_, api) => 'ret' as const
  )
  createAsyncThunk<'ret', void, { fulfilledMeta: string }>(
    'test', // @ts-expect-error should only allow returning with 'test'
    (_, api) => api.fulfillWithValue(5, '')
  )

  // reject values
  createAsyncThunk<'ret', void, { rejectValue: string }>('test', (_, api) =>
    api.rejectWithValue('ret')
  )
  createAsyncThunk<'ret', void, { rejectValue: string; rejectedMeta: number }>(
    'test',
    (_, api) => api.rejectWithValue('ret', 5)
  )
  createAsyncThunk<'ret', void, { rejectValue: string; rejectedMeta: number }>(
    'test',
    (_, api) => api.rejectWithValue('ret', 5)
  )
  createAsyncThunk<'ret', void, { rejectValue: string; rejectedMeta: number }>(
    'test',
    // @ts-expect-error wrong rejectedMeta type
    (_, api) => api.rejectWithValue('ret', '')
  )
  createAsyncThunk<'ret', void, { rejectValue: string; rejectedMeta: number }>(
    'test',
    // @ts-expect-error wrong rejectValue type
    (_, api) => api.rejectWithValue(5, '')
  )
}
