/* eslint-disable no-console */
import {
  createStore,
  combineReducers,
  __DO_NOT_USE__ActionTypes as ActionTypes
} from '../'

describe('Utils', () => {
  describe('combineReducers', () => {
    it('returns a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counter: (state = 0, action) =>
          action.type === 'increment' ? state + 1 : state,
        stack: (state = [], action) =>
          action.type === 'push' ? [...state, action.value] : state
      })

      const s1 = reducer({}, { type: 'increment' })
      expect(s1).toEqual({ counter: 1, stack: [] })
      const s2 = reducer(s1, { type: 'push', value: 'a' })
      expect(s2).toEqual({ counter: 1, stack: ['a'] })
    })

    it('ignores all props which are not a function', () => {
      const reducer = combineReducers({
        fake: true,
        broken: 'string',
        another: { nested: 'object' },
        stack: (state = []) => state
      })

      expect(Object.keys(reducer({}, { type: 'push' }))).toEqual(['stack'])
    })

    it('warns if a reducer prop is undefined', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      let isNotDefined
      combineReducers({ isNotDefined })
      expect(spy.mock.calls[0][0]).toMatch(
        /No reducer provided for key "isNotDefined"/
      )

      spy.mockClear()
      combineReducers({ thing: undefined })
      expect(spy.mock.calls[0][0]).toMatch(
        /No reducer provided for key "thing"/
      )

      spy.mockClear()
      console.error = preSpy
    })

    it('throws an error if a reducer returns undefined handling an action', () => {
      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action && action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            case 'whatever':
            case null:
            case undefined:
              return undefined
            default:
              return state
          }
        }
      })

      expect(() => reducer({ counter: 0 }, { type: 'whatever' })).toThrow(
        /"whatever".*"counter"/
      )
      expect(() => reducer({ counter: 0 }, null)).toThrow(
        /"counter".*an action/
      )
      expect(() => reducer({ counter: 0 }, {})).toThrow(/"counter".*an action/)
    })

    it('throws an error on first call if a reducer returns undefined initializing', () => {
      const reducer = combineReducers({
        counter(state, action) {
          switch (action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            default:
              return state
          }
        }
      })
      expect(() => reducer({})).toThrow(/"counter".*initialization/)
    })

    it('catches error thrown in reducer when initializing and re-throw', () => {
      const reducer = combineReducers({
        throwingReducer() {
          throw new Error('Error thrown in reducer')
        }
      })
      expect(() => reducer({})).toThrow(/Error thrown in reducer/)
    })

    it('allows a symbol to be used as an action type', () => {
      const increment = Symbol('INCREMENT')

      const reducer = combineReducers({
        counter(state = 0, action) {
          switch (action.type) {
            case increment:
              return state + 1
            default:
              return state
          }
        }
      })

      expect(reducer({ counter: 0 }, { type: increment }).counter).toEqual(1)
    })

    it('maintains referential equality if the reducers it is combining do', () => {
      const reducer = combineReducers({
        child1(state = {}) {
          return state
        },
        child2(state = {}) {
          return state
        },
        child3(state = {}) {
          return state
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      expect(reducer(initialState, { type: 'FOO' })).toBe(initialState)
    })

    it('does not have referential equality if one of the reducers changes something', () => {
      const reducer = combineReducers({
        child1(state = {}) {
          return state
        },
        child2(state = { count: 0 }, action) {
          switch (action.type) {
            case 'increment':
              return { count: state.count + 1 }
            default:
              return state
          }
        },
        child3(state = {}) {
          return state
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      expect(reducer(initialState, { type: 'increment' })).not.toBe(
        initialState
      )
    })

    it('throws an error on first call if a reducer attempts to handle a private action', () => {
      const reducer = combineReducers({
        counter(state, action) {
          switch (action.type) {
            case 'increment':
              return state + 1
            case 'decrement':
              return state - 1
            // Never do this in your code:
            case ActionTypes.INIT:
              return 0
            default:
              return undefined
          }
        }
      })
      expect(() => reducer()).toThrow(/"counter".*private/)
    })

    it('warns if no reducers are passed to combineReducers', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      const reducer = combineReducers({})
      reducer({})
      expect(spy.mock.calls[0][0]).toMatch(
        /Store does not have a valid reducer/
      )

      spy.mockClear()
      console.error = preSpy
    })

    it('warns if input state does not match reducer shape', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      const reducer = combineReducers({
        foo(state = { bar: 1 }) {
          return state
        },
        baz(state = { qux: 3 }) {
          return state
        }
      })

      reducer()
      expect(spy.mock.calls.length).toBe(0)

      reducer({ foo: { bar: 2 } })
      expect(spy.mock.calls.length).toBe(0)

      reducer({
        foo: { bar: 2 },
        baz: { qux: 4 }
      })
      expect(spy.mock.calls.length).toBe(0)

      createStore(reducer, { bar: 2 })
      expect(spy.mock.calls[0][0]).toMatch(
        /Unexpected key "bar".*createStore.*instead: "foo", "baz"/
      )

      createStore(reducer, { bar: 2, qux: 4, thud: 5 })
      expect(spy.mock.calls[1][0]).toMatch(
        /Unexpected keys "qux", "thud".*createStore.*instead: "foo", "baz"/
      )

      createStore(reducer, 1)
      expect(spy.mock.calls[2][0]).toMatch(
        /createStore has unexpected type of "Number".*keys: "foo", "baz"/
      )

      reducer({ corge: 2 })
      expect(spy.mock.calls[3][0]).toMatch(
        /Unexpected key "corge".*reducer.*instead: "foo", "baz"/
      )

      reducer({ fred: 2, grault: 4 })
      expect(spy.mock.calls[4][0]).toMatch(
        /Unexpected keys "fred", "grault".*reducer.*instead: "foo", "baz"/
      )

      reducer(1)
      expect(spy.mock.calls[5][0]).toMatch(
        /reducer has unexpected type of "Number".*keys: "foo", "baz"/
      )

      spy.mockClear()
      console.error = preSpy
    })

    it('only warns for unexpected keys once', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      const foo = (state = { foo: 1 }) => state
      const bar = (state = { bar: 2 }) => state

      expect(spy.mock.calls.length).toBe(0)

      const reducer = combineReducers({ foo, bar })
      const state = { foo: 1, bar: 2, qux: 3 }

      reducer(state, {})
      reducer(state, {})
      reducer(state, {})
      reducer(state, {})
      expect(spy.mock.calls.length).toBe(1)

      reducer({ ...state, baz: 5 }, {})
      reducer({ ...state, baz: 5 }, {})
      reducer({ ...state, baz: 5 }, {})
      reducer({ ...state, baz: 5 }, {})
      expect(spy.mock.calls.length).toBe(2)

      spy.mockClear()
      console.error = preSpy
    })

    describe('With Replace Reducers', function() {
      const foo = (state = {}) => state
      const bar = (state = {}) => state
      const ACTION = { type: 'ACTION' }

      it('should return an updated state when additional reducers are passed to combineReducers', function() {
        const originalCompositeReducer = combineReducers({ foo })
        const store = createStore(originalCompositeReducer)

        store.dispatch(ACTION)

        const initialState = store.getState()

        store.replaceReducer(combineReducers({ foo, bar }))
        store.dispatch(ACTION)

        const nextState = store.getState()
        expect(nextState).not.toBe(initialState)
      })

      it('should return an updated state when reducers passed to combineReducers are changed', function() {
        const baz = (state = {}) => state

        const originalCompositeReducer = combineReducers({ foo, bar })
        const store = createStore(originalCompositeReducer)

        store.dispatch(ACTION)

        const initialState = store.getState()

        store.replaceReducer(combineReducers({ baz, bar }))
        store.dispatch(ACTION)

        const nextState = store.getState()
        expect(nextState).not.toBe(initialState)
      })

      it('should return the same state when reducers passed to combineReducers not changed', function() {
        const originalCompositeReducer = combineReducers({ foo, bar })
        const store = createStore(originalCompositeReducer)

        store.dispatch(ACTION)

        const initialState = store.getState()

        store.replaceReducer(combineReducers({ foo, bar }))
        store.dispatch(ACTION)

        const nextState = store.getState()
        expect(nextState).toBe(initialState)
      })

      it('should return an updated state when one of more reducers passed to the combineReducers are removed', function() {
        const originalCompositeReducer = combineReducers({ foo, bar })
        const store = createStore(originalCompositeReducer)

        store.dispatch(ACTION)

        const initialState = store.getState()

        store.replaceReducer(combineReducers({ bar }))

        const nextState = store.getState()
        expect(nextState).not.toBe(initialState)
      })
    })
  })
})
