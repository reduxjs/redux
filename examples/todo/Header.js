import React, { PropTypes } from 'react';
import { inject } from 'redux';
import { addTodo } from './actions/index';

@inject({
  actions: { addTodo }
})
export default class Header {
  static propTypes = {
    addTodo: PropTypes.func.isRequired
  };

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
