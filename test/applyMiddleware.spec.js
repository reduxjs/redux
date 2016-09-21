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

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    store.dispatch(addTodo('Use Redux'))
    store.dispatch(addTodo('Flux FTW!'))

    expect(spy.mock.calls.length).toEqual(1)

    expect(Object.keys(spy.mock.calls[0][0])).toEqual([
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

    const spy = jest.fn()
    const store = applyMiddleware(test(spy), thunk)(createStore)(reducers.todos)

    return store.dispatch(addTodoAsync('Use Redux')).then(() => {
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

  it('keeps unwrapped dispatch available while middleware is initializing', () => {
    // This is documenting the existing behavior in Redux 3.x.
    // We plan to forbid this in Redux 4.x.

    function earlyDispatch({ dispatch }) {
      dispatch(addTodo('Hello'))
      return () => action => action
    }

    const store = createStore(reducers.todos, applyMiddleware(earlyDispatch))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })
})
