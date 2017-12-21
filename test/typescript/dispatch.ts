import { Dispatch, AnyAction } from 'redux'

/**
 * Default Dispatch type accepts any object with `type` property.
 */
function simple() {
  const dispatch: Dispatch = null as any

  const a = dispatch({ type: 'INCREMENT', count: 10 })

  a.count
  // typings:expect-error
  a.wrongProp

  // typings:expect-error
  dispatch('not-an-action')
}

/**
 * Dispatch accepts type argument that restricts allowed action types.
 */
function discriminated() {
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

  dispatch({ type: 'INCREMENT' })
  dispatch({ type: 'DECREMENT', count: 10 })
  // Known actions are strictly checked.
  // typings:expect-error
  dispatch({ type: 'DECREMENT', count: '' })
  // Unknown actions are rejected.
  // typings:expect-error
  dispatch({ type: 'SOME_OTHER_TYPE' })
}
