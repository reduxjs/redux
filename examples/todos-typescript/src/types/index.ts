import { Store as ReduxStore, Dispatch as ReduxDispatch } from 'redux';

import { TodosState, TodosAction } from './todos';
import {
  IVisibilityFilterState,
  IVisibilityFilterAction
} from './visibilityFilter';

export type State = TodosState & IVisibilityFilterState;

export type Action = TodosAction | IVisibilityFilterAction;

export type Store = ReduxStore<State>;

export type Dispatch = ReduxDispatch<Action>;
