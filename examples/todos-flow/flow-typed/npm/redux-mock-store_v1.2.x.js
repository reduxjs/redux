// flow-typed signature: 6cd2c212efe8f38ffcd607e71c7151bb
// flow-typed version: 5e08ae257c/redux-mock-store_v1.2.x/flow_>=v0.34.x

declare module 'redux-mock-store' {
  /*
    S = State
    A = Action
  */

  declare type mockStore = {
    <S, A>(state: S): mockStoreWithoutMiddleware<S, A>
  };
  declare type mockStoreWithoutMiddleware<S, A> = {
    getState(): S,
    getActions(): Array<A>,
    dispatch(action: A): A,
    clearActions(): void,
    subscribe(callback: Function): void,
    replaceReducer(nextReducer: Function): void
  };

  declare function exports(middlewares: ?Array<Function>): mockStore;
}

// Filename aliases
declare module 'redux-mock-store/src/index' {
  declare module.exports: $Exports<'redux-mock-store'>;
}
declare module 'redux-mock-store/src/index.js' {
  declare module.exports: $Exports<'redux-mock-store'>;
}
