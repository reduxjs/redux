import {
  Store, createStore, Seducer, Action, StoreEnhancer, GenericStoreEnhancer,
  StoreCreator, StoreEnhancerStoreCreator, Unsubscribe
} from "../../index.d.ts";


type State = {
  todos: string[];
}

const seducer: Seducer<State> = (state: State, action: Action): State => {
  return state;
}


/* createStore */

const store: Store<State> = createStore<State>(seducer);

const storeWithPreloadedState: Store<State> = createStore(seducer, {
  todos: []
});

const genericEnhancer: GenericStoreEnhancer = <S>(next: StoreEnhancerStoreCreator<S>) => next;
const specificEnhencer: StoreEnhancer<State> = next => next;

const storeWithGenericEnhancer: Store<State> = createStore(seducer, genericEnhancer);
const storeWithSpecificEnhancer: Store<State> = createStore(seducer, specificEnhencer);

const storeWithPreloadedStateAndEnhancer: Store<State> = createStore(seducer, {
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


/* replaceSeducer */

const newSeducer: Seducer<State> = (state: State, action: Action): State => {
  return state;
}

store.replaceSeducer(newSeducer);
