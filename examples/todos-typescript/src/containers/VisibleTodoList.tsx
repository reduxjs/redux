import { connect } from "react-redux";
import { toggleTodo, VisibilityFilters } from "../actions";
import TodoList from "../components/TodoList";
import { State } from "../reducers";
import { TodosState } from "../reducers/todos";
import { exhaustiveCheck } from "../utils";

const getVisibleTodos = (todos: TodosState, filter: VisibilityFilters) => {
  switch (filter) {
    case "SHOW_ALL":
      return todos;
    case "SHOW_COMPLETED":
      return todos.filter(t => t.completed);
    case "SHOW_ACTIVE":
      return todos.filter(t => !t.completed);
    default:
      return exhaustiveCheck(filter);
  }
};

const mapStateToProps = (state: State) => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
});

const mapDispatchToProps = {
  toggleTodo
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList);
