export type VisibilityFilter = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED';

export interface IVisibilityFilterState {
  visibilityFilter: VisibilityFilter;
}

export interface IVisibilityFilterAction {
  type: 'SET_VISIBILITY_FILTER';
  filter: VisibilityFilter;
}
