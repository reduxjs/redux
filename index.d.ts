export interface Action {
  type: string;
}


/* reducers */

export type Reducer<S> = <A extends Action>(state: S, action: A) => S;

export function combineReducers<S>(reducers: {[key: string]: Reducer<any>}): Reducer<S>;


/* store */

export interface Dispatch {
  <A>(action: A): A;
  <A, B>(action: A): B;
}

export interface Store<S> {
  dispatch: Dispatch;
  getState(): S;
  subscribe(listener: () => void): () => void;
  replaceReducer(reducer: Reducer<S>): void;
}

export interface StoreCreator {
  <S>(reducer: Reducer<S>): Store<S>;
  <S>(reducer: Reducer<S>, initialState: S): Store<S>;

  <S>(reducer: Reducer<S>, enhancer: StoreEnhancer): Store<S>;
  <S>(reducer: Reducer<S>, initialState: S, enhancer: StoreEnhancer): Store<S>;
}

export type StoreEnhancer = (next: StoreCreator) => StoreCreator;

export const createStore: StoreCreator;


/* middleware */

export interface MiddlewareAPI<S> {
  dispatch: Dispatch;
  getState(): S;
}

export interface Middleware {
  <S>(api: MiddlewareAPI<S>): (next: Dispatch) => <A, B>(action: A) => B;
}

export function applyMiddleware(...middlewares: Middleware[]): StoreEnhancer;


/* action creators */

export interface ActionCreator {
  <O>(...args: any[]): O;
}

export function bindActionCreators<
  T extends ActionCreator|{[key: string]: ActionCreator}
>(actionCreators: T, dispatch: Dispatch): T;


/* compose */

// from DefinitelyTyped/compose-function
// Hardcoded signatures for 2-4 parameters
export function compose<A, B, C>(f1: (b: B) => C,
                                 f2: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(f1: (b: C) => D,
                                    f2: (a: B) => C,
                                    f3: (a: A) => B): (a: A) => D;
export function compose<A, B, C, D, E>(f1: (b: D) => E,
                                       f2: (a: C) => D,
                                       f3: (a: B) => C,
                                       f4: (a: A) => B): (a: A) => E;

// Minimal typing for more than 4 parameters
export function compose<I, R>(f1: (a: any) => R,
                              ...functions: Function[]): (a: I) => R;
