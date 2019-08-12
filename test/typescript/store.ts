import {
  Store,
  createStore,
  Reducer,
  Action,
  StoreEnhancer,
  StoreCreator,
  StoreEnhancerStoreCreator,
  Unsubscribe,
  Observer
} from 'redux'
import 'symbol-observable'

type State = {
  a: 'a'
  b: {
    c: 'c'
    d: 'd'
  }
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
    }
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
    }
  },
  action: DerivedAction
): State => {
  return state
}

const funcWithStore = (store: Store<State, DerivedAction>) => {}

/* createStore */

const store: Store<State> = createStore(reducer)

const storeWithPreloadedState: Store<State> = createStore(reducer, {
  a: 'a',
  b: { c: 'c', d: 'd' }
})
// typings:expect-error
const storeWithBadPreloadedState: Store<State> = createStore(reducer, {
  b: { c: 'c' }
})

const storeWithActionReducer = createStore(reducerWithAction)
const storeWithActionReducerAndPreloadedState = createStore(reducerWithAction, {
  a: 'a',
  b: { c: 'c', d: 'd' }
})
funcWithStore(storeWithActionReducer)
funcWithStore(storeWithActionReducerAndPreloadedState)

// typings:expect-error
const storeWithActionReducerAndBadPreloadedState = createStore(
  reducerWithAction,
  {
    b: { c: 'c' }
  }
)

const enhancer: StoreEnhancer = next => next

const storeWithSpecificEnhancer: Store<State> = createStore(reducer, enhancer)

const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(
  reducer,
  {
    a: 'a',
    b: { c: 'c', d: 'd' }
  },
  enhancer
)

// typings:expect-error
const storeWithBadPreloadedStateAndEnhancer: Store<State> = createStore(
  reducer,
  {
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

const state: State = store.getState()

/* subscribe / unsubscribe */

const unsubscribe: Unsubscribe = store.subscribe(() => {
  console.log('Current state:', store.getState())
})

unsubscribe()

/* replaceReducer */

const newReducer: Reducer<State> = reducer

store.replaceReducer(newReducer)

/* observable */

let observable = store[Symbol.observable]()
observable = observable[Symbol.observable]()
const observer: Observer<State> = {
  next(state: State) {
    console.log('current state:', state)
  }
}
const unsubscribeFromObservable = observable.subscribe(observer).unsubscribe
unsubscribeFromObservable()
