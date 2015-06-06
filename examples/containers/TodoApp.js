import React from 'react';
import { Injector } from 'redux';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import * as TodoActions from '../actions/TodoActions';

export default class TodoApp {
  render() {
    return (
      <Injector actions={TodoActions}>
        {({ state: { todos }, actions}) =>
          <div>
            <AddTodo {...actions} />
            <TodoList todos={todos} {...actions} />
          </div>
        }
      </Injector>
    );
  }
}
