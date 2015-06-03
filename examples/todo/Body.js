import React, { PropTypes } from 'react';
import { container } from 'redux';
import { todoStore } from './stores/index';

@container({
  stores: [todoStore]
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
