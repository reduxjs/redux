import { Reducer, Action, combineReducers, ReducersMapObject } from 'redux'

/**
 * Simple reducer definition with no action shape checks.
 * Uses string comparison to determine action type.
 *
 * `AnyAction` type is used to allow action property access without requiring
 * type casting.
 */
function simple() {
  type State = number

  const reducer: Reducer<State> = (state = 0, action) => {
    if (action.type === 'INCREMENT') {
      const { count = 1 } = action

      return state + count
    }

    if (action.type === 'DECREMENT') {
      const { count = 1 } = action

      return state - count
    }

    return state
  }

  // Reducer function accepts any object with `type` prop as action.
  // Any extra props are allowed too.
  let s: State = reducer(undefined, { type: 'init' })
  s = reducer(s, { type: 'INCREMENT' })
  s = reducer(s, { type: 'INCREMENT', count: 10 })
  s = reducer(s, { type: 'DECREMENT' })
  s = reducer(s, { type: 'DECREMENT', count: 10 })
  s = reducer(s, { type: 'SOME_OTHER_TYPE', someField: 'value' })

  // State shape is strictly checked.
  // typings:expect-error
  reducer('string', { type: 'INCREMENT' })

  // Combined reducer also accepts any action.
  const combined = combineReducers({ sub: reducer })

  let cs: { sub: State } = combined(undefined, { type: 'init' })
  cs = combined(cs, { type: 'INCREMENT', count: 10 })

  // Combined reducer's state is strictly checked.
  // typings:expect-error
  combined({ unknown: '' }, { type: 'INCREMENT' })
}

/**
 * Reducer definition using discriminated unions.
 *
 * See https://basarat.gitbooks.io/typescript/content/docs/types/discriminated-unions.html#redux
 */
function discriminated() {
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
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state + count
    }

    if (action.type === 'DECREMENT') {
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state - count
    }

    return state
  }

  const reducer1: Reducer<State, MyAction1> = (state = 0, action) => {
    if (action.type === 'MULTIPLY') {
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state * count
    }

    if (action.type === 'DIVIDE') {
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state / count
    }

    return state
  }

  // Reducer state is initialized by Redux using Init action which is private.
  // To initialize manually (e.g. in tests) we have to type cast init action
  // or add a custom init action to MyAction union.
  let s: State = reducer0(undefined, { type: 'init' } as any)
  s = reducer0(s, { type: 'INCREMENT' })
  s = reducer0(s, { type: 'INCREMENT', count: 10 })
  // Known actions are strictly checked.
  // typings:expect-error
  s = reducer0(s, { type: 'DECREMENT', coun: 10 })
  s = reducer0(s, { type: 'DECREMENT', count: 10 })
  // Unknown actions are rejected.
  // typings:expect-error
  s = reducer0(s, { type: 'SOME_OTHER_TYPE' })
  // typings:expect-error
  s = reducer0(s, { type: 'SOME_OTHER_TYPE', someField: 'value' })

  // Combined reducer infers state and actions by default which maintains type
  // safety and still allows inclusion of third-party reducers without the need
  // to explicitly add their state and actions to the union.
  const combined = combineReducers({ sub0: reducer0, sub1: reducer1 })

  const cs = combined(undefined, { type: 'INCREMENT' })
  combined(cs, { type: 'MULTIPLY' })
  // typings:expect-error
  combined(cs, { type: 'init' })
  // typings:expect-error
  combined(cs, { type: 'SOME_OTHER_TYPE' })

  // Combined reducer can be made to only accept known actions.
  const strictCombined = combineReducers<{ sub: State }, MyAction0>({
    sub: reducer0
  })

  const scs = strictCombined(undefined, { type: 'INCREMENT' })
  strictCombined(scs, { type: 'DECREMENT' })
  // typings:expect-error
  strictCombined(scs, { type: 'SOME_OTHER_TYPE' })
}

/**
 * Reducer definition using type guards.
 */
function typeGuards() {
  function isAction<A extends Action>(action: Action, type: any): action is A {
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

  const reducer: Reducer<State> = (state = 0, action) => {
    if (isAction<IncrementAction>(action, 'INCREMENT')) {
      // Action shape is determined by the type guard returned from `isAction`
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state + count
    }

    if (isAction<DecrementAction>(action, 'DECREMENT')) {
      // typings:expect-error
      action.wrongField

      const { count = 1 } = action

      return state - count
    }

    return state
  }

  let s: State = reducer(undefined, { type: 'init' })
  s = reducer(s, { type: 'INCREMENT' })
  s = reducer(s, { type: 'INCREMENT', count: 10 })
  s = reducer(s, { type: 'DECREMENT' })
  s = reducer(s, { type: 'DECREMENT', count: 10 })
  s = reducer(s, { type: 'SOME_OTHER_TYPE', someField: 'value' })

  const combined = combineReducers({ sub: reducer })

  let cs: { sub: State } = combined(undefined, { type: 'init' })
  cs = combined(cs, { type: 'INCREMENT', count: 10 })
}

/**
 * Test ReducersMapObject with default type args.
 */
function reducersMapObject() {
  const obj: ReducersMapObject = {}

  for (const key of Object.keys(obj)) {
    obj[key](undefined, { type: 'SOME_TYPE' })
    // typings:expect-error
    obj[key](undefined, 'not-an-action')
  }
}
