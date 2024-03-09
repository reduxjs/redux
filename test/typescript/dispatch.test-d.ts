import type { Dispatch } from 'redux'

describe('type tests', () => {
  test('default Dispatch type accepts any object with `type` property.', () => {
    const dispatch: Dispatch = null as any

    const a = dispatch({ type: 'INCREMENT', count: 10 })

    expectTypeOf(a).toHaveProperty('count')

    expectTypeOf(a).not.toHaveProperty('wrongProp')

    expectTypeOf(dispatch).parameter(0).not.toMatchTypeOf('not-an-action')
  })

  test('Dispatch accepts type argument that restricts allowed action types.', () => {
    interface IncrementAction {
      type: 'INCREMENT'
      count?: number
    }

    interface DecrementAction {
      type: 'DECREMENT'
      count?: number
    }

    // Union of all actions in the app.
    type MyAction = IncrementAction | DecrementAction

    const dispatch: Dispatch<MyAction> = null as any

    expectTypeOf(dispatch).parameter(0).toMatchTypeOf({ type: 'INCREMENT' })

    expectTypeOf(dispatch).toBeCallableWith({ type: 'DECREMENT', count: 10 })

    // Known actions are strictly checked.
    expectTypeOf(dispatch)
      .parameter(0)
      .not.toMatchTypeOf({ type: 'DECREMENT', count: '' })

    // Unknown actions are rejected.
    expectTypeOf(dispatch)
      .parameter(0)
      .not.toEqualTypeOf({ type: 'SOME_OTHER_TYPE' })
  })
})
