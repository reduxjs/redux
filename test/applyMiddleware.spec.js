import expect from 'expect'
import { createStore, applyMiddleware } from '../src/index'
import * as reducers from './helpers/reducers'
import { addTodo, addTodoAsync, addTodoIfEmpty } from './helpers/actionCreators'
import { thunk } from './helpers/middleware'

describe('applyMiddleware', () => {
  it('wraps dispatch method with middleware once', () => {
    function test(spyOnMethods) {
      return methods => {
        spyOnMethods(methods)
        return next => action => next(action)
      }
    }

    const spy = expect.createSpy(() => {})
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    store.dispatch(addTodo('Use Redux'))
    store.dispatch(addTodo('Flux FTW!'))

    expect(spy.calls.length).toEqual(1)

    expect(Object.keys(spy.calls[0].arguments[0])).toEqual([
      'getState',
      'dispatch'
    ])

    expect(store.getState()).toEqual([ { id: 1, text: 'Use Redux' }, { id: 2, text: 'Flux FTW!' } ])
  })

  it('passes recursive dispatches through the middleware chain', () => {
    function test(spyOnMethods) {
      return () => next => action => {
        spyOnMethods(action)
        return next(action)
      }
    }

    const spy = expect.createSpy(() => {})
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    return store.dispatch(addTodoAsync('Use Redux')).then(() => {
      expect(spy.calls.length).toEqual(2)
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

    store.dispatch(addTodoAsync('Maybe')).then(() => {
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
})
