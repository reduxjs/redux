import expect from 'expect'
import warning from '../../src/utils/warning'

describe('Utils', () => {
  describe('warning', () => {
    it('calls console.error when available', () => {
      const spy = expect.spyOn(console, 'error')
      try {
        warning('Test')
        expect(spy.calls[0].arguments[0]).toBe('Test')
      } finally {
        spy.restore()
      }
    })

    it('does not throw when console.error is not available', () => {
      const realConsole = global.console
      Object.defineProperty(global, 'console', { value: {} })
      try {
        expect(() => warning('Test')).toNotThrow()
      } finally {
        Object.defineProperty(global, 'console', { value: realConsole })
      }
    })

    it('does not throw when console is not available', () => {
      const realConsole = global.console
      Object.defineProperty(global, 'console', { value: undefined })
      try {
        expect(() => warning('Test')).toNotThrow()
      } finally {
        Object.defineProperty(global, 'console', { value: realConsole })
      }
    })
  })
})
