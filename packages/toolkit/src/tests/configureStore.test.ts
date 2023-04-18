import type { StoreEnhancer, StoreEnhancerStoreCreator } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import * as RTK from '@reduxjs/toolkit'
import * as redux from 'redux'
import * as devtools from '@internal/devtoolsExtension'

describe('configureStore', () => {
  jest.spyOn(redux, 'applyMiddleware')
  jest.spyOn(redux, 'combineReducers')
  jest.spyOn(redux, 'compose')
  jest.spyOn(redux, 'createStore')
  jest.spyOn(devtools, 'composeWithDevTools') // @remap-prod-remove-line

  const reducer: redux.Reducer = (state = {}, _action) => state

  beforeEach(() => jest.clearAllMocks())

  describe('given a function reducer', () => {
    it('calls createStore with the reducer', () => {
      configureStore({ reducer })
      expect(configureStore({ reducer })).toBeInstanceOf(Object)
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given an object of reducers', () => {
    it('calls createStore with the combined reducers', () => {
      const reducer = {
        reducer() {
          return true
        },
      }
      expect(configureStore({ reducer })).toBeInstanceOf(Object)
      expect(redux.combineReducers).toHaveBeenCalledWith(reducer)
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line-line
      expect(redux.createStore).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given no reducer', () => {
    it('throws', () => {
      expect(configureStore).toThrow(
        '"reducer" is a required argument, and must be a function or an object of functions that can be passed to combineReducers'
      )
    })
  })

  describe('given no middleware', () => {
    it('calls createStore without any middleware', () => {
      expect(configureStore({ middleware: [], reducer })).toBeInstanceOf(Object)
      expect(redux.applyMiddleware).toHaveBeenCalledWith()
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given undefined middleware', () => {
    it('calls createStore with default middleware', () => {
      expect(configureStore({ middleware: undefined, reducer })).toBeInstanceOf(
        Object
      )
      expect(redux.applyMiddleware).toHaveBeenCalledWith(
        expect.any(Function), // thunk
        expect.any(Function), // immutableCheck
        expect.any(Function) // serializableCheck
      )
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given a middleware creation function that returns undefined', () => {
    it('throws an error', () => {
      const invalidBuilder = jest.fn((getDefaultMiddleware) => undefined as any)
      expect(() =>
        configureStore({ middleware: invalidBuilder, reducer })
      ).toThrow(
        'when using a middleware builder function, an array of middleware must be returned'
      )
    })
  })

  describe('given a middleware creation function that returns an array with non-functions', () => {
    it('throws an error', () => {
      const invalidBuilder = jest.fn((getDefaultMiddleware) => [true] as any)
      expect(() =>
        configureStore({ middleware: invalidBuilder, reducer })
      ).toThrow('each middleware provided to configureStore must be a function')
    })
  })

  describe('given custom middleware that contains non-functions', () => {
    it('throws an error', () => {
      expect(() =>
        configureStore({ middleware: [true] as any, reducer })
      ).toThrow('each middleware provided to configureStore must be a function')
    })
  })

  describe('given custom middleware', () => {
    it('calls createStore with custom middleware and without default middleware', () => {
      const thank: redux.Middleware = (_store) => (next) => (action) =>
        next(action)
      expect(configureStore({ middleware: [thank], reducer })).toBeInstanceOf(
        Object
      )
      expect(redux.applyMiddleware).toHaveBeenCalledWith(thank)
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('middleware builder notation', () => {
    it('calls builder, passes getDefaultMiddleware and uses returned middlewares', () => {
      const thank = jest.fn(
        ((_store) => (next) => (action) => 'foobar') as redux.Middleware
      )

      const builder = jest.fn((getDefaultMiddleware) => {
        expect(getDefaultMiddleware).toEqual(expect.any(Function))
        expect(getDefaultMiddleware()).toEqual(expect.any(Array))

        return [thank]
      })

      const store = configureStore({ middleware: builder, reducer })

      expect(builder).toHaveBeenCalled()

      expect(store.dispatch({ type: 'test' })).toBe('foobar')
    })
  })

  describe('with devTools disabled', () => {
    it('calls createStore without devTools enhancer', () => {
      expect(configureStore({ devTools: false, reducer })).toBeInstanceOf(
        Object
      )
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(redux.compose).toHaveBeenCalled()
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('with devTools options', () => {
    it('calls createStore with devTools enhancer and option', () => {
      const options = {
        name: 'myApp',
        trace: true,
      }
      expect(configureStore({ devTools: options, reducer })).toBeInstanceOf(
        Object
      )
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(devtools.composeWithDevTools).toHaveBeenCalledWith(options) // @remap-prod-remove-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given preloadedState', () => {
    it('calls createStore with preloadedState', () => {
      expect(configureStore({ reducer })).toBeInstanceOf(Object)
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })
  })

  describe('given enhancers', () => {
    it('calls createStore with enhancers', () => {
      const enhancer: redux.StoreEnhancer = (next) => next
      expect(configureStore({ enhancers: [enhancer], reducer })).toBeInstanceOf(
        Object
      )
      expect(redux.applyMiddleware).toHaveBeenCalled()
      expect(devtools.composeWithDevTools).toHaveBeenCalled() // @remap-prod-remove-line
      expect(redux.createStore).toHaveBeenCalledWith(
        reducer,
        undefined,
        expect.any(Function)
      )
    })

    it('accepts a callback for customizing enhancers', () => {
      let dummyEnhancerCalled = false

      const dummyEnhancer: StoreEnhancer =
        (createStore: StoreEnhancerStoreCreator) =>
        (reducer, ...args: any[]) => {
          dummyEnhancerCalled = true

          return createStore(reducer, ...args)
        }

      const reducer = () => ({})

      const store = configureStore({
        reducer,
        enhancers: (defaultEnhancers) => defaultEnhancers.concat(dummyEnhancer),
      })

      expect(dummyEnhancerCalled).toBe(true)
    })
  })
})
