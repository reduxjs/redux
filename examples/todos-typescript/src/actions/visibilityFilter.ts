import {
  VisibilityFilter,
  IVisibilityFilterAction
} from '../types/visibilityFilter';

export const setVisibilityFilter = (filter: VisibilityFilter): IVisibilityFilterAction => {
  return {
    type: 'SET_VISIBILITY_FILTER',
    filter
  };
};
