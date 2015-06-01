import React from 'react';
import connect from 'redux/connect';

@connect(
  ({ TodoStore }) => ({ TodoStore })
)
export default class Body {
  render() {
    return (
      <div>
        {this.props.TodoStore.todos.map(todo =>
          <div key={todo.id}>{todo.text}</div>
        )}
      </div>
    );
  }
}