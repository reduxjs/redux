import React from 'react';
import { performs } from 'redux';

@performs('addTodo')
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
