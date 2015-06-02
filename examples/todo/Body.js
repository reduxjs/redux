import React from 'react';
import connect from 'redux/connect';

@connect({
  TodoStore: ({ todos }) => ({ todos })
})
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
