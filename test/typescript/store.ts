import {
  Store, createStore, Reducer, Action, StoreEnhancer, GenericStoreEnhancer,
  StoreCreator, StoreEnhancerStoreCreator, Unsubscribe
} from "../../index";


type State = {
  todos: string[];
}

const reducer: Reducer<State> = (state: State, action: Action): State => {
  return state;
}


/* createStore */

const store: Store<State> = createStore<State>(reducer);

const storeWithPreloadedState: Store<State> = createStore(reducer, {
  todos: []
});

const genericEnhancer: GenericStoreEnhancer = <S>(next: StoreEnhancerStoreCreator<S>) => next;
const specificEnhencer: StoreEnhancer<State> = next => next;

const storeWithGenericEnhancer: Store<State> = createStore(reducer, genericEnhancer);
const storeWithSpecificEnhancer: Store<State> = createStore(reducer, specificEnhencer);

const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(reducer, {
  todos: []
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
