import React from 'react';
import connect from 'redux/connect';

@connect(
  () => ({}),
  ({ addTodo }) => ({ addTodo })
)
export default class Header {
  render() {
    return (
      <div>
        <button onClick={() => this.addTodo()}>Add todo</button>
      </div>
    );
  }

  addTodo() {
    this.props.addTodo('some text');
  }
}