import React from 'react';

export default class Body {
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
