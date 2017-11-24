import {
  Store, createStore, Reducer, Action, StoreEnhancer, GenericStoreEnhancer,
  StoreCreator, StoreEnhancerStoreCreator, Unsubscribe
} from "../../"


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

const genericEnhancer: GenericStoreEnhancer = <S>(next: StoreEnhancerStoreCreator<S>) => next;
const specificEnhancer: StoreEnhancer<State> = next => next;

const storeWithGenericEnhancer: Store<State> = createStore(reducer, genericEnhancer);
const storeWithSpecificEnhancer: Store<State> = createStore(reducer, specificEnhancer);

const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(reducer, {
  b: {c: 'c'}
}, genericEnhancer);


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

const newReducer: Reducer<State> = (state: State, action: Action): State => {
  return state;
}

store.replaceReducer(newReducer);
