import { VisibilityActions, VisibilityFilters } from "../actions";

export type VisibilityState = VisibilityFilters;

const visibilityFilter = (
  state: VisibilityState = "SHOW_ALL",
  action: VisibilityActions
): VisibilityState => {
  switch (action.type) {
    case "SET_VISIBILITY_FILTER":
      return action.filter;
    default:
      return state;
  }
};

export default visibilityFilter;
