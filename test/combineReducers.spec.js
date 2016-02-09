import expect from 'expect'
import { combineReducers } from '../src'
import createStore, { ActionTypes } from '../src/createStore'

describe('Utils', () => {
  describe('combineReducers', () => {
    it('returns a composite reducer that maps the state keys to given reducers', () => {
      const reducer = combineReducers({
        counter: (state = 0, action) =>
        action.type === 'increment' ? state + 1 : state,
        stack: (state = [], action) =>
        action.type === 'push' ? [ ...state, action.value ] : state
      })

      const s1 = reducer({}, { type: 'increment' })
      expect(s1).toEqual({ counter: 1, stack: [] })
      const s2 = reducer(s1, { type: 'push', value: 'a' })
      expect(s2).toEqual({ counter: 1, stack: [ 'a' ] })
    })

    it('ignores all props which are not a function', () => {
      const reducer = combineReducers({
        fake: true,
        broken: 'string',
        another: { nested: 'object' },
        stack: (state = []) => state
      })

      expect(
        Object.keys(reducer({ }, { type: 'push' }))
      ).toEqual([ 'stack' ])
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

      expect(
        () => reducer({ counter: 0 }, { type: 'whatever' })
      ).toThrow(
      /"whatever".*"counter"/
      )
      expect(
        () => reducer({ counter: 0 }, null)
      ).toThrow(
      /"counter".*an action/
      )
      expect(
        () => reducer({ counter: 0 }, { })
      ).toThrow(
      /"counter".*an action/
      )
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
      expect(() => reducer({ })).toThrow(
        /"counter".*initialization/
      )
    })

    it('catches error thrown in reducer when initializing and re-throw', () => {
      const reducer = combineReducers({
        throwingReducer() {
          throw new Error('Error thrown in reducer')
        }
      })
      expect(() => reducer({ })).toThrow(
        /Error thrown in reducer/
      )
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
        child1(state = { }) {
          return state
        },
        child2(state = { }) {
          return state
        },
        child3(state = { }) {
          return state
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      expect(reducer(initialState, { type: 'FOO' })).toBe(initialState)
    })

    it('does not have referential equality if one of the reducers changes something', () => {
      const reducer = combineReducers({
        child1(state = { }) {
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
        child3(state = { }) {
          return state
        }
      })

      const initialState = reducer(undefined, '@@INIT')
      expect(reducer(initialState, { type: 'increment' })).toNotBe(initialState)
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
      expect(() => reducer()).toThrow(
        /"counter".*private/
      )
    })

    it('warns if no reducers are passed to combineReducers', () => {
      const spy = expect.spyOn(console, 'error')
      const reducer = combineReducers({ })
      reducer({ })
      expect(spy.calls[0].arguments[0]).toMatch(
        /Store does not have a valid reducer/
      )
      spy.restore()
    })

    it('warns if input state does not match reducer shape', () => {
      const spy = expect.spyOn(console, 'error')
      const reducer = combineReducers({
        foo(state = { bar: 1 }) {
          return state
        },
        baz(state = { qux: 3 }) {
          return state
        }
      })

      reducer()
      expect(spy.calls.length).toBe(0)

      reducer({ foo: { bar: 2 } })
      expect(spy.calls.length).toBe(0)

      reducer({
        foo: { bar: 2 },
        baz: { qux: 4 }
      })
      expect(spy.calls.length).toBe(0)

      createStore(reducer, { bar: 2 })
      expect(spy.calls[0].arguments[0]).toMatch(
        /Unexpected key "bar".*createStore.*instead: "foo", "baz"/
      )

      createStore(reducer, { bar: 2, qux: 4 })
      expect(spy.calls[1].arguments[0]).toMatch(
        /Unexpected keys "bar", "qux".*createStore.*instead: "foo", "baz"/
      )

      createStore(reducer, 1)
      expect(spy.calls[2].arguments[0]).toMatch(
        /createStore has unexpected type of "Number".*keys: "foo", "baz"/
      )

      reducer({ bar: 2 })
      expect(spy.calls[3].arguments[0]).toMatch(
        /Unexpected key "bar".*reducer.*instead: "foo", "baz"/
      )

      reducer({ bar: 2, qux: 4 })
      expect(spy.calls[4].arguments[0]).toMatch(
        /Unexpected keys "bar", "qux".*reducer.*instead: "foo", "baz"/
      )

      reducer(1)
      expect(spy.calls[5].arguments[0]).toMatch(
        /reducer has unexpected type of "Number".*keys: "foo", "baz"/
      )

      spy.restore()
    })
  })
})
