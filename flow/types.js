/* @flow */

export type ReduxInitAction = {type: '@@redux/INIT'};
export type ReduxAction<Action> = ReduxInitAction | Action;

export type Reducer<State, Action> = (state: State, action: ReduxAction<Action>) => State;
export type Store<State, Action> = {
  dispatch: (action: ReduxAction<Action>) => ReduxAction<Action>,
  subscribe: (listener: () => void) => (() => void),
  getState: () => State,
  getReducer: () => Reducer<State, Action>,
  replaceReducer: any
};
