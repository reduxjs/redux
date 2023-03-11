import React from 'react'
import type { Action, AnyAction, ActionCreator } from 'redux'
import type {
  PayloadAction,
  PayloadActionCreator,
  ActionCreatorWithoutPayload,
  ActionCreatorWithOptionalPayload,
  ActionCreatorWithPayload,
  ActionCreatorWithNonInferrablePayload,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'
import type { IsAny } from '@internal/tsHelpers'
import { expectType } from './helpers'

/* PayloadAction */

/*
 * Test: PayloadAction has type parameter for the payload.
 */
{
  const action: PayloadAction<number> = { type: '', payload: 5 }
  const numberPayload: number = action.payload

  // @ts-expect-error
  const stringPayload: string = action.payload
}

/*
 * Test: PayloadAction type parameter is required.
 */
{
  // @ts-expect-error
  const action: PayloadAction = { type: '', payload: 5 }
  // @ts-expect-error
  const numberPayload: number = action.payload
  // @ts-expect-error
  const stringPayload: string = action.payload
}

/*
 * Test: PayloadAction has a string type tag.
 */
{
  const action: PayloadAction<number> = { type: '', payload: 5 }

  // @ts-expect-error
  const action2: PayloadAction = { type: 1, payload: 5 }
}

/*
 * Test: PayloadAction is compatible with Action<string>
 */
{
  const action: PayloadAction<number> = { type: '', payload: 5 }
  const stringAction: Action<string> = action
}

/* PayloadActionCreator */

/*
 * Test: PayloadActionCreator returns correctly typed PayloadAction depending
 * on whether a payload is passed.
 */
{
  const actionCreator = Object.assign(
    (payload?: number) => ({
      type: 'action',
      payload,
    }),
    { type: 'action' }
  ) as PayloadActionCreator<number | undefined>

  expectType<PayloadAction<number | undefined>>(actionCreator(1))
  expectType<PayloadAction<number | undefined>>(actionCreator())
  expectType<PayloadAction<number | undefined>>(actionCreator(undefined))

  // @ts-expect-error
  expectType<PayloadAction<number>>(actionCreator())
  // @ts-expect-error
  expectType<PayloadAction<undefined>>(actionCreator(1))
}

/*
 * Test: PayloadActionCreator is compatible with ActionCreator.
 */
{
  const payloadActionCreator = Object.assign(
    (payload?: number) => ({
      type: 'action',
      payload,
    }),
    { type: 'action' }
  ) as PayloadActionCreator
  const actionCreator: ActionCreator<AnyAction> = payloadActionCreator

  const payloadActionCreator2 = Object.assign(
    (payload?: number) => ({
      type: 'action',
      payload: payload || 1,
    }),
    { type: 'action' }
  ) as PayloadActionCreator<number>

  const actionCreator2: ActionCreator<PayloadAction<number>> =
    payloadActionCreator2
}

/* createAction() */

/*
 * Test: createAction() has type parameter for the action payload.
 */
{
  const increment = createAction<number, 'increment'>('increment')
  const n: number = increment(1).payload

  // @ts-expect-error
  increment('').payload
}

/*
 * Test: createAction() type parameter is required, not inferred (defaults to `void`).
 */
{
  const increment = createAction('increment')
  // @ts-expect-error
  const n: number = increment(1).payload
}
/*
 * Test: createAction().type is a string literal.
 */
{
  const increment = createAction<number, 'increment'>('increment')
  const n: string = increment(1).type
  const s: 'increment' = increment(1).type

  // @ts-expect-error
  const r: 'other' = increment(1).type
  // @ts-expect-error
  const q: number = increment(1).type
}

/*
 * Test: type still present when using prepareAction
 */
{
  const strLenAction = createAction('strLen', (payload: string) => ({
    payload: payload.length,
  }))

  expectType<string>(strLenAction('test').type)
}

/*
 * Test: changing payload type with prepareAction
 */
{
  const strLenAction = createAction('strLen', (payload: string) => ({
    payload: payload.length,
  }))
  expectType<number>(strLenAction('test').payload)

  // @ts-expect-error
  expectType<string>(strLenAction('test').payload)
  // @ts-expect-error
  const error: any = strLenAction('test').error
}

/*
 * Test: adding metadata with prepareAction
 */
{
  const strLenMetaAction = createAction('strLenMeta', (payload: string) => ({
    payload,
    meta: payload.length,
  }))

  expectType<number>(strLenMetaAction('test').meta)

  // @ts-expect-error
  expectType<string>(strLenMetaAction('test').meta)
  // @ts-expect-error
  const error: any = strLenMetaAction('test').error
}

/*
 * Test: adding boolean error with prepareAction
 */
{
  const boolErrorAction = createAction('boolError', (payload: string) => ({
    payload,
    error: true,
  }))

  expectType<boolean>(boolErrorAction('test').error)

  // @ts-expect-error
  expectType<string>(boolErrorAction('test').error)
}

/*
 * Test: adding string error with prepareAction
 */
{
  const strErrorAction = createAction('strError', (payload: string) => ({
    payload,
    error: 'this is an error',
  }))

  expectType<string>(strErrorAction('test').error)

  // @ts-expect-error
  expectType<boolean>(strErrorAction('test').error)
}

/*
 * regression test for https://github.com/reduxjs/redux-toolkit/issues/214
 */
{
  const action = createAction<{ input?: string }>('ACTION')
  const t: string | undefined = action({ input: '' }).payload.input

  // @ts-expect-error
  const u: number = action({ input: '' }).payload.input
  // @ts-expect-error
  const v: number = action({ input: 3 }).payload.input
}

/*
 * regression test for https://github.com/reduxjs/redux-toolkit/issues/224
 */
{
  const oops = createAction('oops', (x: any) => ({
    payload: x,
    error: x,
    meta: x,
  }))

  type Ret = ReturnType<typeof oops>

  const payload: IsAny<Ret['payload'], true, false> = true
  const error: IsAny<Ret['error'], true, false> = true
  const meta: IsAny<Ret['meta'], true, false> = true

  // @ts-expect-error
  const payloadNotAny: IsAny<Ret['payload'], true, false> = false
  // @ts-expect-error
  const errorNotAny: IsAny<Ret['error'], true, false> = false
  // @ts-expect-error
  const metaNotAny: IsAny<Ret['meta'], true, false> = false
}

/**
 * Test: createAction.match()
 */
{
  // simple use case
  {
    const actionCreator = createAction<string, 'test'>('test')
    const x: Action<unknown> = {} as any
    if (actionCreator.match(x)) {
      expectType<'test'>(x.type)
      expectType<string>(x.payload)
    } else {
      // @ts-expect-error
      expectType<'test'>(x.type)
      // @ts-expect-error
      expectType<any>(x.payload)
    }
  }

  // special case: optional argument
  {
    const actionCreator = createAction<string | undefined, 'test'>('test')
    const x: Action<unknown> = {} as any
    if (actionCreator.match(x)) {
      expectType<'test'>(x.type)
      expectType<string | undefined>(x.payload)
    }
  }

  // special case: without argument
  {
    const actionCreator = createAction('test')
    const x: Action<unknown> = {} as any
    if (actionCreator.match(x)) {
      expectType<'test'>(x.type)
      // @ts-expect-error
      expectType<{}>(x.payload)
    }
  }

  // special case: with prepareAction
  {
    const actionCreator = createAction('test', () => ({
      payload: '',
      meta: '',
      error: false,
    }))
    const x: Action<unknown> = {} as any
    if (actionCreator.match(x)) {
      expectType<'test'>(x.type)
      expectType<string>(x.payload)
      expectType<string>(x.meta)
      expectType<boolean>(x.error)
      // @ts-expect-error
      expectType<number>(x.payload)
      // @ts-expect-error
      expectType<number>(x.meta)
      // @ts-expect-error
      expectType<number>(x.error)
    }
  }
  // potential use: as array filter
  {
    const actionCreator = createAction<string, 'test'>('test')
    const x: Array<Action<unknown>> = []
    expectType<Array<PayloadAction<string, 'test'>>>(
      x.filter(actionCreator.match)
    )

    expectType<Array<PayloadAction<number, 'test'>>>(
      // @ts-expect-error
      x.filter(actionCreator.match)
    )
  }
}
{
  expectType<ActionCreatorWithOptionalPayload<string | undefined>>(
    createAction<string | undefined>('')
  )
  expectType<ActionCreatorWithoutPayload>(createAction<void>(''))
  expectType<ActionCreatorWithNonInferrablePayload>(createAction(''))
  expectType<ActionCreatorWithPayload<string>>(createAction<string>(''))
  expectType<ActionCreatorWithPreparedPayload<[0], 1, '', 2, 3>>(
    createAction('', (_: 0) => ({
      payload: 1 as 1,
      error: 2 as 2,
      meta: 3 as 3,
    }))
  )
  const anyCreator = createAction<any>('')
  expectType<ActionCreatorWithPayload<any>>(anyCreator)
  type AnyPayload = ReturnType<typeof anyCreator>['payload']
  expectType<IsAny<AnyPayload, true, false>>(true)
}

// Verify action creators should not be passed directly as arguments
// to React event handlers if there shouldn't be a payload
{
  const emptyAction = createAction<void>('empty/action')
  function TestComponent() {
    // This typically leads to an error like:
    //  // A non-serializable value was detected in an action, in the path: `payload`.
    // @ts-expect-error Should error because `void` and `MouseEvent` aren't compatible
    return <button onClick={emptyAction}>+</button>
  }
}
