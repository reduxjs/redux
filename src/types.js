export type State = any;
export type Action = Object;
export type IntermediateAction = any;
export type Dispatch = (a: Action | IntermediateAction) => any;
export type Reducer<S, A> = (state: S, action: A) => S;
export type ActionCreator = (...args: any) => Action | IntermediateAction
export type Middleware = (methods: { dispatch: Dispatch, getState: () => State }) => (next: Dispatch) => Dispatch;
export type Store = { dispatch: Dispatch, getState: State, subscribe: Function, getReducer: Reducer, replaceReducer: void };
export type CreateStore = (reducer: Function, initialState: any) => Store;
export type HigherOrderStore = (next: CreateStore) => CreateStore;
