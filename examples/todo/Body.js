import React, { PropTypes } from 'react';
import { inject } from 'redux';
import { todoStore } from './stores/index';

@inject({
  stores: { todos: todoStore }
})
export default class Body {
  static propTypes = {
    todos: PropTypes.array.isRequired
  };

  render() {
    return (
      <div>
        {this.props.todos.map(todo =>
          <div key={todo.id}>{todo.text}</div>
        )}
      </div>
    );
  }
}
