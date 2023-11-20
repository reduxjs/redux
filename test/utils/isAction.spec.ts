import isAction from '@internal/utils/isAction'

describe('isAction', () => {
  it('should only return true for plain objects with a string type property', () => {
    const actionCreator = () => ({ type: 'anAction' })
    class Action {
      type = 'totally an action'
    }
    const testCases: [action: unknown, expected: boolean][] = [
      [{ type: 'an action' }, true],
      [{ type: 'more props', extra: true }, true],
      [{ type: 0 }, false],
      [actionCreator(), true],
      [actionCreator, false],
      [Promise.resolve({ type: 'an action' }), false],
      [new Action(), false],
      ['a string', false]
    ]
    for (const [action, expected] of testCases) {
      expect(isAction(action)).toBe(expected)
    }
  })
})
