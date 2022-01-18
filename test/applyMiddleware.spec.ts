import {
  createStore,
  applyMiddleware,
  Middleware,
  MiddlewareAPI,
  AnyAction,
  Action,
  Store,
  Dispatch
} from '..'
import * as reducers from './helpers/reducers'
import { addTodo, addTodoAsync, addTodoIfEmpty } from './helpers/actionCreators'
import { thunk } from './helpers/middleware'

describe('applyMiddleware', () => {
  it('warns when dispatching during middleware setup', () => {
    function dispatchingMiddleware(store: Store) {
      store.dispatch(addTodo("Don't dispatch in middleware setup"))
      return (next: Dispatch) => (action: Action) => next(action)
    }

    expect(() =>
      applyMiddleware(dispatchingMiddleware as Middleware)(createStore)(
        reducers.todos
      )
    ).toThrow()
  })

  it('wraps dispatch method with middleware once', () => {
    function test(spyOnMethods: any) {
      return (methods: any) => {
        spyOnMethods(methods)
        return (next: Dispatch) => (action: Action) => next(action)
      }
    }

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    store.dispatch(addTodo('Use Redux'))
    store.dispatch(addTodo('Flux FTW!'))

    expect(spy.mock.calls.length).toEqual(1)

    expect(spy.mock.calls[0][0]).toHaveProperty('getState')
    expect(spy.mock.calls[0][0]).toHaveProperty('dispatch')

    expect(store.getState()).toEqual([
      { id: 1, text: 'Use Redux' },
      { id: 2, text: 'Flux FTW!' }
    ])
  })

  it('passes recursive dispatches through the middleware chain', () => {
    function test(spyOnMethods: any) {
      return () => (next: Dispatch) => (action: Action) => {
        spyOnMethods(action)
        return next(action)
      }
    }

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    // the typing for redux-thunk is super complex, so we will use an as unknown hack
    const dispatchedValue = store.dispatch(
      addTodoAsync('Use Redux') as any
    ) as unknown as Promise<void>
    return dispatchedValue.then(() => {
      expect(spy.mock.calls.length).toEqual(2)
    })
  })

  it('works with thunk middleware', done => {
    const store = applyMiddleware(thunk)(createStore)(reducers.todos)

    store.dispatch(addTodoIfEmpty('Hello') as any)
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodoIfEmpty('Hello') as any)
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodo('World'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      },
      {
        id: 2,
        text: 'World'
      }
    ])

    // the typing for redux-thunk is super complex, so we will use an "as unknown" hack
    const dispatchedValue = store.dispatch(
      addTodoAsync('Maybe') as any
    ) as unknown as Promise<void>
    dispatchedValue.then(() => {
      expect(store.getState()).toEqual([
        {
          id: 1,
          text: 'Hello'
        },
        {
          id: 2,
          text: 'World'
        },
        {
          id: 3,
          text: 'Maybe'
        }
      ])
      done()
    })
  })

  it('passes through all arguments of dispatch calls from within middleware', () => {
    const spy = jest.fn()
    const testCallArgs = ['test']

    interface MultiDispatch<A extends Action = AnyAction> {
      <T extends A>(action: T, extraArg?: string[]): T
    }

    const multiArgMiddleware: Middleware<
      MultiDispatch,
      any,
      MultiDispatch
    > = _store => {
      return next => (action: any, callArgs?: any) => {
        if (Array.isArray(callArgs)) {
          return action(...callArgs)
        }
        return next(action)
      }
    }

    function dummyMiddleware({ dispatch }: MiddlewareAPI) {
      return (_next: Dispatch) => (action: Action) =>
        dispatch(action, testCallArgs)
    }

    const store = createStore(
      reducers.todos,
      applyMiddleware(multiArgMiddleware, dummyMiddleware)
    )

    store.dispatch(spy as any)
    expect(spy.mock.calls[0]).toEqual(testCallArgs)
  })
})
