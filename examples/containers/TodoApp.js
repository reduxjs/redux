import React from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'redux/react';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import * as TodoActions from '../actions/TodoActions';

export default class TodoApp {
  render() {
    return (
      <Connector select={state => ({ todos: state.todos })}>
        {this.renderChild}
      </Connector>
    );
  }

  renderChild({ todos, dispatch }) {
    const actions = bindActionCreators(TodoActions, dispatch);
    return (
      <div>
        <AddTodo {...actions} />
        <TodoList todos={todos} {...actions} />
      </div>
    );
  }
}
