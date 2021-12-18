import {
  configureStore,
  createAction,
  createSlice,
  Dispatch,
  isAnyOf,
} from '@reduxjs/toolkit'

import type { AnyAction, PayloadAction, Action } from '@reduxjs/toolkit'

import {
  createActionListenerMiddleware,
  createListenerEntry,
  addListenerAction,
  removeListenerAction,
  TaskAbortError,
} from '../index'

import type {
  When,
  ActionListenerMiddlewareAPI,
  TypedAddListenerAction,
  TypedAddListener,
  Unsubscribe,
} from '../index'

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
  currentPhase: expect.stringMatching(/beforeReducer|afterReducer/),
  unsubscribe: expect.any(Function),
  subscribe: expect.any(Function),
  cancelPrevious: expect.any(Function),
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

describe('createActionListenerMiddleware', () => {
  let store = configureStore({
    reducer: () => 42,
    middleware: (gDM) => gDM().prepend(createActionListenerMiddleware()),
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
  let middleware: ReturnType<typeof createActionListenerMiddleware>
  // let middleware: ActionListenerMiddleware<CounterState> //: ReturnType<typeof createActionListenerMiddleware>

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
    middleware = createActionListenerMiddleware()
    reducer = jest.fn(() => ({}))
    store = configureStore({
      reducer,
      middleware: (gDM) => gDM().prepend(middleware),
    })
  })

  describe('Middleware setup', () => {
    test('Allows passing an extra argument on middleware creation', () => {
      const originalExtra = 42
      middleware = createActionListenerMiddleware({
        extra: originalExtra,
      })
      reducer = jest.fn(() => ({}))
      store = configureStore({
        reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let foundExtra = null

      middleware.addListener({
        matcher: (action: AnyAction): action is AnyAction => true,
        listener: (action, listenerApi) => {
          foundExtra = listenerApi.extra
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
      const listener = jest.fn((_: TestAction1) => {})

      middleware.addListener({
        actionCreator: testAction1,
        listener: listener,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('can subscribe with a string action type', () => {
      const listener = jest.fn((_: AnyAction) => {})

      store.dispatch(
        addListenerAction({
          type: testAction2.type,
          listener,
        })
      )

      store.dispatch(testAction2('b'))
      expect(listener.mock.calls).toEqual([[testAction2('b'), middlewareApi]])

      store.dispatch(removeListenerAction(testAction2.type, listener))

      store.dispatch(testAction2('b'))
      expect(listener.mock.calls).toEqual([[testAction2('b'), middlewareApi]])
    })

    test('can subscribe with a matcher function', () => {
      const listener = jest.fn((_: AnyAction) => {})

      const isAction1Or2 = isAnyOf(testAction1, testAction2)

      const unsubscribe = middleware.addListener({
        matcher: isAction1Or2,
        listener: listener,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction3('c'))
      expect(listener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction2('b'), middlewareApi],
      ])

      unsubscribe()

      store.dispatch(testAction2('b'))
      expect(listener.mock.calls).toEqual([
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

      middleware.addListener({
        predicate: (action, state, previousState) => {
          return (state as CounterState).value > 1
        },
        listener: (action, listenerApi) => {
          listener1Calls++
        },
      })

      let listener2Calls = 0

      middleware.addListener({
        predicate: (action, state, prevState) => {
          return (
            (state as CounterState).value > 1 &&
            (prevState as CounterState).value % 2 === 0
          )
        },
        listener: (action, listenerApi) => {
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
      const listener = jest.fn((_: TestAction1) => {})

      middleware.addListener({
        actionCreator: testAction1,
        listener,
      })
      middleware.addListener({
        actionCreator: testAction1,
        listener,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('unsubscribing via callback', () => {
      const listener = jest.fn((_: TestAction1) => {})

      const unsubscribe = middleware.addListener({
        actionCreator: testAction1,
        listener,
      })

      store.dispatch(testAction1('a'))
      unsubscribe()
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('directly unsubscribing', () => {
      const listener = jest.fn((_: TestAction1) => {})

      middleware.addListener({
        actionCreator: testAction1,
        listener,
      })

      store.dispatch(testAction1('a'))

      middleware.removeListener(testAction1, listener)
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('unsubscribing without any subscriptions does not trigger an error', () => {
      middleware.removeListener(testAction1, noop)
    })

    test('subscribing via action', () => {
      const listener = jest.fn((_: TestAction1) => {})

      store.dispatch(
        addListenerAction({
          actionCreator: testAction1,
          listener,
        })
      )

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('c'), middlewareApi],
      ])
    })

    test('unsubscribing via callback from dispatch', () => {
      const listener = jest.fn((_: TestAction1) => {})

      const unsubscribe = store.dispatch(
        addListenerAction({
          actionCreator: testAction1,
          listener,
        })
      )
      // TODO Fix this type error - return type isn't getting picked up right
      // @ts-expect-error
      expectType<Unsubscribe>(unsubscribe)

      store.dispatch(testAction1('a'))
      // TODO This return type isn't correct
      // @ts-expect-error
      unsubscribe()
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('unsubscribing via action', () => {
      const listener = jest.fn((_: TestAction1) => {})

      middleware.addListener({
        actionCreator: testAction1,
        listener,
      })

      store.dispatch(testAction1('a'))

      store.dispatch(removeListenerAction(testAction1, listener))
      store.dispatch(testAction2('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    const unforwardedActions: [string, AnyAction][] = [
      [
        'addListenerAction',
        addListenerAction({ actionCreator: testAction1, listener: noop }),
      ],
      ['removeListenerAction', removeListenerAction(testAction1, noop)],
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

    test('"can unsubscribe via middleware api', () => {
      const listener = jest.fn(
        (action: TestAction1, api: ActionListenerMiddlewareAPI<any, any>) => {
          if (action.payload === 'b') {
            api.unsubscribe()
          }
        }
      )

      middleware.addListener({
        actionCreator: testAction1,
        listener,
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction1('b'))
      store.dispatch(testAction1('c'))

      expect(listener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
        [testAction1('b'), middlewareApi],
      ])
    })

    test('Can re-subscribe via middleware api', async () => {
      let numListenerRuns = 0
      middleware.addListener({
        actionCreator: testAction1,
        listener: async (action, listenerApi) => {
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

  describe('Middleware phases and listener API', () => {
    const whenMap: [When, string, string, number][] = [
      [undefined, 'reducer', 'listener', 1],
      ['beforeReducer', 'listener', 'reducer', 1],
      ['afterReducer', 'reducer', 'listener', 1],
      ['both', 'reducer', 'listener', 2],
    ]
    test.each(whenMap)(
      'with "when" set to %s, %s runs before %s',
      (when, _, shouldRunLast, listenerCalls) => {
        let whoRanLast = ''

        reducer.mockClear()
        reducer.mockImplementationOnce(() => {
          whoRanLast = 'reducer'
        })
        const listener = jest.fn(() => {
          whoRanLast = 'listener'
        })

        middleware.addListener({
          actionCreator: testAction1,
          listener,
          when,
        })

        store.dispatch(testAction1('a'))
        expect(reducer).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledTimes(listenerCalls)
        expect(whoRanLast).toBe(shouldRunLast)
      }
    )

    test('Passes both getState and getOriginalState in the API', () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let listener1Calls = 0
      middleware.addListener({
        actionCreator: increment,
        listener: (action, listenerApi) => {
          const stateBefore = listenerApi.getOriginalState() as CounterState
          const currentState = listenerApi.getOriginalState() as CounterState

          listener1Calls++
          // In the "before" phase, we pass the same state
          expect(currentState).toBe(stateBefore)
        },
        when: 'beforeReducer',
      })

      let listener2Calls = 0
      middleware.addListener({
        actionCreator: increment,
        listener: (action, listenerApi) => {
          // TODO getState functions aren't typed right here
          const stateBefore = listenerApi.getOriginalState() as CounterState
          const currentState = listenerApi.getOriginalState() as CounterState

          listener2Calls++
          // In the "after" phase, we pass the new state for `getState`, and still have original state too
          expect(currentState.value).toBe(stateBefore.value + 1)
        },
        when: 'afterReducer',
      })

      store.dispatch(increment())

      expect(listener1Calls).toBe(1)
      expect(listener2Calls).toBe(1)
    })

    test('mixing "before" and "after"', () => {
      const calls: Function[] = []
      function before1() {
        calls.push(before1)
      }
      function before2() {
        calls.push(before2)
      }
      function after1() {
        calls.push(after1)
      }
      function after2() {
        calls.push(after2)
      }

      middleware.addListener({
        actionCreator: testAction1,
        listener: before1,
        when: 'beforeReducer',
      })
      middleware.addListener({
        actionCreator: testAction1,
        listener: before2,
        when: 'beforeReducer',
      })
      middleware.addListener({
        actionCreator: testAction1,
        listener: after1,
        when: 'afterReducer',
      })
      middleware.addListener({
        actionCreator: testAction1,
        listener: after2,
        when: 'afterReducer',
      })

      store.dispatch(testAction1('a'))
      store.dispatch(testAction2('a'))

      expect(calls).toEqual([before1, before2, after1, after2])
    })

    test('by default, actions are forwarded to the store', () => {
      reducer.mockClear()

      const listener = jest.fn((_: TestAction1) => {})

      middleware.addListener({
        actionCreator: testAction1,
        listener,
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
      middleware.addListener({
        actionCreator: increment,
        listener: async (_, listenerApi) => {
          listenerApi.unsubscribe()
          listenerApi.signal.addEventListener(
            'abort',
            deferredCompletedEvt.resolve,
            { once: true }
          )
          listenerApi.delay(100) // missing await
        },
      })

      middleware.addListener({
        actionCreator: increment,
        listener: async (_, listenerApi) => {
          listenerApi.cancelPrevious()
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

      middleware.addListener({
        matcher,
        listener: () => {
          throw new Error('Panic!')
        },
      })

      const listener = jest.fn(() => {})
      middleware.addListener({ matcher, listener })

      store.dispatch(testAction1('a'))
      expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
    })

    test('Continues running other listeners if a predicate raises an error', () => {
      const matcher = (action: any): action is any => true
      const firstListener = jest.fn(() => {})
      const secondListener = jest.fn(() => {})

      middleware.addListener({
        // @ts-expect-error
        matcher: (arg: unknown): arg is unknown => {
          throw new Error('Predicate Panic!')
        },
        listener: firstListener,
      })

      middleware.addListener({ matcher, listener: secondListener })

      store.dispatch(testAction1('a'))
      expect(firstListener).not.toHaveBeenCalled()
      expect(secondListener.mock.calls).toEqual([
        [testAction1('a'), middlewareApi],
      ])
    })

    test('Notifies sync listener errors to `onError`, if provided', async () => {
      const onError = jest.fn()
      middleware = createActionListenerMiddleware({
        onError,
      })
      reducer = jest.fn(() => ({}))
      store = configureStore({
        reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      const listenerError = new Error('Boom!')

      const matcher = (action: any): action is any => true

      middleware.addListener({
        matcher,
        listener: () => {
          throw listenerError
        },
      })

      store.dispatch(testAction1('a'))
      await delay(100)

      expect(onError).toBeCalledWith(listenerError, {
        raisedBy: 'listener',
        phase: 'afterReducer',
      })
    })

    test('Notifies async listeners errors to `onError`, if provided', async () => {
      const onError = jest.fn()
      middleware = createActionListenerMiddleware({
        onError,
      })
      reducer = jest.fn(() => ({}))
      store = configureStore({
        reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      const listenerError = new Error('Boom!')
      const matcher = (action: any): action is any => true

      middleware.addListener({
        matcher,
        listener: async () => {
          throw listenerError
        },
      })

      store.dispatch(testAction1('a'))

      await delay(100)

      expect(onError).toBeCalledWith(listenerError, {
        raisedBy: 'listener',
        phase: 'afterReducer',
      })
    })
  })

  describe('take and condition methods', () => {
    test('take resolves to the tuple [A, CurrentState, PreviousState] when the predicate matches the action', (done) => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      middleware.addListener({
        predicate: incrementByAmount.match,
        listener: async (_, listenerApi) => {
          const stateBefore = listenerApi.getState()
          const result = await listenerApi.take(increment.match)

          expect(result).toEqual([
            increment(),
            listenerApi.getState(),
            stateBefore,
          ])
          done()
        },
      })
      store.dispatch(incrementByAmount(1))
      store.dispatch(increment())
    })

    test('take resolves to null if the timeout expires', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let takeResult: any = undefined

      middleware.addListener({
        predicate: incrementByAmount.match,
        listener: async (_, listenerApi) => {
          takeResult = await listenerApi.take(increment.match, 15)
        },
      })
      store.dispatch(incrementByAmount(1))
      await delay(25)

      expect(takeResult).toBe(null)
    })

    test("take resolves to [A, CurrentState, PreviousState] if the timeout is provided but doesn't expires", async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })
      let takeResult: any = undefined
      let stateBefore: any = undefined
      let stateCurrent: any = undefined

      middleware.addListener({
        predicate: incrementByAmount.match,
        listener: async (_, listenerApi) => {
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

    test('condition method resolves promise when the predicate succeeds', async () => {
      const store = configureStore({
        reducer: counterSlice.reducer,
        middleware: (gDM) => gDM().prepend(middleware),
      })

      let finalCount = 0
      let listenerStarted = false

      middleware.addListener({
        predicate: (action, currentState) => {
          return (
            increment.match(action) &&
            (currentState as CounterState).value === 0
          )
        },
        listener: async (action, listenerApi) => {
          listenerStarted = true
          const result = await listenerApi.condition((action, currentState) => {
            return (currentState as CounterState).value === 3
          })

          expect(result).toBe(true)
          const latestState = listenerApi.getState() as CounterState
          finalCount = latestState.value
        },
        when: 'beforeReducer',
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

      middleware.addListener({
        predicate: (action, currentState) => {
          return (
            increment.match(action) &&
            (currentState as CounterState).value === 0
          )
        },
        listener: async (action, listenerApi) => {
          listenerStarted = true
          const result = await listenerApi.condition((action, currentState) => {
            return (currentState as CounterState).value === 3
          }, 25)

          expect(result).toBe(false)
          const latestState = listenerApi.getState() as CounterState
          finalCount = latestState.value
        },
        when: 'beforeReducer',
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

      middleware.addListener({
        predicate: () => true,
        listener: async (_, listenerApi) => {
          listenerApi.unsubscribe() // run once
          listenerApi.signal.addEventListener(
            'abort',
            deferredCompletedEvt.resolve
          )
          listenerApi.take(() => true) // missing await
        },
      })

      middleware.addListener({
        predicate: () => true,
        listener: async (_, listenerApi) => {
          listenerApi.cancelPrevious()
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

      middleware.addListener({
        actionCreator: increment,
        listener: async (action, listenerApi) => {
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
            listenerApi.cancelPrevious()
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
    const middleware = createActionListenerMiddleware()
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
        listener: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectUnknown(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = getState()
            expectUnknown(thunkState)
          })
        },
      })

      middleware.addListener({
        predicate: (
          action,
          currentState,
          previousState
        ): action is AnyAction => {
          expectUnknown(currentState)
          expectUnknown(previousState)
          return true
        },
        listener: (action, listenerApi) => {},
      })

      middleware.addListener({
        matcher: increment.match,
        listener: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectUnknown(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = getState()
            expectUnknown(thunkState)
          })
        },
      })

      store.dispatch(
        addListenerAction({
          predicate: (
            action,
            currentState,
            previousState
          ): action is AnyAction => {
            expectUnknown(currentState)
            expectUnknown(previousState)
            return true
          },
          listener: (action, listenerApi) => {
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
        addListenerAction({
          matcher: increment.match,
          listener: (action, listenerApi) => {
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
      middleware.addListener({
        type: 'abcd',
        listener: (action, listenerApi) => {
          expectType<{ type: 'abcd' }>(action)
        },
      })

      middleware.addListener({
        actionCreator: incrementByAmount,
        listener: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)
        },
      })

      middleware.addListener({
        matcher: incrementByAmount.match,
        listener: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)
        },
      })

      middleware.addListener({
        predicate: (
          action,
          currentState,
          previousState
        ): action is PayloadAction<number> => {
          return typeof action.payload === 'boolean'
        },
        listener: (action, listenerApi) => {
          // @ts-expect-error
          expectExactType<PayloadAction<number>>(action)
        },
      })

      middleware.addListener({
        predicate: (action, currentState) => {
          return typeof action.payload === 'number'
        },
        listener: (action, listenerApi) => {
          expectExactType<AnyAction>(action)
        },
      })

      store.dispatch(
        addListenerAction({
          type: 'abcd',
          listener: (action, listenerApi) => {
            expectType<{ type: 'abcd' }>(action)
          },
        })
      )

      store.dispatch(
        addListenerAction({
          actionCreator: incrementByAmount,
          listener: (action, listenerApi) => {
            expectType<PayloadAction<number>>(action)
          },
        })
      )

      store.dispatch(
        addListenerAction({
          matcher: incrementByAmount.match,
          listener: (action, listenerApi) => {
            expectType<PayloadAction<number>>(action)
          },
        })
      )
    })

    test('Can create a pre-typed middleware', () => {
      const typedMiddleware = createActionListenerMiddleware<CounterState>()

      typedMiddleware.addListener({
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
        listener: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      // Can pass a predicate function with fewer args
      typedMiddleware.addListener({
        // TODO Why won't this infer the listener's `action` with implicit argument types?
        predicate: (
          action: AnyAction,
          currentState: CounterState
        ): action is PayloadAction<number> => {
          expectNotAny(currentState)
          expectExactType<CounterState>(currentState)
          return true
        },
        listener: (action, listenerApi) => {
          expectType<PayloadAction<number>>(action)

          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      typedMiddleware.addListener({
        actionCreator: incrementByAmount,
        listener: (action, listenerApi) => {
          const listenerState = listenerApi.getState()
          expectExactType<CounterState>(listenerState)
          listenerApi.dispatch((dispatch, getState) => {
            const thunkState = listenerApi.getState()
            expectExactType<CounterState>(thunkState)
          })
        },
      })

      store.dispatch(
        typedMiddleware.addListenerAction({
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
          listener: (action, listenerApi) => {
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
        typedMiddleware.addListenerAction({
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
          listener: (action, listenerApi) => {
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

    test('Can create pre-typed versions of addListener and addListenerAction', () => {
      const typedAddListener =
        middleware.addListener as TypedAddListener<CounterState>
      const typedAddListenerAction =
        addListenerAction as TypedAddListenerAction<CounterState>

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
        listener: (action, listenerApi) => {
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
        listener: (action, listenerApi) => {
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
          listener: (action, listenerApi) => {
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
          listener: (action, listenerApi) => {
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
