import {
  StoreEnhancer,
  Action,
  AnyAction,
  Reducer,
  createStore,
  PreloadedState
} from 'redux'

interface State {
  someField: 'string'
}
const reducer: Reducer<State> = null as any

/**
 * Store enhancer that extends the type of dispatch.
 */
function dispatchExtension() {
  type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>

  const enhancer: StoreEnhancer<{ dispatch: PromiseDispatch }> = null as any

  const store = createStore(reducer, enhancer)

  store.dispatch({ type: 'INCREMENT' })
  store.dispatch(Promise.resolve({ type: 'INCREMENT' }))
  // typings:expect-error
  store.dispatch('not-an-action')
  // typings:expect-error
  store.dispatch(Promise.resolve('not-an-action'))
}

/**
 * Store enhancer that extends the type of the state.
 */
function stateExtension() {
  interface ExtraState {
    extraField: 'extra'
  }

  const enhancer: StoreEnhancer<{}, ExtraState> = createStore => <
    S,
    A extends Action = AnyAction
  >(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>
  ) => {
    const wrappedReducer: Reducer<S & ExtraState, A> = null as any
    const wrappedPreloadedState: PreloadedState<S & ExtraState> = null as any
    return createStore(wrappedReducer, wrappedPreloadedState)
  }

  const store = createStore(reducer, enhancer)

  store.getState().someField
  store.getState().extraField
  // typings:expect-error
  store.getState().wrongField
}

/**
 * Store enhancer that adds methods to the store.
 */
function extraMethods() {
  const enhancer: StoreEnhancer<{ method(): string }> = null as any

  const store = createStore(reducer, enhancer)

  store.getState()
  const res: string = store.method()
  // typings:expect-error
  store.wrongMethod()
}

/**
 * replaceReducer with a store enhancer
 */
function replaceReducerExtender() {
  interface ExtraState {
    extraField: 'extra'
  }

  const enhancer: StoreEnhancer<
    { method(): string },
    ExtraState
  > = createStore => <S, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    preloadedState?: PreloadedState<S>
  ) => {
    const wrappedReducer: Reducer<S & ExtraState, A> = null as any
    const wrappedPreloadedState: PreloadedState<S & ExtraState> = null as any
    return createStore(wrappedReducer, wrappedPreloadedState)
  }

  const store = createStore(reducer, enhancer)

  const newReducer = (
    state: { test: boolean } = { test: true },
    _: AnyAction
  ) => state

  const newStore = store.replaceReducer(newReducer)
  newStore.getState().test
  store.getState().extraField
  // typings:expect-error
  store.getState().wrongField

  const res: string = store.method()
  // typings:expect-error
  store.wrongMethod()
}

function mhelmersonExample() {
  interface State {
    someField: 'string'
  }

  interface ExtraState {
    extraField: 'extra'
  }

  const reducer: Reducer<State> = null as any

  function stateExtensionExpectedToWork() {
    interface ExtraState {
      extraField: 'extra'
    }

    const enhancer: StoreEnhancer<{}, ExtraState> = createStore => <
      S,
      A extends Action = AnyAction
    >(
      reducer: Reducer<S, A>,
      preloadedState?: PreloadedState<S>
    ) => {
      const wrappedReducer: Reducer<S & ExtraState, A> = null as any
      const wrappedPreloadedState: PreloadedState<S & ExtraState> = null as any
      const store = createStore(wrappedReducer, wrappedPreloadedState)
      return {
        ...store,
        replaceReducer: (nextReducer: Reducer<S, A>) => {
          const nextWrappedReducer: Reducer<S & ExtraState, A> = null as any
          return store.replaceReducer(nextWrappedReducer)
        }
      } as Store<S & ExtraState, A, ExtraState>
    }

    const store = createStore(reducer, enhancer)
    store.replaceReducer(reducer)
  }
}
