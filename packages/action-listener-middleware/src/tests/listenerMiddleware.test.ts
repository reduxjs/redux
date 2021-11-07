import { configureStore, createAction, AnyAction } from '@reduxjs/toolkit'
import {
  createActionListenerMiddleware,
  addListenerAction,
  removeListenerAction,
  When,
  ActionListenerMiddlewareAPI,
} from '../index'

const middlewareApi = {
  getState: expect.any(Function),
  dispatch: expect.any(Function),
  stopPropagation: expect.any(Function),
  unsubscribe: expect.any(Function),
}

const noop = () => {}

describe('createActionListenerMiddleware', () => {
  let store = configureStore({
    reducer: () => ({}),
    middleware: [createActionListenerMiddleware()] as const,
  })
  let reducer: jest.Mock
  let middleware: ReturnType<typeof createActionListenerMiddleware>

  const testAction1 = createAction<string>('testAction1')
  type TestAction1 = ReturnType<typeof testAction1>
  const testAction2 = createAction<string>('testAction2')

  beforeEach(() => {
    middleware = createActionListenerMiddleware()
    reducer = jest.fn(() => ({}))
    store = configureStore({
      reducer,
      middleware: [middleware] as const,
    })
  })

  test('directly subscribing', () => {
    const listener = jest.fn((_: TestAction1) => {})

    middleware.addListener(testAction1, listener)

    store.dispatch(testAction1('a'))
    store.dispatch(testAction2('b'))
    store.dispatch(testAction1('c'))

    expect(listener.mock.calls).toEqual([
      [testAction1('a'), middlewareApi],
      [testAction1('c'), middlewareApi],
    ])
  })

  test('subscribing with the same listener will not make it trigger twice (like EventTarget.addEventListener())', () => {
    const listener = jest.fn((_: TestAction1) => {})

    middleware.addListener(testAction1, listener)
    middleware.addListener(testAction1, listener)

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

    const unsubscribe = middleware.addListener(testAction1, listener)

    store.dispatch(testAction1('a'))
    unsubscribe()
    store.dispatch(testAction2('b'))
    store.dispatch(testAction1('c'))

    expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
  })

  test('directly unsubscribing', () => {
    const listener = jest.fn((_: TestAction1) => {})

    middleware.addListener(testAction1, listener)

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

    store.dispatch(addListenerAction(testAction1, listener))

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

    const unsubscribe = store.dispatch(addListenerAction(testAction1, listener))

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

    middleware.addListener(testAction1, listener)

    store.dispatch(testAction1('a'))

    store.dispatch(removeListenerAction(testAction1, listener))
    store.dispatch(testAction2('b'))
    store.dispatch(testAction1('c'))

    expect(listener.mock.calls).toEqual([[testAction1('a'), middlewareApi]])
  })

  const unforwaredActions: [string, AnyAction][] = [
    ['addListenerAction', addListenerAction(testAction1, noop)],
    ['removeListenerAction', removeListenerAction(testAction1, noop)],
  ]
  test.each(unforwaredActions)(
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
      (
        action: TestAction1,
        api: ActionListenerMiddlewareAPI<any, any, any>
      ) => {
        if (action.payload === 'b') {
          api.unsubscribe()
        }
      }
    )

    middleware.addListener(testAction1, listener)

    store.dispatch(testAction1('a'))
    store.dispatch(testAction1('b'))
    store.dispatch(testAction1('c'))

    expect(listener.mock.calls).toEqual([
      [testAction1('a'), middlewareApi],
      [testAction1('b'), middlewareApi],
    ])
  })

  const whenMap: [When, string, string][] = [
    [undefined, 'reducer', 'listener'],
    ['before', 'listener', 'reducer'],
    ['after', 'reducer', 'listener'],
  ]
  test.each(whenMap)(
    'with "when" set to %s, %s runs before %s',
    (when, _, shouldRunLast) => {
      let whoRanLast = ''

      reducer.mockClear()
      reducer.mockImplementationOnce(() => {
        whoRanLast = 'reducer'
      })
      const listener = jest.fn(() => {
        whoRanLast = 'listener'
      })

      middleware.addListener(testAction1, listener, when ? { when } : {})

      store.dispatch(testAction1('a'))
      expect(reducer).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledTimes(1)
      expect(whoRanLast).toBe(shouldRunLast)
    }
  )

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

    middleware.addListener(testAction1, before1, { when: 'before' })
    middleware.addListener(testAction1, before2, { when: 'before' })
    middleware.addListener(testAction1, after1, { when: 'after' })
    middleware.addListener(testAction1, after2, { when: 'after' })

    store.dispatch(testAction1('a'))
    store.dispatch(testAction2('a'))

    expect(calls).toEqual([before1, before2, after1, after2])
  })

  test('mixing "before" and "after" with stopPropagation', () => {
    const calls: Function[] = []
    function before1() {
      calls.push(before1)
    }
    function before2(_: any, api: any) {
      calls.push(before2)
      api.stopPropagation()
    }
    function before3() {
      calls.push(before3)
    }
    function after1() {
      calls.push(after1)
    }
    function after2() {
      calls.push(after2)
    }

    middleware.addListener(testAction1, before1, { when: 'before' })
    middleware.addListener(testAction1, before2, { when: 'before' })
    middleware.addListener(testAction1, before3, { when: 'before' })
    middleware.addListener(testAction1, after1, { when: 'after' })
    middleware.addListener(testAction1, after2, { when: 'after' })

    store.dispatch(testAction1('a'))
    store.dispatch(testAction2('a'))

    expect(calls).toEqual([before1, before2])
  })

  test('by default, actions are forwarded to the store', () => {
    reducer.mockClear()

    const listener = jest.fn((_: TestAction1) => {})

    middleware.addListener(testAction1, listener)

    store.dispatch(testAction1('a'))

    expect(reducer.mock.calls).toEqual([[{}, testAction1('a')]])
  })

  test('calling `api.stopPropagation` in the listeners prevents actions from being forwarded to the store', () => {
    reducer.mockClear()

    middleware.addListener(
      testAction1,
      (action: TestAction1, api) => {
        if (action.payload === 'b') {
          api.stopPropagation()
        }
      },
      { when: 'before' }
    )

    store.dispatch(testAction1('a'))
    store.dispatch(testAction1('b'))
    store.dispatch(testAction1('c'))

    expect(reducer.mock.calls).toEqual([
      [{}, testAction1('a')],
      [{}, testAction1('c')],
    ])
  })

  test('calling `api.stopPropagation` with `when` set to "after" causes an error to be thrown', () => {
    reducer.mockClear()

    middleware.addListener(
      testAction1,
      (action: TestAction1, api) => {
        if (action.payload === 'b') {
          // @ts-ignore TypeScript would already prevent this from being called with "after"
          api.stopPropagation()
        }
      },
      { when: 'after' }
    )

    store.dispatch(testAction1('a'))
    expect(() => {
      store.dispatch(testAction1('b'))
    }).toThrowErrorMatchingInlineSnapshot(
      `"stopPropagation can only be called by action listeners with the \`when\` option set to \\"before\\""`
    )
  })

  test('calling `api.stopPropagation` asynchronously causes an error to be thrown', (finish) => {
    reducer.mockClear()

    middleware.addListener(
      testAction1,
      (action: TestAction1, api) => {
        if (action.payload === 'b') {
          setTimeout(() => {
            expect(() => {
              api.stopPropagation()
            }).toThrowErrorMatchingInlineSnapshot(
              `"stopPropagation can only be called synchronously"`
            )
            finish()
          })
        }
      },
      { when: 'before' }
    )

    store.dispatch(testAction1('a'))
    store.dispatch(testAction1('b'))
  })
})
