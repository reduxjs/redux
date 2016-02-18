export interface Action<T> {
  type: T;
}


/* reducers */

export type Reducer<S> = <A extends Action<any>>(state: S, action: A) => S;

export interface ReducersMapObject {
  [key: string]: Reducer<any>;
}

export function combineReducers<S>(reducers: ReducersMapObject): Reducer<S>;
export function combineReducers<S, M extends ReducersMapObject>(
  reducers: M
): Reducer<S>;


/* store */

export interface Dispatch {
  <A>(action: A): A;
  <A, B>(action: A): B;
}

export interface Unsubscribe {
  (): void;
}

export interface Store<S> {
  dispatch: Dispatch;
  getState(): S;
  subscribe(listener: () => void): Unsubscribe;
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

export interface ActionCreator<A> {
  (...args: any[]): A;
}

export interface ActionCreatorsMapObject {
  [key: string]: ActionCreator<any>;
}


export function bindActionCreators<A extends ActionCreator<any>>(
  actionCreator: A, dispatch: Dispatch
): A;

export function bindActionCreators<M extends ActionCreatorsMapObject>(
  actionCreators: M, dispatch: Dispatch
): M;


/* compose */

// copied from DefinitelyTyped/compose-function
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
