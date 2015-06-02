import React from 'react';
import connect from 'redux/connect';

@connect()
export default class Header {
  render() {
    return (
      <div>
        <button onClick={() => this.addTodo()}>Add todo</button>
      </div>
    );
  }

  addTodo() {
    this.props.actions.addTodo('some text');
  }
}
