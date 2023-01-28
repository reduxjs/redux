/* eslint-disable no-lone-blocks */
import type {
  Dispatch,
  AnyAction,
  Middleware,
  Reducer,
  Store,
  Action,
  StoreEnhancer,
} from 'redux'
import { applyMiddleware } from 'redux'
import type { PayloadAction, ConfigureStoreOptions } from '@reduxjs/toolkit'
import {
  configureStore,
  getDefaultMiddleware,
  createSlice,
} from '@reduxjs/toolkit'
import type { ThunkMiddleware, ThunkAction, ThunkDispatch } from 'redux-thunk'
import thunk from 'redux-thunk'
import { expectNotAny, expectType } from './helpers'

const _anyMiddleware: any = () => () => () => {}

/*
 * Test: configureStore() requires a valid reducer or reducer map.
 */
{
  configureStore({
    reducer: (state, action) => 0,
  })

  configureStore({
    reducer: {
      counter1: () => 0,
      counter2: () => 1,
    },
  })

  // @ts-expect-error
  configureStore({ reducer: 'not a reducer' })

  // @ts-expect-error
  configureStore({ reducer: { a: 'not a reducer' } })

  // @ts-expect-error
  configureStore({})
}

/*
 * Test: configureStore() infers the store state type.
 */
{
  const reducer: Reducer<number> = () => 0
  const store = configureStore({ reducer })
  const numberStore: Store<number, AnyAction> = store

  // @ts-expect-error
  const stringStore: Store<string, AnyAction> = store
}

/*
 * Test: configureStore() infers the store action type.
 */
{
  const reducer: Reducer<number, PayloadAction<number>> = () => 0
  const store = configureStore({ reducer })
  const numberStore: Store<number, PayloadAction<number>> = store

  // @ts-expect-error
  const stringStore: Store<number, PayloadAction<string>> = store
}

/*
 * Test: configureStore() accepts middleware array.
 */
{
  const middleware: Middleware = (store) => (next) => next

  configureStore({
    reducer: () => 0,
    middleware: [middleware],
  })

  configureStore({
    reducer: () => 0,
    // @ts-expect-error
    middleware: ['not middleware'],
  })
}

/*
 * Test: configureStore() accepts devTools flag.
 */
{
  configureStore({
    reducer: () => 0,
    devTools: true,
  })

  configureStore({
    reducer: () => 0,
    // @ts-expect-error
    devTools: 'true',
  })
}

/*
 * Test: configureStore() accepts devTools EnhancerOptions.
 */
{
  configureStore({
    reducer: () => 0,
    devTools: { name: 'myApp' },
  })

  configureStore({
    reducer: () => 0,
    // @ts-expect-error
    devTools: { appname: 'myApp' },
  })
}

/*
 * Test: configureStore() accepts preloadedState.
 */
{
  configureStore({
    reducer: () => 0,
    preloadedState: 0,
  })

  configureStore({
    reducer: () => 0,
    // @ts-expect-error
    preloadedState: 'non-matching state type',
  })
}

/*
 * Test: configureStore() accepts store enhancer.
 */
{
  {
    const store = configureStore({
      reducer: () => 0,
      enhancers: [applyMiddleware(() => (next) => next)],
    })

    expectType<Dispatch & ThunkDispatch<number, undefined, AnyAction>>(
      store.dispatch
    )
  }

  configureStore({
    reducer: () => 0,
    // @ts-expect-error
    enhancers: ['not a store enhancer'],
  })

  {
    type SomePropertyStoreEnhancer = StoreEnhancer<{ someProperty: string }>

    const somePropertyStoreEnhancer: SomePropertyStoreEnhancer = (next) => {
      return (reducer, preloadedState) => {
        return {
          ...next(reducer, preloadedState),
          someProperty: 'some value',
        }
      }
    }

    type AnotherPropertyStoreEnhancer = StoreEnhancer<{
      anotherProperty: number
    }>

    const anotherPropertyStoreEnhancer: AnotherPropertyStoreEnhancer = (
      next
    ) => {
      return (reducer, preloadedState) => {
        return {
          ...next(reducer, preloadedState),
          anotherProperty: 123,
        }
      }
    }

    const store = configureStore({
      reducer: () => 0,
      enhancers: [somePropertyStoreEnhancer, anotherPropertyStoreEnhancer],
    })

    expectType<Dispatch & ThunkDispatch<number, undefined, AnyAction>>(
      store.dispatch
    )
    expectType<string>(store.someProperty)
    expectType<number>(store.anotherProperty)
  }
}

/**
 * Test: configureStore() state type inference works when specifying both a
 * reducer object and a partial preloaded state.
 */
{
  let counterReducer1: Reducer<number> = () => 0
  let counterReducer2: Reducer<number> = () => 0

  const store = configureStore({
    reducer: {
      counter1: counterReducer1,
      counter2: counterReducer2,
    },
    preloadedState: {
      counter1: 0,
    },
  })

  const counter1: number = store.getState().counter1
  const counter2: number = store.getState().counter2
}

/**
 * Test: Dispatch typings
 */
{
  type StateA = number
  const reducerA = () => 0
  function thunkA() {
    return (() => {}) as any as ThunkAction<Promise<'A'>, StateA, any, any>
  }

  type StateB = string
  function thunkB() {
    return (dispatch: Dispatch, getState: () => StateB) => {}
  }
  /**
   * Test: by default, dispatching Thunks is possible
   */
  {
    const store = configureStore({
      reducer: reducerA,
    })

    store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())

    const res = store.dispatch((dispatch, getState) => {
      return 42
    })

    const action = store.dispatch({ type: 'foo' })
  }
  /**
   * Test: return type of thunks and actions is inferred correctly
   */
  {
    const slice = createSlice({
      name: 'counter',
      initialState: {
        value: 0,
      },
      reducers: {
        incrementByAmount: (state, action: PayloadAction<number>) => {
          state.value += action.payload
        },
      },
    })

    const store = configureStore({
      reducer: {
        counter: slice.reducer,
      },
    })

    const action = slice.actions.incrementByAmount(2)

    const dispatchResult = store.dispatch(action)
    expectType<{ type: string; payload: number }>(dispatchResult)

    const promiseResult = store.dispatch(async (dispatch) => {
      return 42
    })

    expectType<Promise<number>>(promiseResult)

    const store2 = configureStore({
      reducer: {
        counter: slice.reducer,
      },
      middleware: (gDM) =>
        gDM({
          thunk: {
            extraArgument: 42,
          },
        }),
    })

    const dispatchResult2 = store2.dispatch(action)
    expectType<{ type: string; payload: number }>(dispatchResult2)
  }
  /**
   * Test: removing the Thunk Middleware
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: [],
    })
    // @ts-expect-error
    store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }
  /**
   * Test: adding the thunk middleware by hand
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: [thunk] as [ThunkMiddleware<StateA>],
    })
    store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }
  /**
   * Test: using getDefaultMiddleware
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: getDefaultMiddleware<StateA>(),
    })

    store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }
  /**
   * Test: custom middleware
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: [] as any as [Middleware<(a: StateA) => boolean, StateA>],
    })
    const result: boolean = store.dispatch(5)
    // @ts-expect-error
    const result2: string = store.dispatch(5)
  }
  /**
   * Test: read-only middleware tuple
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: [] as any as readonly [
        Middleware<(a: StateA) => boolean, StateA>
      ],
    })
    const result: boolean = store.dispatch(5)
    // @ts-expect-error
    const result2: string = store.dispatch(5)
  }
  /**
   * Test: multiple custom middleware
   */
  {
    const middleware = [] as any as [
      Middleware<(a: 'a') => 'A', StateA>,
      Middleware<(b: 'b') => 'B', StateA>,
      ThunkMiddleware<StateA>
    ]
    const store = configureStore({
      reducer: reducerA,
      middleware,
    })

    const result: 'A' = store.dispatch('a')
    const result2: 'B' = store.dispatch('b')
    const result3: Promise<'A'> = store.dispatch(thunkA())
  }
  /**
   * Accepts thunk with `unknown`, `undefined` or `null` ThunkAction extraArgument per default
   */
  {
    const store = configureStore({ reducer: {} })
    // undefined is the default value for the ThunkMiddleware extraArgument
    store.dispatch(function () {} as ThunkAction<
      void,
      {},
      undefined,
      AnyAction
    >)
    // `null` for the `extra` generic was previously documented in the RTK "Advanced Tutorial", but
    // is a bad pattern and users should use `unknown` instead
    // @ts-expect-error
    store.dispatch(function () {} as ThunkAction<void, {}, null, AnyAction>)
    // unknown is the best way to type a ThunkAction if you do not care
    // about the value of the extraArgument, as it will always work with every
    // ThunkMiddleware, no matter the actual extraArgument type
    store.dispatch(function () {} as ThunkAction<void, {}, unknown, AnyAction>)
    // @ts-expect-error
    store.dispatch(function () {} as ThunkAction<void, {}, boolean, AnyAction>)
  }

  /**
   * Test: custom middleware and getDefaultMiddleware
   */
  {
    const middleware = getDefaultMiddleware<StateA>().prepend(
      (() => {}) as any as Middleware<(a: 'a') => 'A', StateA>
    )
    const store = configureStore({
      reducer: reducerA,
      middleware,
    })

    const result1: 'A' = store.dispatch('a')
    const result2: Promise<'A'> = store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }

  /**
   * Test: custom middleware and getDefaultMiddleware, using prepend
   */
  {
    const otherMiddleware: Middleware<(a: 'a') => 'A', StateA> = _anyMiddleware
    const concatenated = getDefaultMiddleware<StateA>().prepend(otherMiddleware)

    expectType<
      ReadonlyArray<typeof otherMiddleware | ThunkMiddleware | Middleware<{}>>
    >(concatenated)

    const store = configureStore({
      reducer: reducerA,
      middleware: concatenated,
    })
    const result1: 'A' = store.dispatch('a')
    const result2: Promise<'A'> = store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }

  /**
   * Test: custom middleware and getDefaultMiddleware, using concat
   */
  {
    const otherMiddleware: Middleware<(a: 'a') => 'A', StateA> = _anyMiddleware
    const concatenated = getDefaultMiddleware<StateA>().concat(otherMiddleware)

    expectType<
      ReadonlyArray<typeof otherMiddleware | ThunkMiddleware | Middleware<{}>>
    >(concatenated)

    const store = configureStore({
      reducer: reducerA,
      middleware: concatenated,
    })
    const result1: 'A' = store.dispatch('a')
    const result2: Promise<'A'> = store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }

  /**
   * Test: middlewareBuilder notation, getDefaultMiddleware (unconfigured)
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend((() => {}) as any as Middleware<
          (a: 'a') => 'A',
          StateA
        >),
    })
    const result1: 'A' = store.dispatch('a')
    const result2: Promise<'A'> = store.dispatch(thunkA())
    // @ts-expect-error
    store.dispatch(thunkB())
  }

  /**
   * Test: middlewareBuilder notation, getDefaultMiddleware, concat & prepend
   */
  {
    const otherMiddleware: Middleware<(a: 'a') => 'A', StateA> = _anyMiddleware
    const otherMiddleware2: Middleware<(a: 'b') => 'B', StateA> = _anyMiddleware
    const store = configureStore({
      reducer: reducerA,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
          .concat(otherMiddleware)
          .prepend(otherMiddleware2),
    })
    const result1: 'A' = store.dispatch('a')
    const result2: Promise<'A'> = store.dispatch(thunkA())
    const result3: 'B' = store.dispatch('b')
    // @ts-expect-error
    store.dispatch(thunkB())
  }

  /**
   * Test: middlewareBuilder notation, getDefaultMiddleware (thunk: false)
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false }).prepend(
          (() => {}) as any as Middleware<(a: 'a') => 'A', StateA>
        ),
    })
    const result1: 'A' = store.dispatch('a')
    // @ts-expect-error
    store.dispatch(thunkA())
  }

  /**
   * Test: badly typed middleware won't make `dispatch` `any`
   */
  {
    const store = configureStore({
      reducer: reducerA,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(_anyMiddleware as Middleware<any>),
    })

    expectNotAny(store.dispatch)
  }

  /**
   * Test: decorated `configureStore` won't make `dispatch` `never`
   */
  {
    const someSlice = createSlice({
      name: 'something',
      initialState: null as any,
      reducers: {
        set(state) {
          return state
        },
      },
    })

    function configureMyStore<S>(
      options: Omit<ConfigureStoreOptions<S>, 'reducer'>
    ) {
      return configureStore({
        ...options,
        reducer: someSlice.reducer,
      })
    }

    const store = configureMyStore({})

    expectType<Function>(store.dispatch)
  }

  {
    interface CounterState {
      value: number
    }

    const counterSlice = createSlice({
      name: 'counter',
      initialState: { value: 0 } as CounterState,
      reducers: {
        increment(state) {
          state.value += 1
        },
        decrement(state) {
          state.value -= 1
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        incrementByAmount: (state, action: PayloadAction<number>) => {
          state.value += action.payload
        },
      },
    })

    type Unsubscribe = () => void

    // A fake middleware that tells TS that an unsubscribe callback is being returned for a given action
    // This is the same signature that the "listener" middleware uses
    const dummyMiddleware: Middleware<
      {
        (action: Action<'actionListenerMiddleware/add'>): Unsubscribe
      },
      CounterState
    > = (storeApi) => (next) => (action) => {}

    const store = configureStore({
      reducer: counterSlice.reducer,
      middleware: (gDM) => gDM().prepend(dummyMiddleware),
    })

    // Order matters here! We need the listener type to come first, otherwise
    // the thunk middleware type kicks in and TS thinks a plain action is being returned
    expectType<
      ((action: Action<'actionListenerMiddleware/add'>) => Unsubscribe) &
        ThunkDispatch<CounterState, undefined, AnyAction> &
        Dispatch<AnyAction>
    >(store.dispatch)

    const unsubscribe = store.dispatch({
      type: 'actionListenerMiddleware/add',
    } as const)

    expectType<Unsubscribe>(unsubscribe)
  }
}
