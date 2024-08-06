import type {
  Action,
  Observer,
  Reducer,
  Store,
  StoreEnhancer,
  Unsubscribe
} from 'redux'
import { combineReducers, createStore } from 'redux'

describe('type tests', () => {
  type BrandedString = string & { _brand: 'type' }

  const brandedString = 'a string' as BrandedString

  type State = {
    a: 'a'
    b: {
      c: 'c'
      d: 'd'
    }
    e: BrandedString
  }

  interface DerivedAction extends Action {
    type: 'a'
    b: 'b'
  }

  const reducer: Reducer<State> = (
    state: State | undefined = {
      a: 'a',
      b: {
        c: 'c',
        d: 'd'
      },
      e: brandedString
    },
    action: Action
  ): State => {
    return state
  }

  const reducerWithAction: Reducer<State, DerivedAction> = (
    state: State | undefined = {
      a: 'a',
      b: {
        c: 'c',
        d: 'd'
      },
      e: brandedString
    },
    action: DerivedAction
  ): State => {
    return state
  }

  const funcWithStore = (store: Store<State, DerivedAction>) => {}

  test('createStore', () => {
    const store: Store<State> = createStore(reducer)

    // test that nullable state is preserved
    const nullableStore = createStore((): string | null => null)

    expectTypeOf(nullableStore.getState()).toEqualTypeOf<string | null>()

    // ensure that an array-based state works
    const arrayReducer = (state: any[] = []) => state || []

    expectTypeOf(createStore(arrayReducer)).toMatchTypeOf<Store<any[]>>()

    expectTypeOf(
      createStore(reducer, { a: 'a', b: { c: 'c', d: 'd' }, e: brandedString })
    ).toEqualTypeOf<Store<State>>()

    // @ts-expect-error
    createStore(reducer, { b: { c: 'c' }, e: brandedString })

    const reducerA: Reducer<string> = (state = 'a') => state

    const reducerB: Reducer<{ c: string; d: string }> = (
      state = { c: 'c', d: 'd' }
    ) => state

    const reducerE: Reducer<BrandedString> = (state = brandedString) => state

    const combinedReducer = combineReducers({
      a: reducerA,
      b: reducerB,
      e: reducerE
    })

    const storeWithCombineReducer = createStore(combinedReducer, {
      b: { c: 'c', d: 'd' },
      e: brandedString
    })

    const storeWithCombineReducerAndBadPreloadedState =
      // @ts-expect-error
      // prettier-ignore
      createStore( combinedReducer, { b: { c: 'c' }, e: brandedString  }  )

    const nestedCombinedReducer = combineReducers({
      a: (state: string = 'a') => state,
      b: combineReducers({
        c: (state: string = 'c') => state,
        d: (state: string = 'd') => state
      }),
      e: (state: BrandedString = brandedString) => state
    })

    // @ts-expect-error
    const storeWithNestedCombineReducer = createStore(nestedCombinedReducer, {
      b: { c: 5 },
      e: brandedString
    })

    const simpleCombinedReducer = combineReducers({
      c: (state: string = 'c') => state,
      d: (state: string = 'd') => state
    })

    const storeWithSimpleCombinedReducer =
      // @ts-expect-error
      // prettier-ignore
      createStore(simpleCombinedReducer, { c: 5 })

    // Note: It's not necessary that the errors occur on the lines specified, just as long as something errors somewhere
    // since the preloaded state doesn't match the reducer type.

    const simpleCombinedReducerWithImplicitState = combineReducers({
      c: (state = 'c') => state,
      d: (state = 'd') => state
    })

    const storeWithSimpleCombinedReducerWithImplicitState =
      // @ts-expect-error
      // prettier-ignore
      createStore( simpleCombinedReducerWithImplicitState,  { c: 5 } )

    const storeWithActionReducer = createStore(reducerWithAction)

    const storeWithActionReducerAndPreloadedState = createStore(
      reducerWithAction,
      {
        a: 'a',
        b: { c: 'c', d: 'd' },
        e: brandedString
      }
    )

    expectTypeOf(funcWithStore).toBeCallableWith(storeWithActionReducer)

    expectTypeOf(funcWithStore).toBeCallableWith(
      storeWithActionReducerAndPreloadedState
    )

    const storeWithActionReducerAndBadPreloadedState =
      // @ts-expect-error
      // prettier-ignore
      createStore( reducerWithAction,  {   b: { c: 'c' },  e: brandedString  } )

    const enhancer: StoreEnhancer = next => next

    const storeWithSpecificEnhancer: Store<State> = createStore(
      reducer,
      enhancer
    )

    const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(
      reducer,
      {
        a: 'a',
        b: { c: 'c', d: 'd' },
        e: brandedString
      },
      enhancer
    )

    const storeWithBadPreloadedStateAndEnhancer: Store<State> = createStore(
      reducer,
      {
        // @ts-expect-error
        b: { c: 'c' }
      },
      enhancer
    )

    /* dispatch */

    store.dispatch({
      type: 'ADD_TODO',
      text: 'test'
    })

    /* getState */

    expectTypeOf(store.getState()).toEqualTypeOf<State>()

    /* subscribe / unsubscribe */

    const unsubscribe: Unsubscribe = store.subscribe(() => {
      console.log('Current state:', store.getState())
    })

    expectTypeOf(unsubscribe).toBeCallableWith()

    /* replaceReducer */

    const newReducer: Reducer<State> = reducer

    expectTypeOf(store.replaceReducer).toBeCallableWith(newReducer)

    /* observable */

    let observable = store[Symbol.observable]()

    observable = observable[Symbol.observable]()

    const observer: Observer<State> = {
      next(state: State) {
        console.log('current state:', state)
      }
    }

    const unsubscribeFromObservable = observable.subscribe(observer).unsubscribe

    expectTypeOf(unsubscribeFromObservable).toBeCallableWith()
  })
})
