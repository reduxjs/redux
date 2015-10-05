declare type redux$Dispatch<Dispatchable> = (action: Dispatchable) => ?Dispatchable;

declare type redux$Store<State, Dispatchable> = {
  dispatch: redux$Dispatch<Dispatchable>,
  subscribe: (listener: () => void) => (() => void),
  getState: () => State,
  replaceReducer: any
};

declare type redux$MiddlewareAPI<State, Dispatchable> = {
  dispatch: redux$Dispatch<Dispatchable>,
  getState: () => State,
};

declare type redux$Middleware<State, Dispatchable, DispatchableNext> = (
  api: redux$MiddlewareAPI<State, Dispatchable>
) => (
  next: redux$Dispatch<DispatchableNext>
) => redux$Dispatch<Dispatchable>;

declare module "redux" {
  declare type ReduxInitAction = { type: '@@redux/INIT' };
  declare type ReduxAction<Action> = ReduxInitAction | Action;

  declare type Reducer<State, Action> = (state?: State, action: ReduxAction<Action>) => State;
  declare type Dispatch<Dispatchable> = redux$Dispatch<Dispatchable>;

  declare type Store<State, Dispatchable> = redux$Store<State, Dispatchable>;

  declare type CreateStore<State, Action, Dispatchable> = (reducer: Reducer<State, Action>, initialState?: State) => Store<State, Dispatchable>
  declare function createStore<State, Action>(reducer: Reducer<State, Action>, initialState?: State) : Store<State, ReduxAction<Action>>;

  declare type MiddlewareAPI<State, Dispatchable> = redux$MiddlewareAPI<State, Dispatchable>;

  declare type Middleware<State, Dispatchable, DispatchableNext> = redux$Middleware<State, Dispatchable, DispatchableNext>;

  declare function applyMiddleware<State, Action, Dispatchable, DispatchableNext>(middleware: Middleware<State, Dispatchable, DispatchableNext>)
    : (next: CreateStore<State, Action, DispatchableNext>) => CreateStore<State, Action, Dispatchable>;
}
