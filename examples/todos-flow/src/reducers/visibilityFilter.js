// @flow

import type { VisibilityFilter } from '../types/visibilityFilter';
import type { Action } from '../types';
const visibilityFilter = (
  state: VisibilityFilter = 'SHOW_ALL',
  action: Action
): VisibilityFilter => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

export default visibilityFilter;
