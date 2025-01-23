import type {
  Action,
  AnyAction,
  PreloadedStateShapeFromReducersMapObject,
  Reducer,
  ReducersMapObject
} from 'redux'
import { combineReducers } from 'redux'

describe('type tests', () => {
  test('AnyAction type is used to allow action property access without requiring type casting.', () => {
    // Simple reducer definition with no action shape checks.
    // Uses string comparison to determine action type.

    type State = number

    const reducer: Reducer<State> = (state = 0, action) => {
      if (action.type === 'INCREMENT') {
        const { count = 1 } = action
        if (typeof count === 'number') {
          return state + count
        }
      }

      if (action.type === 'DECREMENT') {
        const { count = 1 } = action
        if (typeof count === 'number') {
          return state + count
        }
      }

      return state
    }

    // Reducer function accepts any object with `type` prop as action.
    // Any extra props are allowed too.
    const s: State = reducer(undefined, { type: 'init' })

    expectTypeOf(reducer(s, { type: 'INCREMENT' })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'INCREMENT', count: 10 })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'DECREMENT' })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'DECREMENT', count: 10 })).toEqualTypeOf(s)

    expectTypeOf(
      reducer(s, { type: 'SOME_OTHER_TYPE', someField: 'value' })
    ).toEqualTypeOf(s)

    // State shape is strictly checked.
    expectTypeOf(reducer).parameters.not.toMatchTypeOf([
      'string',
      { type: 'INCREMENT' }
    ])

    // Combined reducer also accepts any action.
    const combined = combineReducers({ sub: reducer })

    const cs: { sub: State } = combined(undefined, { type: 'init' })

    expectTypeOf(combined(cs, { type: 'INCREMENT', count: 10 })).toEqualTypeOf(
      cs
    )

    // Combined reducer's state is strictly checked.
    expectTypeOf(combined).parameters.not.toMatchTypeOf([
      { unknown: '' },
      { type: 'INCREMENT' }
    ])
  })

  test('reducer definition using discriminated unions.', () => {
    //  See https://basarat.gitbooks.io/typescript/content/docs/types/discriminated-unions.html#redux

    type State = number

    interface IncrementAction {
      type: 'INCREMENT'
      count?: number
    }

    interface DecrementAction {
      type: 'DECREMENT'
      count?: number
    }

    interface MultiplyAction {
      type: 'MULTIPLY'
      count?: number
    }

    interface DivideAction {
      type: 'DIVIDE'
      count?: number
    }

    // Union of all actions in the app.
    type MyAction0 = IncrementAction | DecrementAction

    type MyAction1 = MultiplyAction | DivideAction

    const reducer0: Reducer<State, MyAction0> = (state = 0, action) => {
      if (action.type === 'INCREMENT') {
        // Action shape is determined by `type` discriminator.
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state + count
      }

      if (action.type === 'DECREMENT') {
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state - count
      }

      return state
    }

    const reducer1: Reducer<State, MyAction1> = (state = 0, action) => {
      if (action.type === 'MULTIPLY') {
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state * count
      }

      if (action.type === 'DIVIDE') {
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state / count
      }

      return state
    }

    // Reducer state is initialized by Redux using Init action which is private.
    // To initialize manually (e.g. in tests) we have to type cast init action
    // or add a custom init action to MyAction union.
    const s: State = reducer0(undefined, { type: 'init' } as any)

    expectTypeOf(reducer0(s, { type: 'INCREMENT' })).toEqualTypeOf(s)

    expectTypeOf(reducer0(s, { type: 'INCREMENT', count: 10 })).toEqualTypeOf(s)

    // Known actions are strictly checked.
    expectTypeOf(reducer0).parameters.not.toMatchTypeOf([
      s,
      { type: 'DECREMENT', coun: 10 }
    ])

    // Unknown actions are rejected.
    expectTypeOf(reducer0).parameters.not.toMatchTypeOf([
      s,
      { type: 'SOME_OTHER_TYPE' }
    ])

    expectTypeOf(reducer0).parameters.not.toMatchTypeOf<
      [typeof s, { type: 'SOME_OTHER_TYPE'; someField: 'value' }]
    >()

    // Combined reducer infers state and actions by default which maintains type
    // safety and still allows inclusion of third-party reducers without the need
    // to explicitly add their state and actions to the union.
    const combined = combineReducers({ sub0: reducer0, sub1: reducer1 })

    const cs = combined(undefined, { type: 'INCREMENT' })

    expectTypeOf(combined).toBeCallableWith(cs, { type: 'MULTIPLY' })

    expectTypeOf(combined).parameters.not.toMatchTypeOf<
      [typeof cs, { type: 'init' }]
    >()

    expectTypeOf(combined).parameters.not.toMatchTypeOf<
      [typeof cs, { type: 'SOME_OTHER_TYPE' }]
    >()

    // Combined reducer can be made to only accept known actions.
    const strictCombined = combineReducers({
      sub: reducer0
    })

    const scs = strictCombined(undefined, { type: 'INCREMENT' })

    expectTypeOf(strictCombined).toBeCallableWith(scs, { type: 'DECREMENT' })

    expectTypeOf(strictCombined).parameters.not.toMatchTypeOf<
      [typeof scs, { type: 'SOME_OTHER_TYPE' }]
    >()
  })

  test('reducer definition using type guards.', () => {
    function isAction<A extends Action>(
      action: Action,
      type: any
    ): action is A {
      return action.type === type
    }

    type State = number

    interface IncrementAction {
      type: 'INCREMENT'
      count?: number
    }

    interface DecrementAction {
      type: 'DECREMENT'
      count?: number
    }

    const reducer: Reducer<State, AnyAction> = (state = 0, action) => {
      if (isAction<IncrementAction>(action, 'INCREMENT')) {
        // TODO: this doesn't seem to work correctly with UnknownAction - `action` becomes `UnknownAction & IncrementAction`
        // Action shape is determined by the type guard returned from `isAction`
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state + count
      }

      if (isAction<DecrementAction>(action, 'DECREMENT')) {
        expectTypeOf(action).not.toHaveProperty('wrongField')

        const { count = 1 } = action

        return state - count
      }

      return state
    }

    const s: State = reducer(undefined, { type: 'init' })

    expectTypeOf(reducer(s, { type: 'INCREMENT' })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'INCREMENT', count: 10 })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'DECREMENT' })).toEqualTypeOf(s)

    expectTypeOf(reducer(s, { type: 'DECREMENT', count: 10 })).toEqualTypeOf(s)

    expectTypeOf(
      reducer(s, { type: 'SOME_OTHER_TYPE', someField: 'value' })
    ).toEqualTypeOf(s)

    const combined = combineReducers({ sub: reducer })

    const cs: { sub: State } = combined(undefined, { type: 'init' })

    expectTypeOf(combined(cs, { type: 'INCREMENT' })).toEqualTypeOf(cs)
  })

  test('ReducersMapObject with default type args.', () => {
    const obj: ReducersMapObject = {}

    for (const key of Object.keys(obj)) {
      expectTypeOf(obj[key]).toBeCallableWith(undefined, { type: 'SOME_TYPE' })

      expectTypeOf(obj[key]).parameters.not.toMatchTypeOf<
        [undefined, 'not-an-action']
      >()
    }
  })

  test('`PreloadedStateShapeFromReducersMapObject` has correct type when given a custom action', () => {
    type MyAction = { type: 'foo' }

    // TODO: not sure how to write this test??
    // Expect this to match type `{ nested: string | undefined; }`
    type P = PreloadedStateShapeFromReducersMapObject<{
      nested: Reducer<string, MyAction>
    }>
  })

  test('`combineReducer` has correct return type when given a custom action', () => {
    type MyAction = { type: 'foo' }

    type State = string
    const nested: Reducer<State, MyAction> = (state = 'foo') => state

    type Combined = { nested: State }

    // Expect no error
    const combined: Reducer<
      Combined,
      MyAction,
      Partial<Combined>
    > = combineReducers({ nested })
  })
})
