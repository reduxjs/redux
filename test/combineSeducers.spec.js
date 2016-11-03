/* eslint-disable no-console */
import { combineSeducers } from '../src'
import createStore, { ActionTypes } from '../src/createStore'

describe('Utils', () => {
  describe('combineSeducers', () => {
    it('returns a composite seducer that maps the state keys to given seducers', () => {
      const seducer = combineSeducers({
        counter: (state = 0, action) =>
        action.type === 'increment' ? state + 1 : state,
        stack: (state = [], action) =>
        action.type === 'push' ? [ ...state, action.value ] : state
      })

      const s1 = seducer({}, { type: 'increment' })
      expect(s1).toEqual({ counter: 1, stack: [] })
      const s2 = seducer(s1, { type: 'push', value: 'a' })
      expect(s2).toEqual({ counter: 1, stack: [ 'a' ] })
    })

    it('ignores all props which are not a function', () => {
      const seducer = combineSeducers({
        fake: true,
        broken: 'string',
        another: { nested: 'object' },
        stack: (state = []) => state
      })

      expect(
        Object.keys(seducer({ }, { type: 'push' }))
      ).toEqual([ 'stack' ])
    })

    it('warns if a seducer prop is undefined', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      let isNotDefined
      combineSeducers({ isNotDefined })
      expect(spy.mock.calls[0][0]).toMatch(
        /No seducer provided for key "isNotDefined"/
      )

      spy.mockClear()
      combineSeducers({ thing: undefined })
      expect(spy.mock.calls[0][0]).toMatch(
        /No seducer provided for key "thing"/
      )

      spy.mockClear()
      console.error = preSpy
    })

    it('throws an error if a seducer returns undefined handling an action', () => {
      const seducer = combineSeducers({
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
        () => seducer({ counter: 0 }, { type: 'whatever' })
      ).toThrow(
      /"whatever".*"counter"/
      )
      expect(
        () => seducer({ counter: 0 }, null)
      ).toThrow(
      /"counter".*an action/
      )
      expect(
        () => seducer({ counter: 0 }, { })
      ).toThrow(
      /"counter".*an action/
      )
    })

    it('throws an error on first call if a seducer returns undefined initializing', () => {
      const seducer = combineSeducers({
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
      expect(() => seducer({ })).toThrow(
        /"counter".*initialization/
      )
    })

    it('catches error thrown in seducer when initializing and re-throw', () => {
      const seducer = combineSeducers({
        throwingSeducer() {
          throw new Error('Error thrown in seducer')
        }
      })
      expect(() => seducer({ })).toThrow(
        /Error thrown in seducer/
      )
    })

    it('allows a symbol to be used as an action type', () => {
      const increment = Symbol('INCREMENT')

      const seducer = combineSeducers({
        counter(state = 0, action) {
          switch (action.type) {
            case increment:
              return state + 1
            default:
              return state
          }
        }
      })

      expect(seducer({ counter: 0 }, { type: increment }).counter).toEqual(1)
    })

    it('maintains referential equality if the seducers it is combining do', () => {
      const seducer = combineSeducers({
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

      const initialState = seducer(undefined, '@@INIT')
      expect(seducer(initialState, { type: 'FOO' })).toBe(initialState)
    })

    it('does not have referential equality if one of the seducers changes something', () => {
      const seducer = combineSeducers({
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

      const initialState = seducer(undefined, '@@INIT')
      expect(seducer(initialState, { type: 'increment' })).not.toBe(initialState)
    })

    it('throws an error on first call if a seducer attempts to handle a private action', () => {
      const seducer = combineSeducers({
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
      expect(() => seducer()).toThrow(
        /"counter".*private/
      )
    })

    it('warns if no seducers are passed to combineSeducers', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      const seducer = combineSeducers({ })
      seducer({ })
      expect(spy.mock.calls[0][0]).toMatch(
        /Store does not have a valid seducer/
      )
      spy.mockClear()
      console.error = preSpy
    })

    it('warns if input state does not match seducer shape', () => {
      const preSpy = console.error
      const spy = jest.fn()
      console.error = spy

      const seducer = combineSeducers({
        foo(state = { bar: 1 }) {
          return state
        },
        baz(state = { qux: 3 }) {
          return state
        }
      })

      seducer()
      expect(spy.mock.calls.length).toBe(0)

      seducer({ foo: { bar: 2 } })
      expect(spy.mock.calls.length).toBe(0)

      seducer({
        foo: { bar: 2 },
        baz: { qux: 4 }
      })
      expect(spy.mock.calls.length).toBe(0)

      createStore(seducer, { bar: 2 })
      expect(spy.mock.calls[0][0]).toMatch(
        /Unexpected key "bar".*createStore.*instead: "foo", "baz"/
      )

      createStore(seducer, { bar: 2, qux: 4, thud: 5 })
      expect(spy.mock.calls[1][0]).toMatch(
        /Unexpected keys "qux", "thud".*createStore.*instead: "foo", "baz"/
      )

      createStore(seducer, 1)
      expect(spy.mock.calls[2][0]).toMatch(
        /createStore has unexpected type of "Number".*keys: "foo", "baz"/
      )

      seducer({ corge: 2 })
      expect(spy.mock.calls[3][0]).toMatch(
        /Unexpected key "corge".*seducer.*instead: "foo", "baz"/
      )

      seducer({ fred: 2, grault: 4 })
      expect(spy.mock.calls[4][0]).toMatch(
        /Unexpected keys "fred", "grault".*seducer.*instead: "foo", "baz"/
      )

      seducer(1)
      expect(spy.mock.calls[5][0]).toMatch(
        /seducer has unexpected type of "Number".*keys: "foo", "baz"/
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
      const seducer = combineSeducers({ foo, bar })
      const state = { foo: 1, bar: 2, qux: 3 }
      seducer(state, {})
      seducer(state, {})
      seducer(state, {})
      seducer(state, {})
      expect(spy.mock.calls.length).toBe(1)
      seducer({ ...state, baz: 5 }, {})
      seducer({ ...state, baz: 5 }, {})
      seducer({ ...state, baz: 5 }, {})
      seducer({ ...state, baz: 5 }, {})
      expect(spy.mock.calls.length).toBe(2)

      spy.mockClear()
      console.error = preSpy
    })
  })
})
