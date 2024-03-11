import type { Action, Dispatch } from 'redux'

interface Component<P> {
  props: P
}

interface HOC<T> {
  <P>(wrapped: Component<P & T>): Component<P>
}

declare function connect<T, D extends Dispatch = Dispatch>(
  mapDispatchToProps: (dispatch: D) => T
): HOC<T>

describe('type tests', () => {
  test('inject default dispatch.', () => {
    const hoc: HOC<{ onClick(): void }> = connect(dispatch => {
      return {
        onClick() {
          expectTypeOf(dispatch).toBeCallableWith({ type: 'INCREMENT' })

          expectTypeOf(dispatch)
            .parameter(0)
            .not.toMatchTypeOf(Promise.resolve({ type: 'INCREMENT' }))

          expectTypeOf(dispatch).parameter(0).not.toMatchTypeOf('not-an-action')
        }
      }
    })
  })

  test('inject dispatch that restricts allowed action types.', () => {
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

    const hoc: HOC<{ onClick(): void }> = connect(
      (dispatch: Dispatch<MyAction>) => {
        return {
          onClick() {
            expectTypeOf(dispatch).toBeCallableWith({ type: 'INCREMENT' })

            expectTypeOf(dispatch).toBeCallableWith({
              type: 'DECREMENT',
              count: 10
            })

            expectTypeOf(dispatch)
              .parameter(0)
              .not.toMatchTypeOf({ type: 'DECREMENT', count: '' })

            expectTypeOf(dispatch)
              .parameter(0)
              .not.toEqualTypeOf({ type: 'SOME_OTHER_TYPE' })

            expectTypeOf(dispatch)
              .parameter(0)
              .not.toMatchTypeOf('not-an-action')
          }
        }
      }
    )
  })

  test('inject extended dispatch.', () => {
    type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>

    type MyDispatch = Dispatch & PromiseDispatch

    const hoc: HOC<{ onClick(): void }> = connect((dispatch: MyDispatch) => {
      return {
        onClick() {
          // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
          // do not work in this scenario.
          dispatch({ type: 'INCREMENT' })

          expectTypeOf(dispatch).toBeCallableWith(
            Promise.resolve({ type: 'INCREMENT' })
          )

          expectTypeOf(dispatch).parameter(0).not.toMatchTypeOf('not-an-action')
        }
      }
    })
  })
})
