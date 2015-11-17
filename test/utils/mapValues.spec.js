import expect from 'expect'
import mapValues from '../../src/utils/mapValues'

describe('mapValues', () => {
  it('returns object with mapped values', () => {
    const test = {
      a: 'c',
      b: 'd'
    }
    expect(mapValues(test, (val, key) => val + key)).toEqual({
      a: 'ca',
      b: 'db'
    })
  })
})

