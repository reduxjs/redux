import { connect } from 'react-redux';

import { toggleTodo } from '../actions/todos';
import { visibleTodosSelector } from '../selectors';
import TodoList from '../components/TodoList';

import { State, Dispatch } from '../types';

const mapStateToProps = (state: State) => ({
  todos: visibleTodosSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onTodoClick(id: number) {
    dispatch(toggleTodo(id));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList);
