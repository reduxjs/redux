import { createAsyncThunk, SerializedError } from '@internal/createAsyncThunk'
import { executeReducerBuilderCallback } from '@internal/mapBuilders'
import type { AnyAction } from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'
import { expectType } from './helpers'

/** Test:  alternative builder callback for actionMap */
{
  const increment = createAction<number, 'increment'>('increment')
  const decrement = createAction<number, 'decrement'>('decrement')

  executeReducerBuilderCallback<number>((builder) => {
    builder.addCase(increment, (state, action) => {
      expectType<number>(state)
      expectType<{ type: 'increment'; payload: number }>(action)
      // @ts-expect-error
      expectType<string>(state)
      // @ts-expect-error
      expectType<{ type: 'increment'; payload: string }>(action)
      // @ts-expect-error
      expectType<{ type: 'decrement'; payload: number }>(action)
    })

    builder.addCase('increment', (state, action) => {
      expectType<number>(state)
      expectType<{ type: 'increment' }>(action)
      // @ts-expect-error
      expectType<{ type: 'decrement' }>(action)
      // @ts-expect-error - this cannot be inferred and has to be manually specified
      expectType<{ type: 'increment'; payload: number }>(action)
    })

    builder.addCase(
      increment,
      (state, action: ReturnType<typeof increment>) => state
    )
    // @ts-expect-error
    builder.addCase(
      increment,
      (state, action: ReturnType<typeof decrement>) => state
    )

    builder.addCase(
      'increment',
      (state, action: ReturnType<typeof increment>) => state
    )
    // @ts-expect-error
    builder.addCase(
      'decrement',
      (state, action: ReturnType<typeof increment>) => state
    )

    // action type is inferred
    builder.addMatcher(increment.match, (state, action) => {
      expectType<ReturnType<typeof increment>>(action)
    })

    // action type defaults to AnyAction if no type predicate matcher is passed
    builder.addMatcher(
      () => true,
      (state, action) => {
        expectType<AnyAction>(action)
      }
    )

    // addCase().addMatcher() is possible, action type inferred correctly
    builder
      .addCase(
        'increment',
        (state, action: ReturnType<typeof increment>) => state
      )
      .addMatcher(decrement.match, (state, action) => {
        expectType<ReturnType<typeof decrement>>(action)
      })

    // addCase().addDefaultCase() is possible, action type is AnyAction
    builder
      .addCase(
        'increment',
        (state, action: ReturnType<typeof increment>) => state
      )
      .addDefaultCase((state, action) => {
        expectType<AnyAction>(action)
      })

    {
      // addMatcher() should prevent further calls to addCase()
      const b = builder.addMatcher(increment.match, () => {})
      // @ts-expect-error
      b.addCase(increment, () => {})
      b.addMatcher(increment.match, () => {})
      b.addDefaultCase(() => {})
    }

    {
      // addDefaultCase() should prevent further calls to addCase(), addMatcher() and addDefaultCase
      const b = builder.addDefaultCase(() => {})
      // @ts-expect-error
      b.addCase(increment, () => {})
      // @ts-expect-error
      b.addMatcher(increment.match, () => {})
      // @ts-expect-error
      b.addDefaultCase(() => {})
    }

    // `createAsyncThunk` actions work with `mapBuilder`
    {
      // case 1: normal `createAsyncThunk`
      {
        const thunk = createAsyncThunk('test', () => {
          return 'ret' as const
        })
        builder.addCase(thunk.pending, (_, action) => {
          expectType<{
            payload: undefined
            meta: {
              arg: void
              requestId: string
              requestStatus: 'pending'
            }
          }>(action)
        })

        builder.addCase(thunk.rejected, (_, action) => {
          expectType<{
            payload: unknown
            error: SerializedError
            meta: {
              arg: void
              requestId: string
              requestStatus: 'rejected'
              aborted: boolean
              condition: boolean
              rejectedWithValue: boolean
            }
          }>(action)
        })
        builder.addCase(thunk.fulfilled, (_, action) => {
          expectType<{
            payload: 'ret'
            meta: {
              arg: void
              requestId: string
              requestStatus: 'fulfilled'
            }
          }>(action)
        })
      }
    }
    // case 2: `createAsyncThunk` with `meta`
    {
      const thunk = createAsyncThunk<
        'ret',
        void,
        {
          pendingMeta: { startedTimeStamp: number }
          fulfilledMeta: {
            fulfilledTimeStamp: number
            baseQueryMeta: 'meta!'
          }
          rejectedMeta: {
            baseQueryMeta: 'meta!'
          }
        }
      >(
        'test',
        (_, api) => {
          return api.fulfillWithValue('ret' as const, {
            fulfilledTimeStamp: 5,
            baseQueryMeta: 'meta!',
          })
        },
        {
          getPendingMeta() {
            return { startedTimeStamp: 0 }
          },
        }
      )

      builder.addCase(thunk.pending, (_, action) => {
        expectType<{
          payload: undefined
          meta: {
            arg: void
            requestId: string
            requestStatus: 'pending'
            startedTimeStamp: number
          }
        }>(action)
      })

      builder.addCase(thunk.rejected, (_, action) => {
        expectType<{
          payload: unknown
          error: SerializedError
          meta: {
            arg: void
            requestId: string
            requestStatus: 'rejected'
            aborted: boolean
            condition: boolean
            rejectedWithValue: boolean
            baseQueryMeta?: 'meta!'
          }
        }>(action)
        if (action.meta.rejectedWithValue) {
          expectType<'meta!'>(action.meta.baseQueryMeta)
        }
      })
      builder.addCase(thunk.fulfilled, (_, action) => {
        expectType<{
          payload: 'ret'
          meta: {
            arg: void
            requestId: string
            requestStatus: 'fulfilled'
            baseQueryMeta: 'meta!'
          }
        }>(action)
      })
    }
  })
}
