import { createStore, applyMiddleware, Middleware, AnyAction, Action } from '..'
import * as reducers from './helpers/reducers'
import { addTodo, addTodoAsync, addTodoIfEmpty } from './helpers/actionCreators'
import { thunk } from './helpers/middleware'

describe('applyMiddleware', () => {
  it('warns when dispatching during middleware setup', () => {
    function dispatchingMiddleware(store) {
      store.dispatch(addTodo('Dont dispatch in middleware setup'))
      return next => action => next(action)
    }

    expect(() =>
      applyMiddleware(dispatchingMiddleware)(createStore)(reducers.todos)
    ).toThrow()
  })

  it('wraps dispatch method with middleware once', () => {
    function test(spyOnMethods) {
      return methods => {
        spyOnMethods(methods)
        return next => action => next(action)
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
    function test(spyOnMethods) {
      return () => next => action => {
        spyOnMethods(action)
        return next(action)
      }
    }

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    // the typing for redux-thunk is super complex, so we will use an as unknown hack
    const dispatchedValue = (store.dispatch(
      addTodoAsync('Use Redux')
    ) as unknown) as Promise<void>
    return dispatchedValue.then(() => {
      expect(spy.mock.calls.length).toEqual(2)
    })
  })

  it('works with thunk middleware', done => {
    const store = applyMiddleware(thunk)(createStore)(reducers.todos)

    store.dispatch(addTodoIfEmpty('Hello'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])

    store.dispatch(addTodoIfEmpty('Hello'))
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
    const dispatchedValue = (store.dispatch(
      addTodoAsync('Maybe')
    ) as unknown) as Promise<void>
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
      return next => (action, callArgs?: any) => {
        if (Array.isArray(callArgs)) {
          return action(...callArgs)
        }
        return next(action)
      }
    }

    function dummyMiddleware({ dispatch }) {
      return _next => action => dispatch(action, testCallArgs)
    }

    const store = createStore(
      reducers.todos,
      applyMiddleware(multiArgMiddleware, dummyMiddleware)
    )

    store.dispatch(spy)
    expect(spy.mock.calls[0]).toEqual(testCallArgs)
  })
})
