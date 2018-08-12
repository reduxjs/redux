import { combineReducers } from "redux";
import { TodoActions, VisibilityActions } from "../actions";
import todos, { TodosState } from "./todos";
import visibilityFilter, { VisibilityState } from "./visibilityFilter";

export type State = {
  todos: TodosState;
  visibilityFilter: VisibilityState;
};

export type Actions = TodoActions & VisibilityActions;

export default combineReducers<State, Actions>({
  todos,
  visibilityFilter
});
