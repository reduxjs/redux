/* @flow */

export type State = any;

export type Action = any;

export type Store = (state: State, action: Action) => State;

export type Dispatch = (action: Action) => any;

export type Dispatcher = (state: State, setState: (nextState: State) => State) => Dispatch;

export type Middleware = (next: Dispatch | Middleware) => (Dispatch | Middleware);
