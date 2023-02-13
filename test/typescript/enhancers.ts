import { StoreEnhancer, Action, AnyAction, Reducer, createStore } from 'redux'

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
  }> =
    createStore =>
    <S, A extends Action = AnyAction>(
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
  // @ts-expect-error
  store.dispatch('not-an-action')
  // @ts-expect-error
  store.dispatch(Promise.resolve('not-an-action'))
}

/**
 * Store enhancer that extends the type of the state.
 */
function stateExtension() {
  interface ExtraState {
    extraField: 'extra'
  }

  const enhancer: StoreEnhancer<{}, ExtraState> =
    createStore =>
    <S, A extends Action = AnyAction>(
      reducer: Reducer<S, A>,
      preloadedState?: any
    ) => {
      function wrapReducer(reducer: Reducer<S, A>): Reducer<S & ExtraState, A> {
        return (state, action) => {
          const newState = reducer(state, action)
          return {
            ...newState,
            extraField: 'extra'
          }
        }
      }
      const wrappedPreloadedState = preloadedState
        ? {
            ...preloadedState,
            extraField: 'extra'
          }
        : undefined
      const store = createStore(wrapReducer(reducer), wrappedPreloadedState)
      return {
        ...store,
        replaceReducer(nextReducer: Reducer<S, A>) {
          store.replaceReducer(wrapReducer(nextReducer))
        }
      }
    }

  const store = createStore(reducer, enhancer)

  store.getState().someField
  store.getState().extraField
  // @ts-expect-error
  store.getState().wrongField
}

/**
 * Store enhancer that adds methods to the store.
 */
function extraMethods() {
  const enhancer: StoreEnhancer<{ method(): string }> =
    createStore =>
    (...args) => {
      const store = createStore(...args)
      return {
        ...store,
        method: () => 'foo'
      }
    }

  const store = createStore(reducer, enhancer)

  store.getState()
  const res: string = store.method()
  // @ts-expect-error
  store.wrongMethod()
}

/**
 * replaceReducer with a store enhancer
 */
function replaceReducerExtender() {
  interface ExtraState {
    extraField: 'extra'
  }

  const enhancer: StoreEnhancer<{ method(): string }, ExtraState> =
    createStore =>
    <S, A extends Action = AnyAction>(
      reducer: Reducer<S, A>,
      preloadedState?: any
    ) => {
      function wrapReducer(reducer: Reducer<S, A>): Reducer<S & ExtraState, A> {
        return (state, action) => {
          const newState = reducer(state, action)
          return {
            ...newState,
            extraField: 'extra'
          }
        }
      }
      const wrappedPreloadedState = preloadedState
        ? {
            ...preloadedState,
            extraField: 'extra'
          }
        : undefined
      const store = createStore(wrapReducer(reducer), wrappedPreloadedState)
      return {
        ...store,
        replaceReducer(nextReducer: Reducer<S, A>) {
          store.replaceReducer(wrapReducer(nextReducer))
        },
        method: () => 'foo'
      }
    }

  interface PartialState {
    someField?: 'string'
    test?: boolean
  }

  const initialReducer: Reducer<PartialState, Action<unknown>> = () => ({
    someField: 'string'
  })
  const store = createStore<
    PartialState,
    Action<unknown>,
    { method(): string },
    ExtraState
  >(initialReducer, enhancer)

  const newReducer = (state: PartialState = { test: true }, _: AnyAction) =>
    state

  store.replaceReducer(newReducer)
  store.getState().test
  store.getState().extraField
  // @ts-expect-error
  store.getState().wrongField

  const res: string = store.method()
  // @ts-expect-error
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

    const enhancer: StoreEnhancer<{}, ExtraState> =
      createStore =>
      <S, A extends Action = AnyAction>(
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
          replaceReducer(nextReducer: Reducer<S, A>) {
            const nextWrappedReducer: Reducer<S & ExtraState, A> = (
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

    interface PartialState {
      someField?: 'string'
      test?: boolean
    }

    const initialReducer: Reducer<PartialState, Action<unknown>> = () => ({
      someField: 'string'
    })
    const store = createStore<PartialState, Action<unknown>, {}, ExtraState>(
      initialReducer,
      enhancer
    )
    store.replaceReducer(initialReducer)

    store.getState().extraField
    // @ts-expect-error
    store.getState().wrongField
    store.getState().test

    const newReducer = (state: PartialState = { test: true }, _: AnyAction) =>
      state

    store.replaceReducer(newReducer)
    store.getState().test
    store.getState().extraField
    // @ts-expect-error
    store.getState().wrongField
  }
}

function finalHelmersonExample() {
  interface ExtraState {
    foo: string
  }

  function persistReducer<S, A extends Action<unknown>>(
    config: any,
    reducer: Reducer<S, A>
  ) {
    return (state: (S & ExtraState) | undefined, action: A) => {
      const newState = reducer(state, action)
      return {
        ...newState,
        foo: 'hi'
      }
    }
  }

  function persistStore<S>(store: S) {
    return store
  }

  function createPersistEnhancer(
    persistConfig: any
  ): StoreEnhancer<{}, ExtraState> {
    return createStore =>
      <S, A extends Action<unknown>>(
        reducer: Reducer<S, A>,
        preloadedState?: any
      ) => {
        const persistedReducer = persistReducer<S, A>(persistConfig, reducer)
        const store = createStore(persistedReducer, preloadedState)
        const persistor = persistStore(store)

        return {
          ...store,
          replaceReducer: (nextReducer: Reducer<S, A>) => {
            store.replaceReducer(persistReducer(persistConfig, nextReducer))
          },
          persistor
        }
      }
  }

  interface PartialState {
    someField?: 'string'
    test?: boolean
  }

  const initialReducer: Reducer<PartialState, Action<unknown>> = () => ({
    someField: 'string'
  })
  const store = createStore<PartialState, Action<unknown>, {}, ExtraState>(
    initialReducer,
    createPersistEnhancer('hi')
  )

  store.getState().foo
  // @ts-expect-error
  store.getState().wrongField

  const newReducer = (state: PartialState = { test: true }, _: AnyAction) =>
    state

  store.replaceReducer(newReducer)
  store.getState().test
  // @ts-expect-error
  store.getState().whatever
  // @ts-expect-error
  store.getState().wrongField
}

function composedEnhancers() {
  interface State {
    someState: string
  }
  const reducer: Reducer<State> = null as any

  interface Ext1 {
    enhancer1: string
  }
  interface Ext2 {
    enhancer2: number
  }

  const enhancer1: StoreEnhancer<Ext1> =
    createStore => (reducer, preloadedState) => {
      const store = createStore(reducer, preloadedState)
      return {
        ...store,
        enhancer1: 'foo'
      }
    }

  const enhancer2: StoreEnhancer<Ext2> =
    createStore => (reducer, preloadedState) => {
      const store = createStore(reducer, preloadedState)
      return {
        ...store,
        enhancer2: 5
      }
    }

  const composedEnhancer: StoreEnhancer<Ext1 & Ext2> = createStore =>
    enhancer2(enhancer1(createStore))

  const enhancedStore = createStore(reducer, composedEnhancer)
  enhancedStore.enhancer1
  enhancedStore.enhancer2
  // @ts-expect-error
  enhancedStore.enhancer3
}
