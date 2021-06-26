import { isPlainObject } from '@reduxjs/toolkit'
import vm from 'vm'

describe('isPlainObject', () => {
  it('returns true only if plain object', () => {
    class Test {
      prop: number
      constructor() {
        this.prop = 1
      }
    }

    const sandbox = { fromAnotherRealm: false }
    vm.runInNewContext('fromAnotherRealm = {}', sandbox)

    expect(isPlainObject(sandbox.fromAnotherRealm)).toBe(true)
    expect(isPlainObject(new Test())).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
    expect(isPlainObject([1, 2, 3])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject({ x: 1, y: 2 })).toBe(true)
  })
})
