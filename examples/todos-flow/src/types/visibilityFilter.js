// @flow

export type VisibilityFilter = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED';

export type VisibilityFilterState = {
  +visibilityFilter: VisibilityFilter
};

export type VisibilityFilterAction = {
  type: 'SET_VISIBILITY_FILTER',
  +filter: VisibilityFilter
};
