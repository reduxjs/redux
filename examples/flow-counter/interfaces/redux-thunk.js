import type { Middleware, MiddlewareAPI, Dispatch, Store } from 'redux';

declare module 'redux-thunk' {
  declare type Thunk<State, Dispatchable> = (dispatch: Dispatch<Dispatchable>, getState: () => State) => ?Dispatchable;
  declare type ThunkMiddlewareDispatchable<State, Dispatchable> = Thunk<State, Dispatchable> | Dispatchable;

  // Cannot find a way to export the default function with the correct type signature
  // declare var exports: {
  //   <State, Dispatchable>(
  //     api: MiddlewareAPI<State, ThunkMiddlewareDispatchable<State, Dispatchable>>
  //   ) : (next: Dispatch<Dispatchable>) => Dispatch<ThunkMiddlewareDispatchable<State, Dispatchable>>
  // };
}
