import expect from 'expect'
import pick from '@f/pick'

describe('pick', () => {
  it('returns object with picked values', () => {
    const test = {
      name: 'lily',
      age: 20
    }
    expect(
      pick(x => typeof x === 'string', test)
    ).toEqual({
      name: 'lily'
    })
  })
})
