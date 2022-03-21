import {
  configureStore,
  createAction,
  createSlice,
  Dispatch,
  isAnyOf,
} from '@reduxjs/toolkit'

import type { AnyAction, PayloadAction, Action } from '@reduxjs/toolkit'

import {
  createListenerMiddleware,
  createListenerEntry,
  addListener,
  removeListener,
  TaskAbortError,
  clearAllListeners,
} from '../index'

import type {
  ListenerEffect,
  ListenerEffectAPI,
  TypedAddListener,
  TypedStartListening,
  UnsubscribeListener,
  ListenerMiddleware,
} from '../index'
import type {
  AbortSignalWithReason,
  AddListenerOverloads,
  TypedRemoveListener,
} from '../types'
import { listenerCancelled, listenerCompleted } from '../exceptions'

const middlewareApi = {
  getState: expect.any(Function),
  getOriginalState: expect.any(Function),
  condition: expect.any(Function),
  extra: undefined,
  take: expect.any(Function),
  signal: expect.any(Object),
  fork: expect.any(Function),
  delay: expect.any(Function),
  pause: expect.any(Function),
  dispatch: expect.any(Function),
  unsubscribe: expect.any(Function),
  subscribe: expect.any(Function),
  cancelActiveListeners: expect.any(Function),
}

const noop = () => {}

// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.
export interface Deferred<T> extends Promise<T> {
  resolve(value?: T | PromiseLike<T>): void
  // deno-lint-ignore no-explicit-any
  reject(reason?: any): void
}

/** Creates a Promise with the `reject` and `resolve` functions
 * placed as methods on the promise object itself. It allows you to do:
 *
 *     const p = deferred<number>();
 *     // ...
 *     p.resolve(42);
 */
export function deferred<T>(): Deferred<T> {
  let methods
  const promise = new Promise<T>((resolve, reject): void => {
    methods = { resolve, reject }
  })
  return Object.assign(promise, methods) as Deferred<T>
}

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

describe('createListenerMiddleware', () => {
  let store = configureStore({
    reducer: () => 42,
    middleware: (gDM) => gDM().prepend(createListenerMiddleware().middleware),
  })

  interface CounterState {
    value: number
  }

  const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 } as CounterState,
    reducers: {
      increment(state) {
        state.value += 1
      },
      decrement(state) {
        state.value -= 1
      },
      // Use the PayloadAction type to declare the contents of `action.payload`
      incrementByAmount: (state, action: PayloadAction<number>) => {
        state.value += action.payload
      },
    },
  })
  const { increment, decrement, incrementByAmount } = counterSlice.actions

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  let reducer: jest.Mock
  let listenerMiddleware = createListenerMiddleware()
  let { middleware, startListening, stopListening, clearListeners } =
    listenerMiddleware
  let addTypedListenerAction = addListener as TypedAddListener<CounterState>
  let removeTypedListenerAction =
    removeListener as TypedRemoveListener<CounterState>

  const testAction1 = createAction<string>('testAction1')
  type TestAction1 = ReturnType<typeof testAction1>
  const testAction2 = createAction<string>('testAction2')
  type TestAction2 = ReturnType<typeof testAction2>
  const testAction3 = createAction<string>('testAction3')
  type TestAction3 = ReturnType<typeof testAction3>

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(noop)
  })

  beforeEach(() => {
    listenerMiddleware = createListenerMiddleware()
    middleware = listenerMiddleware.middleware
    startListening = listenerMiddleware.startListening
    stopListening = listenerMiddleware.stopListening
    clearListeners = listenerMiddleware.clearListeners
    reducer = jest.fn(() => ({}))
    store = configureStore({
      reducer,
      middleware: (gDM) => gDM().prepend(middleware),
    })
  })

  describe('Middleware setup', () => {
    test('Allows passing an extra argument on middleware creation', () => {
      const originalExtra = 42
      const listenerMiddleware = createListenerMiddleware({
        extra: originalExtra,
      })
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(listenerMiddleware.middleware),
      })

      let foundExtra = null

      const typedAddListener =
        listenerMiddleware.startListening as TypedStartListening<
          CounterState,
          typeof store.dispatch,
          typeof originalExtra
        >

      typedAddListener({
        matcher: (action: AnyAction): action is AnyAction => true,
        effect: (action, listenerApi) => {
          foundExtra = listenerApi.extra
          expectType<typeof originalExtra>(listenerApi.extra)
        },
      })

      store.dispatch(testAction1('a'))
      expect(foundExtra).toBe(originalExtra)
    })

    test('Passes through if there are no listeners', () => {
      const originalAction = testAction1('a')
      const resultAction = store.dispatch(originalAction)
      expect(resultAction).toBe(originalAction)
    })
  })

  describe('Subscription and unsubscription', () => {
    test('directly subscribing', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect: effect,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('stopListening returns true if an entry has been unsubscribed, false otherwise', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })

      expect(stopListening({ actionCreator: testAction2, effect })).toBe(false)
      expect(stopListening({ actionCreator: testAction1, effect })).toBe(true)
    })

    test('dispatch(removeListener({...})) returns true if an entry has been unsubscribed, false otherwise', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })

      expect(
        store.dispatch(
          removeTypedListenerAction({
            actionCreator: testAction2,
            effect,
          })
        )
      ).toBe(false)
      expect(
        store.dispatch(
          removeTypedListenerAction({
            actionCreator: testAction1,
            effect,
          })
        )
      ).toBe(true)
    })

    test('can subscribe with a string action type', () => {
      const effect = jest.fn((_: AnyAction) => {})

      store.dispatch(
        addListener({
          type: testAction2.type,
          effect,
        })
      )

      store.dispatch(testAction2('b'))
      expect(effect.mock.calls).toEqual([[testAction2('b'), middlewareApi]])

      store.dispatch(removeListener({ type: testAction2.type, effect }))

      store.dispatch(testAction2('b'))
      expect(effect.mock.calls).toEqual([[testAction2('b'), middlewareApi]])
    })

    test('can subscribe with a matcher function', () => {
      const effect = jest.fn((_: AnyAction) => {})

      const isAction1Or2 = isAnyOf(testAction1, testAction2)

      const unsubscribe = startListening({
        matcher: isAction1Or2,
        effect: effect,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction3('c'))
      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction2('b'), middlewareApi],
      ])

      unsubscribe()

      store.dispatch(testAction2('b'))
      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction2('b'), middlewareApi],
      ])
    })

    test('Can subscribe with an action predicate function', () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let listener1Calls = 0

      startListening({
        predicate: (action, state) => {
          return (state as CounterState).value > 1
        },
        effect: () => {
          listener1Calls++
        },
      })

      let listener2Calls = 0

      startListening({
        predicate: (action, state, prevState) => {
          return (
            (state as CounterState).value > 1 &&
            (prevState as CounterState).value % 2 === 0
          )
        },
        effect: () => {
          listener2Calls++
        },
      })

      store.dispatch(increment())
      store.dispatch(increment())
      store.dispatch(increment())
      store.dispatch(increment())

      expect(listener1Calls).toBe(3)
      expect(listener2Calls).toBe(1)
    })

    test('subscribing with the same listener will not make it trigger twice (like EventTarget.addEventListener())', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })
      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('unsubscribing via callback', () => {
      const effect = jest.fn((_: TestAction1) => {})

      const unsubscribe = startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))
      unsubscribe()
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('directly unsubscribing', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))

      stopListening({ actionCreator: testAction1, effect })
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('unsubscribing without any subscriptions does not trigger an error', () => {
      stopListening({ matcher: testAction1.match, effect: noop })
    })

    test('subscribing via action', () => {
      const effect = jest.fn((_: TestAction1) => {})

      store.dispatch(
        addListener({
          actionCreator: testAction1,
          effect,
        })
      )

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('unsubscribing via callback from dispatch', () => {
      const effect = jest.fn((_: TestAction1) => {})

      const unsubscribe = store.dispatch(
        addListener({
          actionCreator: testAction1,
          effect,
        })
      )

      expectType<UnsubscribeListener>(unsubscribe)

      store.dispatch(testAction1('a'))

      unsubscribe()
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('unsubscribing via action', () => {
      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })

      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))

      store.dispatch(removeListener({ actionCreator: testAction1, effect }))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('can cancel an active listener when unsubscribing directly', async () => {
      let wasCancelled = false
      const unsubscribe = startListening({
        actionCreator: testAction1,
        effect: async (action, listenerApi) => {
          try {
            await listenerApi.condition(testAction2.match)
          } catch (err) {
            if (err instanceof TaskAbortError) {
              wasCancelled = true
            }
          }
        },
      })

      store.dispatch(testAction1('a'))
      unsubscribe({ cancelActive: true })
      expect(wasCancelled).toBe(false)
      await delay(10)
      expect(wasCancelled).toBe(true)
    })

    test('can cancel an active listener when unsubscribing via stopListening', async () => {
      let wasCancelled = false
      const effect = async (action: any, listenerApi: any) => {
        try {
          await listenerApi.condition(testAction2.match)
        } catch (err) {
          if (err instanceof TaskAbortError) {
            wasCancelled = true
          }
        }
      }
      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))
      stopListening({ actionCreator: testAction1, effect, cancelActive: true })
      expect(wasCancelled).toBe(false)
      await delay(10)
      expect(wasCancelled).toBe(true)
    })

    test('can cancel an active listener when unsubscribing via removeListener', async () => {
      let wasCancelled = false
      const effect = async (action: any, listenerApi: any) => {
        try {
          await listenerApi.condition(testAction2.match)
        } catch (err) {
          if (err instanceof TaskAbortError) {
            wasCancelled = true
          }
        }
      }
      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(
        removeListener({
          actionCreator: testAction1,
          effect,
          cancelActive: true,
        })
      )
      expect(wasCancelled).toBe(false)
      await delay(10)
      expect(wasCancelled).toBe(true)
    })

    const addListenerOptions: [
      string,
      Omit<
        AddListenerOverloads<
          () => void,
          typeof store.getState,
          typeof store.dispatch
        >,
        'effect'
      >
    ][] = [
      ['predicate', { predicate: () => true }],
      ['actionCreator', { actionCreator: testAction1 }],
      ['matcher', { matcher: isAnyOf(testAction1, testAction2) }],
      ['type', { type: testAction1.type }],
    ]

    test.each(addListenerOptions)(
      'add and remove listener with "%s" param correctly',
      (_, params) => {
        const effect: ListenerEffect<
          AnyAction,
          typeof store.getState,
          typeof store.dispatch
        > = jest.fn()

        startListening({ ...params, effect } as any)

        store.dispatch(testAction1('a'))
        expect(effect).toBeCalledTimes(1)

        stopListening({ ...params, effect } as any)

        store.dispatch(testAction1('b'))
        expect(effect).toBeCalledTimes(1)
      }
    )

    const unforwardedActions: [string, AnyAction][] = [
      [
        'addListener',
        addListener({ actionCreator: testAction1, effect: noop }),
      ],
      [
        'removeListener',
        removeListener({ actionCreator: testAction1, effect: noop }),
      ],
    ]
    test.each(unforwardedActions)(
      '"%s" is not forwarded to the reducer',
      (_, action) => {
        reducer.mockClear()

        store.dispatch(testAction1('a'))
        store.dispatch(action)
        store.dispatch(testAction2('b'))

        expect(reducer.mock.calls).toEqual([
          [{}, testAction1('a')],
          [{}, testAction2('b')],
        ])
      }
    )

    test('listenerApi.signal has correct reason when listener is cancelled or completes', async () => {
      const notifyDeferred = createAction<Deferred<string>>('notify-deferred')

      startListening({
        actionCreator: notifyDeferred,
        async effect({ payload }, { signal, cancelActiveListeners, delay }) {
          signal.addEventListener(
            'abort',
            () => {
              payload.resolve((signal as AbortSignalWithReason<string>).reason)
            },
            { once: true }
          )

          cancelActiveListeners()
          delay(10)
        },
      })

      const deferredCancelledSignalReason = store.dispatch(
        notifyDeferred(deferred<string>())
      ).payload
      const deferredCompletedSignalReason = store.dispatch(
        notifyDeferred(deferred<string>())
      ).payload

      expect(await deferredCancelledSignalReason).toBe(listenerCancelled)
      expect(await deferredCompletedSignalReason).toBe(listenerCompleted)
    })

    test('"can unsubscribe via middleware api', () => {
      const effect = jest.fn(
        (action: TestAction1, api: ListenerEffectAPI<any, any>) => {
          if (action.payload === 'b') {
            api.unsubscribe()
          }
        }
      )

      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction1('b'))
      store.dispatch(testAction1('c'))

      expect(effect.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('b'), middlewareApi],
      ])
    })

    test('Can re-subscribe via middleware api', async () => {
      let numListenerRuns = 0
      startListening({
        actionCreator: testAction1,
        effect: async (action, listenerApi) => {
          numListenerRuns++

          listenerApi.unsubscribe()

          await listenerApi.condition(testAction2.match)

          listenerApi.subscribe()
        },
      })

      store.dispatch(testAction1('a'))
      expect(numListenerRuns).toBe(1)

      store.dispatch(testAction1('a'))
      expect(numListenerRuns).toBe(1)

      store.dispatch(testAction2('b'))
      expect(numListenerRuns).toBe(1)

      await delay(5)

      store.dispatch(testAction1('b'))
      expect(numListenerRuns).toBe(2)
    })
  })

  describe('clear listeners', () => {
    test('dispatch(clearListenerAction()) cancels running listeners and removes all subscriptions', async () => {
      const listener1Test = deferred()
      let listener1Calls = 0
      let listener2Calls = 0
      let listener3Calls = 0

      startListening({
        actionCreator: testAction1,
        async effect(_, listenerApi) {
          listener1Calls++
          listenerApi.signal.addEventListener(
            'abort',
            () => listener1Test.resolve(listener1Calls),
            { once: true }
          )
          await listenerApi.condition(() => true)
          listener1Test.reject(new Error('unreachable: listener1Test'))
        },
      })

      startListening({
        actionCreator: clearAllListeners,
        effect() {
          listener2Calls++
        },
      })

      startListening({
        predicate: () => true,
        effect() {
          listener3Calls++
        },
      })

      store.dispatch(testAction1('a'))
      store.dispatch(clearAllListeners())
      store.dispatch(testAction1('b'))
      expect(await listener1Test).toBe(1)
      expect(listener1Calls).toBe(1)
      expect(listener3Calls).toBe(1)
      expect(listener2Calls).toBe(0)
    })

    test('clear() cancels running listeners and removes all subscriptions', async () => {
      const listener1Test = deferred()

      let listener1Calls = 0
      let listener2Calls = 0

      startListening({
        actionCreator: testAction1,
        async effect(_, listenerApi) {
          listener1Calls++
          listenerApi.signal.addEventListener(
            'abort',
            () => listener1Test.resolve(listener1Calls),
            { once: true }
          )
          await listenerApi.condition(() => true)
          listener1Test.reject(new Error('unreachable: listener1Test'))
        },
      })

      startListening({
        actionCreator: testAction2,
        effect() {
          listener2Calls++
        },
      })

      store.dispatch(testAction1('a'))

      clearListeners()
      store.dispatch(testAction1('b'))
      store.dispatch(testAction2('c'))

      expect(listener2Calls).toBe(0)
      expect(await listener1Test).toBe(1)
    })

    test('clear() cancels all running forked tasks', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      startListening({
        actionCreator: testAction1,
        async effect(_, { fork, dispatch }) {
          await fork(() => dispatch(incrementByAmount(3))).result
          dispatch(incrementByAmount(4))
        },
      })

      expect(store.getState().value).toBe(0)
      store.dispatch(testAction1('a'))

      clearListeners()

      await Promise.resolve() // Forked tasks run on the next microtask.

      expect(store.getState().value).toBe(0)
    })
  })

  describe('Listener API', () => {
    test('Passes both getState and getOriginalState in the API', () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let listener1Calls = 0
      startListening({
        actionCreator: increment,
        effect: (action, listenerApi) => {
          const stateBefore = listenerApi.getOriginalState() as CounterState
          const currentState = listenerApi.getOriginalState() as CounterState

          listener1Calls++
          // In the "before" phase, we pass the same state
          expect(currentState).toBe(stateBefore)
        },
      })

      let listener2Calls = 0
      startListening({
        actionCreator: increment,
        effect: (action, listenerApi) => {
          // TODO getState functions aren't typed right here
          const stateBefore = listenerApi.getOriginalState() as CounterState
          const currentState = listenerApi.getOriginalState() as CounterState

          listener2Calls++
          // In the "after" phase, we pass the new state for `getState`, and still have original state too
          expect(currentState.value).toBe(stateBefore.value + 1)
        },
      })

      store.dispatch(increment())

      expect(listener1Calls).toBe(1)
      expect(listener2Calls).toBe(1)
    })

    test('getOriginalState can only be invoked synchronously', async () => {
      const onError = jest.fn()

      const listenerMiddleware = createListenerMiddleware<CounterState>({
        onError,
      })
      const { middleware, startListening } = listenerMiddleware
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      startListening({
        actionCreator: increment,
        async effect(_, listenerApi) {
          const runIncrementBy = () => {
            listenerApi.dispatch(
              counterSlice.actions.incrementByAmount(
                listenerApi.getOriginalState().value + 2
              )
            )
          }

          runIncrementBy()

          await Promise.resolve()

          runIncrementBy()
        },
      })

      expect(store.getState()).toEqual({ value: 0 })

      store.dispatch(increment()) // state.value+=1 && trigger listener
      expect(onError).not.toHaveBeenCalled()
      expect(store.getState()).toEqual({ value: 3 })

      await delay(0)

      expect(onError).toBeCalledWith(
        new Error(
          'listenerMiddleware: getOriginalState can only be called synchronously'
        ),
        { raisedBy: 'effect' }
      )
      expect(store.getState()).toEqual({ value: 3 })
    })

    test('by default, actions are forwarded to the store', () => {
      reducer.mockClear()

      const effect = jest.fn((_: TestAction1) => {})

      startListening({
        actionCreator: testAction1,
        effect,
      })

      store.dispatch(testAction1('a'))

      expect(reducer.mock.calls).toEqual([[{}, testAction1('a')]])
    })

    test('listenerApi.delay does not trigger unhandledRejections for completed or cancelled listners', async () => {
      let deferredCompletedEvt = deferred()
      let deferredCancelledEvt = deferred()
      const godotPauseTrigger = deferred()

      // Unfortunately we cannot test declaratively unhandleRejections in jest: https://github.com/facebook/jest/issues/5620
      // This test just fails if an `unhandledRejection` occurs.
      startListening({
        actionCreator: increment,
        effect: async (_, listenerApi) => {
          listenerApi.unsubscribe()
          listenerApi.signal.addEventListener(
            'abort',
            deferredCompletedEvt.resolve,
            { once: true }
          )
          listenerApi.delay(100) // missing await
        },
      })

      startListening({
        actionCreator: increment,
        effect: async (_, listenerApi) => {
          listenerApi.cancelActiveListeners()
          listenerApi.signal.addEventListener(
            'abort',
            deferredCancelledEvt.resolve,
            { once: true }
          )
          listenerApi.delay(100) // missing await
          listenerApi.pause(godotPauseTrigger)
        },
      })

      store.dispatch(increment())
      store.dispatch(increment())

      expect(await deferredCompletedEvt).toBeDefined()
      expect(await deferredCancelledEvt).toBeDefined()
    })
  })

  describe('Error handling', () => {
    test('Continues running other listeners if one of them raises an error', () => {
      const matcher = (action: any): action is any => true

      startListening({
        matcher,
        effect: () => {
          throw new Error('Panic!')
        },
      })

      const effect = jest.fn(() => {})
      startListening({ matcher, effect })

      store.dispatch(testAction1('a'))
      expect(effect.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('Continues running other listeners if a predicate raises an error', () => {
      const matcher = (action: any): action is any => true
      const firstListener = jest.fn(() => {})
      const secondListener = jest.fn(() => {})

      startListening({
        // @ts-expect-error
        matcher: (arg: unknown): arg is unknown => {
          throw new Error('Predicate Panic!')
        },
        effect: firstListener,
      })

      startListening({ matcher, effect: secondListener })

      store.dispatch(testAction1('a'))
      expect(firstListener).not.toHaveBeenCalled()
      expect(secondListener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
      ])
    })

    test('Notifies sync listener errors to `onError`, if provided', async () => {
      const onError = jest.fn()
      const listenerMiddleware = createListenerMiddleware({
        onError,
      })
      const { middleware, startListening } = listenerMiddleware
      reducer = jest.fn(() => ({}))
      store = configureStore({
        reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      const listenerError = new Error('Boom!')

      const matcher = (action: any): action is any => true

      startListening({
        matcher,
        effect: () => {
          throw listenerError
        },
      })

      store.dispatch(testAction1('a'))
      await delay(100)

      expect(onError).toBeCalledWith(listenerError, {
        raisedBy: 'effect',
      })
    })

    test('Notifies async listeners errors to `onError`, if provided', async () => {
      const onError = jest.fn()
      const listenerMiddleware = createListenerMiddleware({
        onError,
      })
      const { middleware, startListening } = listenerMiddleware
      reducer = jest.fn(() => ({}))
      store = configureStore({
        reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      const listenerError = new Error('Boom!')
      const matcher = (action: any): action is any => true

      startListening({
        matcher,
        effect: async () => {
          throw listenerError
        },
      })

      store.dispatch(testAction1('a'))

      await delay(100)

      expect(onError).toBeCalledWith(listenerError, {
        raisedBy: 'effect',
      })
    })
  })

  describe('take and condition methods', () => {
    test('take resolves to the tuple [A, CurrentState, PreviousState] when the predicate matches the action', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let result = null

      startListening({
        predicate: incrementByAmount.match,
        effect: async (_, listenerApi) => {
          result = await listenerApi.take(increment.match)
        },
      })
      store.dispatch(incrementByAmount(1))
      store.dispatch(increment())

      await delay(10)

      expect(result).toEqual([increment(), { value: 2 }, { value: 1 }])
    })

    test('take resolves to null if the timeout expires', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let takeResult: any = undefined

      startListening({
        predicate: incrementByAmount.match,
        effect: async (_, listenerApi) => {
          takeResult = await listenerApi.take(increment.match, 15)
        },
      })
      store.dispatch(incrementByAmount(1))
      await delay(25)

      expect(takeResult).toBe(null)
    })

    test("take resolves to [A, CurrentState, PreviousState] if the timeout is provided but doesn't expire", async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })
      let takeResult: any = undefined
      let stateBefore: any = undefined
      let stateCurrent: any = undefined

      startListening({
        predicate: incrementByAmount.match,
        effect: async (_, listenerApi) => {
          stateBefore = listenerApi.getState()
          takeResult = await listenerApi.take(increment.match, 50)
          stateCurrent = listenerApi.getState()
        },
      })
      store.dispatch(incrementByAmount(1))
      store.dispatch(increment())

      await delay(25)
      expect(takeResult).toEqual([increment(), stateCurrent, stateBefore])
    })

    test("take resolves to `[A, CurrentState, PreviousState] | null` if a possibly undefined timeout parameter is provided", async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      type ExpectedTakeResultType = readonly [ReturnType<typeof increment>, CounterState, CounterState] | null

      let timeout: number | undefined = undefined
      let done = false

      const startAppListening = startListening as TypedStartListening<CounterState>
      startAppListening({
        predicate: incrementByAmount.match,
        effect: async (_, listenerApi) => {
          const stateBefore = listenerApi.getState()
          
          let takeResult = await listenerApi.take(increment.match, timeout)
          const stateCurrent = listenerApi.getState()
          expect(takeResult).toEqual([increment(), stateCurrent, stateBefore])
          
          timeout = 1
          takeResult = await listenerApi.take(increment.match, timeout)
          expect(takeResult).toBeNull()
          
          expectType<ExpectedTakeResultType>(takeResult)

          done = true
        },
      })
      store.dispatch(incrementByAmount(1))
      store.dispatch(increment())

      await delay(25)
      expect(done).toBe(true);
    })

    test('condition method resolves promise when the predicate succeeds', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let finalCount = 0
      let listenerStarted = false

      startListening({
        predicate: (action, _, previousState) => {
          return (
            increment.match(action) &&
            (previousState as CounterState).value === 0
          )
        },
        effect: async (action, listenerApi) => {
          listenerStarted = true
          const result = await listenerApi.condition((action, currentState) => {
            return (currentState as CounterState).value === 3
          })

          expect(result).toBe(true)
          const latestState = listenerApi.getState() as CounterState
          finalCount = latestState.value
        },
      })

      store.dispatch(increment())

      expect(listenerStarted).toBe(true)
      await delay(25)
      store.dispatch(increment())
      store.dispatch(increment())

      await delay(25)

      expect(finalCount).toBe(3)
    })

    test('condition method resolves promise when there is a timeout', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let finalCount = 0
      let listenerStarted = false

      startListening({
        predicate: (action, currentState) => {
          return (
            increment.match(action) &&
            (currentState as CounterState).value === 1
          )
        },
        effect: async (action, listenerApi) => {
          listenerStarted = true
          const result = await listenerApi.condition((action, currentState) => {
            return (currentState as CounterState).value === 3
          }, 25)

          expect(result).toBe(false)
          const latestState = listenerApi.getState() as CounterState
          finalCount = latestState.value
        },
      })

      store.dispatch(increment())
      expect(listenerStarted).toBe(true)

      store.dispatch(increment())

      await delay(50)
      store.dispatch(increment())

      expect(finalCount).toBe(2)
    })

    test('take does not trigger unhandledRejections for completed or cancelled tasks', async () => {
      let deferredCompletedEvt = deferred()
      let deferredCancelledEvt = deferred()
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })
      const godotPauseTrigger = deferred()

      startListening({
        predicate: () => true,
        effect: async (_, listenerApi) => {
          listenerApi.unsubscribe() // run once
          listenerApi.signal.addEventListener(
            'abort',
            deferredCompletedEvt.resolve
          )
          listenerApi.take(() => true) // missing await
        },
      })

      startListening({
        predicate: () => true,
        effect: async (_, listenerApi) => {
          listenerApi.cancelActiveListeners()
          listenerApi.signal.addEventListener(
            'abort',
            deferredCancelledEvt.resolve
          )
          listenerApi.take(() => true) // missing await
          await listenerApi.pause(godotPauseTrigger)
        },
      })

      store.dispatch({ type: 'type' })
      store.dispatch({ type: 'type' })
      expect(await deferredCompletedEvt).toBeDefined()
    })
  })

  describe('Job API', () => {
    test('Allows canceling previous jobs', async () => {
      let jobsStarted = 0
      let jobsContinued = 0
      let jobsCanceled = 0

      startListening({
        actionCreator: increment,
        effect: async (action, listenerApi) => {
          jobsStarted++

          if (jobsStarted < 3) {
            try {
              await listenerApi.condition(decrement.match)
              // Cancelation _should_ cause `condition()` to throw so we never
              // end up hitting this next line
              jobsContinued++
            } catch (err) {
              if (err instanceof TaskAbortError) {
                jobsCanceled++
              }
            }
          } else {
            listenerApi.cancelActiveListeners()
          }
        },
      })

      store.dispatch(increment())
      store.dispatch(increment())
      store.dispatch(increment())

      await delay(10)
      expect(jobsStarted).toBe(3)
      expect(jobsContinued).toBe(0)
      expect(jobsCanceled).toBe(2)
    })
  })

  describe('Type tests', () => {
    const listenerMiddleware = createListenerMiddleware()
    const { middleware, startListening } = listenerMiddleware
    const store = configureStore({
      reducer: counterSlice.reducer,
      middleware: (gDM) => gDM().prepend(middleware),
    })

    test('State args default to unknown', () => {
      createListenerEntry({
        predicate: (
          action,
          currentState,
          previousState
        ): action is AnyAction => {
          expectUnknown(currentState)
          expectUnknown(previousState)
          return true
        },
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectUnknown(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = getState()
            expectUnknown(thunkState)
          })
        },
      })

      startListening({
        predicate: (
          action,
          currentState,
          previousState
        ): action is AnyAction => {
          expectUnknown(currentState)
          expectUnknown(previousState)
          return true
        },
        effect: (action, listenerApi) => {},
      })

      startListening({
        matcher: increment.match,
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectUnknown(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = getState()
            expectUnknown(thunkState)
          })
        },
      })

      store.dispatch(
        addListener({
          predicate: (
            action,
            currentState,
            previousState
          ): action is AnyAction => {
            expectUnknown(currentState)
            expectUnknown(previousState)
            return true
          },
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectUnknown(listenerState)
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = getState()
              expectUnknown(thunkState)
            })
          },
        })
      )

      store.dispatch(
        addListener({
          matcher: increment.match,
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectUnknown(listenerState)
            // TODO Can't get the thunk dispatch types to carry through
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = getState()
              expectUnknown(thunkState)
            })
          },
        })
      )
    })

    test('Action type is inferred from args', () => {
      startListening({
        type: 'abcd',
        effect: (action, listenerApi) => {
          expectType<{ type: 'abcd' }>(action)
        },
      })

      startListening({
        actionCreator: incrementByAmount,
        effect: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)
        },
      })

      startListening({
        matcher: incrementByAmount.match,
        effect: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)
        },
      })

      startListening({
        predicate: (
          action,
          currentState,
          previousState
        ): action is PayloadAction<number> => {
          return typeof action.payload === 'boolean'
        },
        effect: (action, listenerApi) => {
          // @ts-expect-error
          expectExactType<PayloadAction<number>>(action)
        },
      })

      startListening({
        predicate: (action, currentState) => {
          return typeof action.payload === 'number'
        },
        effect: (action, listenerApi) => {
          expectExactType<AnyAction>(action)
        },
      })

      store.dispatch(
        addListener({
          type: 'abcd',
          effect: (action, listenerApi) => {
            expectType<{ type: 'abcd' }>(action)
          },
        })
      )

      store.dispatch(
        addListener({
          actionCreator: incrementByAmount,
          effect: (action, listenerApi) => {
            expectType<PayloadAction<number>>(action)
          },
        })
      )

      store.dispatch(
        addListener({
          matcher: incrementByAmount.match,
          effect: (action, listenerApi) => {
            expectType<PayloadAction<number>>(action)
          },
        })
      )
    })

    test('Can create a pre-typed middleware', () => {
      const typedMiddleware = createListenerMiddleware<CounterState>()

      typedMiddleware.startListening({
        predicate: (
          action,
          currentState,
          previousState
        ): action is AnyAction => {
          expectNotAny(currentState)
          expectNotAny(previousState)
          expectExactType<CounterState>(currentState)
          expectExactType<CounterState>(previousState)
          return true
        },
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      // Can pass a predicate function with fewer args
      typedMiddleware.startListening({
        // TODO Why won't this infer the listener's `action` with implicit argument types?
        predicate: (
          action: AnyAction,
          currentState: CounterState
        ): action is PayloadAction<number> => {
          expectNotAny(currentState)
          expectExactType<CounterState>(currentState)
          return true
        },
        effect: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)

          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      typedMiddleware.startListening({
        actionCreator: incrementByAmount,
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      store.dispatch(
        addTypedListenerAction({
          predicate: (
            action,
            currentState,
            previousState
          ): action is ReturnType<typeof incrementByAmount> => {
            expectNotAny(currentState)
            expectNotAny(previousState)
            expectExactType<CounterState>(currentState)
            expectExactType<CounterState>(previousState)
            return true
          },
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectExactType<CounterState>(listenerState)
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = listenerApi.getState()
              expectExactType<CounterState>(thunkState)
            })
          },
        })
      )

      store.dispatch(
        addTypedListenerAction({
          predicate: (
            action,
            currentState,
            previousState
          ): action is AnyAction => {
            expectNotAny(currentState)
            expectNotAny(previousState)
            expectExactType<CounterState>(currentState)
            expectExactType<CounterState>(previousState)
            return true
          },
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectExactType<CounterState>(listenerState)
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = listenerApi.getState()
              expectExactType<CounterState>(thunkState)
            })
          },
        })
      )
    })

    test('Can create pre-typed versions of startListening and addListener', () => {
      const typedAddListener =
        startListening as TypedStartListening<CounterState>
      const typedAddListenerAction =
        addListener as TypedAddListener<CounterState>

      typedAddListener({
        predicate: (
          action,
          currentState,
          previousState
        ): action is AnyAction => {
          expectNotAny(currentState)
          expectNotAny(previousState)
          expectExactType<CounterState>(currentState)
          expectExactType<CounterState>(previousState)
          return true
        },
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          // TODO Can't get the thunk dispatch types to carry through
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      typedAddListener({
        matcher: incrementByAmount.match,
        effect: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          // TODO Can't get the thunk dispatch types to carry through
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      store.dispatch(
        typedAddListenerAction({
          predicate: (
            action,
            currentState,
            previousState
          ): action is AnyAction => {
            expectNotAny(currentState)
            expectNotAny(previousState)
            expectExactType<CounterState>(currentState)
            expectExactType<CounterState>(previousState)
            return true
          },
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectExactType<CounterState>(listenerState)
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = listenerApi.getState()
              expectExactType<CounterState>(thunkState)
            })
          },
        })
      )

      store.dispatch(
        typedAddListenerAction({
          matcher: incrementByAmount.match,
          effect: (action, listenerApi) => {
            const listenerState = listenerApi.getState()
            expectExactType<CounterState>(listenerState)
            listenerApi.dispatch((dispatch, getState) => {
              const thunkState = listenerApi.getState()
              expectExactType<CounterState>(thunkState)
            })
          },
        })
      )
    })
  })
})
