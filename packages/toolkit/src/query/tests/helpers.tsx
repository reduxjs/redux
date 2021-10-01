import type {
  AnyAction,
  EnhancedStore,
  Middleware,
  Store,
} from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { act } from '@testing-library/react-hooks'
import type { Reducer } from 'react'
import React, { useCallback } from 'react'
import { Provider } from 'react-redux'

import {
  mockConsole,
  createConsole,
  getLog,
} from 'console-testing-library/pure'

export const ANY = 0 as any

export const DEFAULT_DELAY_MS = 150

export const getSerializedHeaders = (headers: Headers = new Headers()) => {
  let result: Record<string, string> = {}
  headers.forEach((val, key) => {
    result[key] = val
  })
  return result
}

export async function waitMs(time = DEFAULT_DELAY_MS) {
  const now = Date.now()
  while (Date.now() < now + time) {
    await new Promise((res) => process.nextTick(res))
  }
}

export function waitForFakeTimer(time = DEFAULT_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export function withProvider(store: Store<any>) {
  return function Wrapper({ children }: any) {
    return <Provider store={store}>{children}</Provider>
  }
}

export const hookWaitFor = async (cb: () => void, time = 2000) => {
  const startedAt = Date.now()

  while (true) {
    try {
      cb()
      return true
    } catch (e) {
      if (Date.now() > startedAt + time) {
        throw e
      }
      await act(() => waitMs(2))
    }
  }
}
export const fakeTimerWaitFor = hookWaitFor

export const useRenderCounter = () => {
  const countRef = React.useRef(0)

  React.useEffect(() => {
    countRef.current += 1
  })

  React.useEffect(() => {
    return () => {
      countRef.current = 0
    }
  }, [])

  return useCallback(() => countRef.current, [])
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSequence(...matchers: Array<(arg: any) => boolean>): R
    }
  }
}

expect.extend({
  toMatchSequence(
    _actions: AnyAction[],
    ...matchers: Array<(arg: any) => boolean>
  ) {
    const actions = _actions.concat()
    actions.shift() // remove INIT

    for (let i = 0; i < matchers.length; i++) {
      if (!matchers[i](actions[i])) {
        return {
          message: () =>
            `Action ${actions[i].type} does not match sequence at position ${i}.`,
          pass: false,
        }
      }
    }
    return {
      message: () => `All actions match the sequence.`,
      pass: true,
    }
  },
})

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveConsoleOutput(expectedOutput: string): Promise<R>
    }
  }
}

function normalize(str: string) {
  return str
    .normalize()
    .replace(/\s*\r?\n\r?\s*/g, '')
    .trim()
}

expect.extend({
  async toHaveConsoleOutput(
    fn: () => void | Promise<void>,
    expectedOutput: string
  ) {
    const restore = mockConsole(createConsole())
    await fn()
    const log = getLog().log
    restore()

    if (normalize(log) === normalize(expectedOutput))
      return {
        message: () => `Console output matches 
===
${expectedOutput}
===`,
        pass: true,
      }
    else
      return {
        message: () => `Console output 
===
${log}
=== 
does not match 
===
${expectedOutput}
===`,
        pass: false,
      }
  },
})

export const actionsReducer = {
  actions: (state: AnyAction[] = [], action: AnyAction) => {
    return [...state, action]
  },
}

export function setupApiStore<
  A extends {
    reducerPath: 'api'
    reducer: Reducer<any, any>
    middleware: Middleware
    util: { resetApiState(): any }
  },
  R extends Record<string, Reducer<any, any>> = Record<never, never>
>(api: A, extraReducers?: R, withoutListeners?: boolean) {
  const getStore = () =>
    configureStore({
      reducer: { api: api.reducer, ...extraReducers },
      middleware: (gdm) =>
        gdm({ serializableCheck: false, immutableCheck: false }).concat(
          api.middleware
        ),
    })

  type StoreType = EnhancedStore<
    {
      api: ReturnType<A['reducer']>
    } & {
      [K in keyof R]: ReturnType<R[K]>
    },
    AnyAction,
    ReturnType<typeof getStore> extends EnhancedStore<any, any, infer M>
      ? M
      : never
  >

  const initialStore = getStore() as StoreType
  const refObj = {
    api,
    store: initialStore,
    wrapper: withProvider(initialStore),
  }
  let cleanupListeners: () => void

  beforeEach(() => {
    const store = getStore() as StoreType
    refObj.store = store
    refObj.wrapper = withProvider(store)
    if (!withoutListeners) {
      cleanupListeners = setupListeners(store.dispatch)
    }
  })
  afterEach(() => {
    if (!withoutListeners) {
      cleanupListeners()
    }
    refObj.store.dispatch(api.util.resetApiState())
  })

  return refObj
}

// type test helpers

export declare type IsAny<T, True, False = never> = true | false extends (
  T extends never ? true : false
)
  ? True
  : False

export declare type IsUnknown<T, True, False = never> = unknown extends T
  ? IsAny<T, False, True>
  : False

export function expectType<T>(t: T): T {
  return t
}

type Equals<T, U> = IsAny<
  T,
  never,
  IsAny<U, never, [T] extends [U] ? ([U] extends [T] ? any : never) : never>
>
export function expectExactType<T>(t: T) {
  return <U extends Equals<T, U>>(u: U) => {}
}

type EnsureUnknown<T extends any> = IsUnknown<T, any, never>
export function expectUnknown<T extends EnsureUnknown<T>>(t: T) {
  return t
}

type EnsureAny<T extends any> = IsAny<T, any, never>
export function expectExactAny<T extends EnsureAny<T>>(t: T) {
  return t
}

type IsNotAny<T> = IsAny<T, never, any>
export function expectNotAny<T extends IsNotAny<T>>(t: T): T {
  return t
}

expectType<string>('5' as string)
expectType<string>('5' as const)
expectType<string>('5' as any)
expectExactType('5' as const)('5' as const)
// @ts-expect-error
expectExactType('5' as string)('5' as const)
// @ts-expect-error
expectExactType('5' as any)('5' as const)
expectUnknown('5' as unknown)
// @ts-expect-error
expectUnknown('5' as const)
// @ts-expect-error
expectUnknown('5' as any)
expectExactAny('5' as any)
// @ts-expect-error
expectExactAny('5' as const)
// @ts-expect-error
expectExactAny('5' as unknown)
