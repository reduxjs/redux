import expect, { createSpy } from 'expect'
import { composeReducers } from '../src'

describe('Utils', () => {
  describe('composeReducers', () => {
    it('should run each reducer passing previous state and a common action', () => {
      const action = { a: 'action' }
      const state1 = { b: 'state1' }
      const state2 = { c: 'state2' }
      const state3 = { d: 'state3' }
      const state4 = { e: 'state4' }
      const func1 = createSpy().andReturn(state2)
      const func2 = createSpy().andReturn(state3)
      const func3 = createSpy().andReturn(state4)

      const reducers = composeReducers(func1, func2, func3)

      expect(reducers(state1, action)).toBe(state4)

      expect(func1.calls[0].arguments[0]).toBe(state1)
      expect(func1.calls[0].arguments[1]).toBe(action)
      expect(func2.calls[0].arguments[0]).toBe(state2)
      expect(func2.calls[0].arguments[1]).toBe(action)
      expect(func3.calls[0].arguments[0]).toBe(state3)
      expect(func3.calls[0].arguments[1]).toBe(action)
    })
  })
})
