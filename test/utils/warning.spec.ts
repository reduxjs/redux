/* eslint-disable no-console */
import { vi } from 'vitest'
import warning from '@internal/utils/warning'

describe('Utils', () => {
  describe('warning', () => {
    it('calls console.error when available', () => {
      const preSpy = console.error
      const spy = vi.fn()
      console.error = spy
      try {
        warning('Test')
        expect(spy.mock.calls[0][0]).toBe('Test')
      } finally {
        spy.mockClear()
        console.error = preSpy
      }
    })

    it('does not throw when console.error is not available', () => {
      const realConsole = global.console
      Object.defineProperty(global, 'console', { value: {} })
      try {
        expect(() => warning('Test')).not.toThrow()
      } finally {
        Object.defineProperty(global, 'console', { value: realConsole })
      }
    })

    it('does not throw when console is not available', () => {
      const realConsole = global.console
      Object.defineProperty(global, 'console', { value: undefined })
      try {
        expect(() => warning('Test')).not.toThrow()
      } finally {
        Object.defineProperty(global, 'console', { value: realConsole })
      }
    })
  })
})
