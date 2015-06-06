import React from 'react';
import { Connector } from 'redux';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import * as TodoActions from '../actions/TodoActions';

export default class TodoApp {
  render() {
    return (
      <Connector actions={TodoActions}
                 select={state => state.todos}>
        {this.renderChild}
      </Connector>
    );
  }

  renderChild({ state, actions }) {
    return (
      <div>
        <AddTodo {...actions} />
        <TodoList todos={state} {...actions} />
      </div>
    );
  }
}
