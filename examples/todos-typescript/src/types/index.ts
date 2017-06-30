import { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

import { ITodosState, TodosAction } from './todos';
import {
  IVisibilityFilterState,
  IVisibilityFilterAction
} from './visibilityFilter';

export type State = ITodosState & IVisibilityFilterState;

export type Action = TodosAction | IVisibilityFilterAction;

export type Store = ReduxStore<State>;

export type Dispatch = ReduxDispatch<Action>;
