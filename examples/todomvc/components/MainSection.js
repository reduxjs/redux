import React, { PropTypes } from 'react';
import TodoItem from './TodoItem';

export default class MainSection {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  render() {

    let toggleAll = null;
    if (this.props.todos.length > 0) {
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
