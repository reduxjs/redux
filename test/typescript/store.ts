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

const reducer: Reducer<State> = (state: State | undefined = {
  a: 'a',
  b: {
    c: 'c',
    d: 'd',
  },
}, action: Action): State => {
  return state;
};

/* createStore */

const store: Store<State> = createStore(reducer);

const storeWithPreloadedState: Store<State> = createStore(reducer, {
  b: {c: 'c'}
});

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
