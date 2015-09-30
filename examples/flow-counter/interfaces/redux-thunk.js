import type { Middleware, MiddlewareAPI, Dispatch, Store } from 'redux';

// For now declaring these types globally with a namespace, so I can
// export the default function in the module
declare type reduxThunk$Thunk<State, Dispatchable> = (dispatch: Dispatch<Dispatchable>, getState: () => State) => ?Dispatchable;
declare type reduxThunk$ThunkMiddlewareDispatchable<State, Dispatchable> = reduxThunk$Thunk<State, Dispatchable> | Dispatchable;

declare module 'redux-thunk' {
  declare var exports: {
    <State, Dispatchable>(
      api: MiddlewareAPI<State, reduxThunk$ThunkMiddlewareDispatchable<State, Dispatchable>>
    ) : (next: Dispatch<Dispatchable>) => Dispatch<reduxThunk$ThunkMiddlewareDispatchable<State, Dispatchable>>
  };
}

// function thunk<State, Dispatchable: Object>(_ref: MiddlewareAPI<State, ThunkMiddlewareDispatchable<State, Dispatchable>>) : (next: Dispatch<Dispatchable>) => Dispatch<ThunkMiddlewareDispatchable<State, Dispatchable>> {
//   var dispatch = _ref.dispatch;
//   var getState = _ref.getState;
//
//   return function (next) {
//     return function (action: ThunkMiddlewareDispatchable<State, Dispatchable>) : ?ThunkMiddlewareDispatchable<State, Dispatchable> {
//       return typeof action === 'function' ? action(dispatch, getState) : next(action);
//     };
//   };
// }
