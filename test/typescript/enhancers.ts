import { PreloadedState } from '../../index'
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
