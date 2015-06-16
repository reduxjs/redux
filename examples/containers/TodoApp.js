import React from 'react';
import { Connector } from 'redux/react';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import * as TodoActions from '../actions/TodoActions';

export default class TodoApp {
  render() {
    return (
      <Connector select={state => ({ todos: state.todos })} actionCreators={TodoActions}>
        {this.renderChild}
      </Connector>
    );
  }

  renderChild({ todos, actions }) {
    return (
      <div>
        <AddTodo {...actions} />
        <TodoList todos={todos} {...actions} />
      </div>
    );
  }
}
