declare module 'redux' {

  /*

    S = State
    A = Action

  */

  declare type Dispatch<A: { type: $Subtype<string> }> = (action: A) => A;

  declare type MiddlewareAPI<S, A> = {
    dispatch: Dispatch<A>;
    getState(): S;
  };

  declare type Store<S, A> = {
    // rewrite MiddlewareAPI members in order to get nicer error messages (intersections produce long messages)
    dispatch: Dispatch<A>;
    getState(): S;
    subscribe(listener: () => void): () => void;
    replaceReducer(nextReducer: Reducer<S, A>): void
  };

  declare type Reducer<S, A> = (state: S, action: A) => S;

  declare type Middleware<S, A> =
    (api: MiddlewareAPI<S, A>) =>
      (next: Dispatch<A>) => Dispatch<A>;

  declare type StoreCreator<S, A> = {
    <S, A>(reducer: Reducer<S, A>, enhancer?: StoreEnhancer<S, A>): Store<S, A>;
    <S, A>(reducer: Reducer<S, A>, preloadedState: S, enhancer?: StoreEnhancer<S, A>): Store<S, A>;
  };

  declare type StoreEnhancer<S, A> = (next: StoreCreator<S, A>) => StoreCreator<S, A>;

  declare function createStore<S, A>(reducer: Reducer<S, A>, enhancer?: StoreEnhancer<S, A>): Store<S, A>;
  declare function createStore<S, A>(reducer: Reducer<S, A>, preloadedState: S, enhancer?: StoreEnhancer<S, A>): Store<S, A>;

  declare function applyMiddleware<S, A>(...middlewares: Array<Middleware<S, A>>): StoreEnhancer<S, A>;

  declare type ActionCreator<A> = (...args: Array<any>) => A;
  declare type ActionCreators<K, A> = { [key: K]: ActionCreator<A> };

  declare function bindActionCreators<A, C: ActionCreator<A>>(actionCreator: C, dispatch: Dispatch<A>): C;
  declare function bindActionCreators<A, K, C: ActionCreators<K, A>>(actionCreators: C, dispatch: Dispatch<A>): C;

  // unsafe (you can miss a field and / or assign a wrong reducer to a field)
  declare function combineReducers<S: Object, A>(reducers: {[key: $Keys<S>]: Reducer<any, A>}): Reducer<S, A>;

  declare function compose<S, A>(...fns: Array<StoreEnhancer<S, A>>): Function;

}
