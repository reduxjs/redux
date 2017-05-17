// @flow

declare module 'redux-mock-store' {
  declare type Middlwares = ?Array<Function>;
  declare type Action = { +type: string };
  declare type Actions = Array<Action>;
  declare interface Store<State> {
    clearActions(): void,
    dispatch(action: Action): Action,
    getActions(): Actions,
    getState(): State,
    replaceReducer(nextReducer: Function): void,
    subscribe(callback: Function): Function
  }
  declare function mockStore<S>(state: S): Store<S>;
  declare function configureStore<S>(
    middlewares: Middlwares
  ): (state: S) => Store<S>;
  declare module.exports: <S>(
    middlewares: Middlwares
  ) => (state: S) => Store<S>;
}
