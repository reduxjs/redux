import expect from 'expect'
import mapValues from '@f/map-obj'

describe('mapValues', () => {
  it('returns object with mapped values', () => {
    const test = {
      a: 'c',
      b: 'd'
    }

    expect(mapValues((val, key) => val + key, test)).toEqual({
      a: 'ca',
      b: 'db'
    })
  })
})

