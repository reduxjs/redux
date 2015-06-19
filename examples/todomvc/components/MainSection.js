import React, { PropTypes } from 'react';
import TodoItem from './TodoItem';

export default class MainSection {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  render() {

    let toggleAll;
    // Toggle All shouldn't be present if no todos are present.
    if (this.props.todos.length === 0) {
      toggleAll = null;
    } else {
      toggleAll = (
        <input className='toggle-all'
               type='checkbox'
               onChange={::this.props.actions.markAll} />
      );
    }

    return (
      <section className='main'>
        {toggleAll}
        <ul className='todo-list'>
          {this.props.todos.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...this.props.actions} />
          )}
        </ul>
      </section>
    );
  }
}
