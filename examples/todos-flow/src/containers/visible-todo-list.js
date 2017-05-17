// @flow

import { connect } from 'react-redux';

import { toggleTodo } from '../actions/todos';
import { visibleTodosSelector } from '../selectors/todos';
import TodoList from '../components/todo-list';

import type { State, Dispatch } from '../types';
import type { Connector } from 'react-redux';
import type { Props } from '../components/todo-list';

const mapStateToProps = (state: State) => {
  return {
    todos: visibleTodosSelector(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onTodoClick: id => {
      dispatch(toggleTodo(id));
    }
  };
};

const connector: Connector<{}, Props> = connect(
  mapStateToProps,
  mapDispatchToProps
);

export default connector(TodoList);
