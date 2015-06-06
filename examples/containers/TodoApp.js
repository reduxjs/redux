import React from 'react';
import { Injector } from 'redux';
import AddTodo from '../components/AddTodo';
import TodoList from '../components/TodoList';
import * as TodoActions from '../actions/TodoActions';

function select(state) {
  return state.todos;
}

export default class TodoApp {
  render() {
    return (
      <Injector actions={TodoActions}
                select={select}>
        {({ state, actions}) =>
          <div>
            <AddTodo {...actions} />
            <TodoList todos={state} {...actions} />
          </div>
        }
      </Injector>
    );
  }
}
