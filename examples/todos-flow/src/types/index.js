// @flow
import type { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux'

export type Id = number;

export type Text = string;

export type Todo = {
  +id: Id,
  +text: Text,
  +completed: boolean
};

export type VisibilityFilter =
    'SHOW_ALL'
  | 'SHOW_ACTIVE'
  | 'SHOW_COMPLETED'
  ;

export type Todos = Array<Todo>;

export type State = {
  +todos: Todos,
  +visibilityFilter: VisibilityFilter
};

export type Action =
    { type: 'ADD_TODO', +id: Id, +text: Text }
  | { type: 'TOGGLE_TODO', +id: Id }
  | { type: 'SET_VISIBILITY_FILTER', +filter: VisibilityFilter }
  ;

export type Store = ReduxStore<State, Action>;

export type Dispatch = ReduxDispatch<Action>;
