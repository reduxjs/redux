// @flow

import { connect } from 'react-redux';

import { toggleTodo } from '../actions/todos';
import { visibleTodosSelector } from '../selectors';
import TodoList from '../components/TodoList';

import type { Connector } from 'react-redux';

import type { State, Dispatch } from '../types';
import type { Props } from '../components/TodoList';

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
