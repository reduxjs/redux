import {
  Store, createStore, Reducer, Action, StoreEnhancer,
  StoreCreator, Unsubscribe
} from "../../index.d.ts";


type State = {
  todos: string[];
}

const reducer: Reducer<State> = (state: State, action: Action): State => {
  return state;
}


/* createStore */

const store: Store<State> = createStore<State>(reducer);

const storeWithInitialState: Store<State> = createStore(reducer, {
  todos: []
});

const enhancer: StoreEnhancer = (next: StoreCreator) => next;

const storeWithEnhancer: Store<State> = createStore(reducer, enhancer);

const storeWithInitialStateAndEnhancer: Store<State> = createStore(reducer, {
  todos: []
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

const newReducer: Reducer<State> = (state: State, action: Action): State => {
  return state;
}

store.replaceReducer(newReducer);
