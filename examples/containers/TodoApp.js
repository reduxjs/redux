import React from 'react';
import { bindActions, Connector } from 'redux';
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

  renderChild({ todos, dispatcher }) {
    const actions = bindActions(TodoActions, dispatcher);
    return (
      <div>
        <AddTodo {...actions} />
        <TodoList todos={todos} {...actions} />
      </div>
    );
  }
}
