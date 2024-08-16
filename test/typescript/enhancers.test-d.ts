import type { Action, Reducer, StoreEnhancer } from 'redux'
import { createStore } from 'redux'

interface State {
  someField: 'string'
}

const reducer: Reducer<State> = null as any

describe('type tests', () => {
  test('Store enhancer that extends the type of dispatch.', () => {
    type PromiseDispatch = <T extends Action>(promise: Promise<T>) => Promise<T>

    const enhancer: StoreEnhancer<{
      dispatch: PromiseDispatch
    }> =
      createStore =>
      <S, A extends Action, PreloadedState>(
        reducer: Reducer<S, A, PreloadedState>,
        preloadedState?: PreloadedState | undefined
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

    // `.toBeCallableWith or .parameter(0).toMatchTypeOf`
    // do not work in this scenario.
    store.dispatch({ type: 'INCREMENT' })

    store.dispatch(Promise.resolve({ type: 'INCREMENT' }))

    expectTypeOf(store.dispatch).parameter(0).not.toMatchTypeOf('not-an-action')

    expectTypeOf(store.dispatch)
      .parameter(0)
      .not.toMatchTypeOf(Promise.resolve('not-an-action'))
  })

  test('Store enhancer that extends the type of the state.', () => {
    interface ExtraState {
      extraField: string
    }

    const enhancer: StoreEnhancer<{}, ExtraState> =
      createStore =>
      <S, A extends Action, PreloadedState>(
        reducer: Reducer<S, A, PreloadedState>,
        preloadedState?: PreloadedState | undefined
      ) => {
        function wrapReducer<PreloadedStateToWrap>(
          reducer: Reducer<S, A, PreloadedStateToWrap>
        ): Reducer<S & ExtraState, A, PreloadedStateToWrap & ExtraState> {
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

    expectTypeOf(store.getState()).toHaveProperty('someField')

    expectTypeOf(store.getState()).toHaveProperty('extraField')

    expectTypeOf(store.getState()).not.toHaveProperty('wrongField')
  })

  test('Store enhancer that adds methods to the store.', () => {
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

    expectTypeOf(store.getState).toBeCallableWith()

    expectTypeOf(store.method()).toBeString()

    expectTypeOf(store).not.toHaveProperty('wrongMethod')
  })

  test('replaceReducer with a store enhancer', () => {
    interface ExtraState {
      extraField: string
    }

    const enhancer: StoreEnhancer<{ method(): string }, ExtraState> =
      createStore =>
      <S, A extends Action, PreloadedState>(
        reducer: Reducer<S, A, PreloadedState>,
        preloadedState?: PreloadedState | undefined
      ) => {
        function wrapReducer<PreloadedStateToWrap>(
          reducer: Reducer<S, A, PreloadedStateToWrap>
        ): Reducer<S & ExtraState, A, PreloadedStateToWrap & ExtraState> {
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

    const initialReducer: Reducer<PartialState, Action> = () => ({
      someField: 'string'
    })

    const store = createStore<
      PartialState,
      Action,
      { method(): string },
      ExtraState
    >(initialReducer, enhancer)

    const newReducer = (state: PartialState = { test: true }, _: Action) =>
      state

    expectTypeOf(store.replaceReducer).parameter(0).toEqualTypeOf(newReducer)

    expectTypeOf(store.getState()).toHaveProperty('test')

    expectTypeOf(store.getState()).toHaveProperty('extraField')

    expectTypeOf(store.getState()).not.toHaveProperty('wrongField')

    expectTypeOf(store.method()).toBeString()

    expectTypeOf(store).not.toHaveProperty('wrongMethod')
  })

  test('mhelmersonExample', () => {
    interface State {
      someField: 'string'
    }

    interface ExtraState {
      extraField: 'extra'
    }

    const reducer: Reducer<State> = null as any

    test('state extension expected to work', () => {
      interface ExtraState {
        extraField: string
      }

      const enhancer: StoreEnhancer<{}, ExtraState> =
        createStore =>
        <S, A extends Action, PreloadedState>(
          reducer: Reducer<S, A, PreloadedState>,
          preloadedState?: PreloadedState | undefined
        ) => {
          const wrappedReducer: Reducer<
            S & ExtraState,
            A,
            PreloadedState & ExtraState
          > = (state, action) => {
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

      const initialReducer: Reducer<PartialState, Action> = () => ({
        someField: 'string'
      })

      const store = createStore<PartialState, Action, {}, ExtraState>(
        initialReducer,
        enhancer
      )

      expectTypeOf(store.replaceReducer)
        .parameter(0)
        .toEqualTypeOf(initialReducer)

      expectTypeOf(store.getState()).toHaveProperty('extraField')

      expectTypeOf(store.getState()).not.toHaveProperty('wrongField')

      expectTypeOf(store.getState()).toHaveProperty('test')

      const newReducer = (state: PartialState = { test: true }, _: Action) =>
        state

      expectTypeOf(store.replaceReducer).parameter(0).toEqualTypeOf(newReducer)

      expectTypeOf(store.getState()).toHaveProperty('test')

      expectTypeOf(store.getState()).toHaveProperty('extraField')

      expectTypeOf(store.getState()).not.toHaveProperty('wrongField')
    })
  })

  test('finalHelmersonExample', () => {
    interface ExtraState {
      foo: string
    }

    function persistReducer<S, A extends Action, PreloadedState>(
      config: any,
      reducer: Reducer<S, A, PreloadedState>
    ) {
      return (
        state: (S & ExtraState) | PreloadedState | undefined,
        action: A
      ) => {
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
        <S, A extends Action, PreloadedState>(
          reducer: Reducer<S, A, PreloadedState>,
          preloadedState?: PreloadedState | undefined
        ) => {
          const persistedReducer = persistReducer(persistConfig, reducer)

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

    const initialReducer: Reducer<PartialState, Action> = () => ({
      someField: 'string'
    })

    const store = createStore<PartialState, Action, {}, ExtraState>(
      initialReducer,
      createPersistEnhancer('hi')
    )

    expectTypeOf(store.getState()).toHaveProperty('foo')

    expectTypeOf(store.getState()).not.toHaveProperty('wrongField')

    const newReducer = (state: PartialState = { test: true }, _: Action) =>
      state

    expectTypeOf(store.replaceReducer).parameter(0).toEqualTypeOf(newReducer)

    expectTypeOf(store.getState()).toHaveProperty('test')

    expectTypeOf(store.getState()).not.toHaveProperty('whatever')

    expectTypeOf(store.getState()).not.toHaveProperty('wrongField')
  })

  test('composedEnhancers', () => {
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

    expectTypeOf(enhancedStore).toHaveProperty('enhancer1')

    expectTypeOf(enhancedStore).toHaveProperty('enhancer2')

    expectTypeOf(enhancedStore).not.toHaveProperty('enhancer3')
  })
})
