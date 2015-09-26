declare module "redux" {
  declare type ReduxInitAction = {type: '@@redux/INIT'};
  declare type ReduxAction<Action> = ReduxInitAction | Action;

  declare type Reducer<State, Action> = (state?: State, action: ReduxAction<Action>) => State;
  declare type Dispatch<Dispatchable> = (action: Dispatchable) => ?Dispatchable;

  declare type Store<State, Action, Dispatchable> = {
    dispatch: Dispatch<Dispatchable>,
    subscribe: (listener: () => void) => (() => void),
    getState: () => State,
    replaceReducer: any
  };

  declare type CreateStore<State, Action, Dispatchable> = (reducer: Reducer<State, Action>, initialState?: State) => Store<State, Action, Dispatchable>
  declare function createStore<State, Action>(reducer: Reducer<State, Action>, initialState?: State) : Store<State, Action, ReduxAction<Action>>;

  declare type MiddlewareAPI<State, Dispatchable> = {
    dispatch: Dispatch<Dispatchable>,
    getState: () => State,
  };

  declare type Middleware<State, Dispatchable, DispatchableNext> = (api: MiddlewareAPI<State, Dispatchable>) => (next: Dispatch<DispatchableNext>) => Dispatch<Dispatchable>;

  declare function applyMiddleware<State, Action, Dispatchable, DispatchableNext>(middleware: Middleware<State, Dispatchable, DispatchableNext>)
    : (next: CreateStore<State, Action, DispatchableNext>) => CreateStore<State, Action, Dispatchable>;
}
