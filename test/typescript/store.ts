import {
  Store, createStore, Reducer, Action, StoreEnhancer,
  StoreCreator, StoreEnhancerStoreCreator, Unsubscribe
} from "redux"


type State = {
  a: 'a';
  b: {
    c: 'c',
    d: 'd',
  };
}

interface DerivedAction extends Action {
  type: 'a',
  b: 'b',
}

const reducer: Reducer<State> = (state: State | undefined = {
  a: 'a',
  b: {
    c: 'c',
    d: 'd',
  },
}, action: Action): State => {
  return state;
};

const reducerWithAction: Reducer<State, DerivedAction> = (state: State | undefined = {
  a: 'a',
  b: {
    c: 'c',
    d: 'd',
  },
}, action: DerivedAction): State => {
  return state;
};

const funcWithStore = (store: Store<State, DerivedAction>) => {};

/* createStore */

const store: Store<State> = createStore(reducer);

const storeWithPreloadedState: Store<State> = createStore(reducer, {
  b: {c: 'c'}
});

const storeWithActionReducer = createStore(reducerWithAction);
const storeWithActionReducerAndPreloadedState = createStore(reducerWithAction, {
  b: {c: 'c'},
});
funcWithStore(storeWithActionReducer);
funcWithStore(storeWithActionReducerAndPreloadedState);

const enhancer: StoreEnhancer = next => next;

const storeWithSpecificEnhancer: Store<State> = createStore(reducer, enhancer);

const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(reducer, {
  b: {c: 'c'}
}, enhancer);


/* dispatch */

store.dispatch({
  type: 'ADD_TODO',
  text: 'test'
})


/* getState */

const state: State = store.getState();


/* subscribe / unsubscribe */

const unsubscribe: Unsubscribe = store.subscribe(() => {
  console.log('Current state:', store.getState())
})

unsubscribe();


/* replaceReducer */

const newReducer: Reducer<State> = reducer;

store.replaceReducer(newReducer);
