import type { Action as ReduxAction } from 'redux'

describe('type tests', () => {
  test('FSA', () => {
    interface Action<P> extends ReduxAction {
      payload: P
    }

    const action: Action<string> = {
      type: 'ACTION_TYPE',
      payload: 'test'
    }

    expectTypeOf(action.payload).toBeString()
  })

  test('FreeShapeAction', () => {
    interface Action extends ReduxAction {
      [key: string]: any
    }

    const action: Action = {
      type: 'ACTION_TYPE',
      text: 'test'
    }

    expectTypeOf(action.text).toBeAny()
  })

  test('StringLiteralTypeAction', () => {
    type ActionType = 'A' | 'B' | 'C'

    interface Action extends ReduxAction {
      type: ActionType
    }

    const action: Action = {
      type: 'A'
    }

    expectTypeOf(action.type).toEqualTypeOf<ActionType>()
  })
})
