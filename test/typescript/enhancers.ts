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

  const enhancer: StoreEnhancer<{
    dispatch: PromiseDispatch
  }> = createStore => <S, A extends Action = AnyAction>(
    reducer: Reducer<S, A>,
    preloadedState?: any
  ) => {
    const store = createStore(reducer, preloadedState)
    return {
      ...store,
      dispatch: (action: any) => {
        if (action.type) {
          store.dispatch(action)
        } else if (action.then) {
          action.then(store.dispatch)
        }
        return action
      }
    }
  }

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
    preloadedState?: any
  ) => {
    const wrappedReducer: Reducer<S & ExtraState, A> = (state, action) => {
      const newState = reducer(state, action)
      return {
        ...newState,
        extraField: 'extra'
      }
    }
    const wrappedPreloadedState = preloadedState
      ? {
          ...preloadedState,
          extraField: 'extra'
        }
      : undefined
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
    preloadedState?: any
  ) => {
    const wrappedReducer: Reducer<S & ExtraState, A> = (state, action) => {
      const newState = reducer(state, action)
      return {
        ...newState,
        extraField: 'extra'
      }
    }
    const wrappedPreloadedState = preloadedState
      ? {
          ...preloadedState,
          extraField: 'extra'
        }
      : undefined
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
      preloadedState?: any
    ) => {
      const wrappedReducer: Reducer<S & ExtraState, A> = (state, action) => {
        const newState = reducer(state, action)
        return {
          ...newState,
          extraField: 'extra'
        }
      }
      const wrappedPreloadedState = preloadedState
        ? {
            ...preloadedState,
            extraField: 'extra'
          }
        : undefined
      const store = createStore(wrappedReducer, wrappedPreloadedState)
      return {
        ...store,
        replaceReducer<NS, NA extends Action = AnyAction>(
          nextReducer: (
            state: NS & ExtraState | undefined,
            action: NA
          ) => NS & ExtraState
        ) {
          const nextWrappedReducer: Reducer<NS & ExtraState, NA> = (
            state,
            action
          ) => {
            const newState = nextReducer(state, action)
            return {
              ...newState,
              extraField: 'extra'
            }
          }
          return store.replaceReducer(nextWrappedReducer)
        }
      }
    }

    const store = createStore(reducer, enhancer)
    store.replaceReducer(reducer)
  }
}

function finalHelmersonExample() {
  function persistReducer<S>(config: any, reducer: S): S {
    return reducer
  }

  function persistStore<S>(store: S) {
    return store
  }

  function createPersistEnhancer(persistConfig: any): StoreEnhancer {
    return createStore => <S, A extends Action = AnyAction>(
      reducer: Reducer<S, A>,
      preloadedState?: any
    ) => {
      const persistedReducer = persistReducer(persistConfig, reducer)
      const store = createStore(persistedReducer, preloadedState)
      const persistor = persistStore(store)

      return {
        ...store,
        replaceReducer: nextReducer => {
          return store.replaceReducer(
            persistReducer(persistConfig, nextReducer)
          )
        },
        persistor
      }
    }
  }
}
