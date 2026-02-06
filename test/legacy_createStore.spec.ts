
import { legacy_createStore } from 'redux'
import * as reducers from './helpers/reducers'
import { addTodo } from './helpers/actionCreators'

describe('legacy_createStore', () => {
  it('exposes the public API', () => {
    const store = legacy_createStore(reducers.todos)
    const methods = Object.keys(store)

    expect(methods).toContain('subscribe')
    expect(methods).toContain('dispatch')
    expect(methods).toContain('getState')
    expect(methods).toContain('replaceReducer')
  })

  it('passes the initial state', () => {
    const store = legacy_createStore(reducers.todos, [
      {
        id: 1,
        text: 'Hello'
      }
    ])
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('applies the reducer to the previous state', () => {
    const store = legacy_createStore(reducers.todos)
    expect(store.getState()).toEqual([])

    store.dispatch(addTodo('Hello'))
    expect(store.getState()).toEqual([
      {
        id: 1,
        text: 'Hello'
      }
    ])
  })

  it('supports enhancers', () => {
     const spyEnhancer =
      (vanillaCreateStore: any) =>
      (...args: any[]) => {
        const vanillaStore = vanillaCreateStore(...args)
        return {
          ...vanillaStore,
          dispatch: (action: any) => {
             return vanillaStore.dispatch(action)
          }
        }
      }
      
     const store = legacy_createStore(reducers.todos, spyEnhancer)
     store.dispatch(addTodo('Hello'))
     expect(store.getState()).toEqual([{ id: 1, text: 'Hello' }])
  })
})
