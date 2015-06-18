import React, { PropTypes } from 'react';
import TodoItem from './TodoItem';

export default class MainSection {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  render() {
    return (
      <section className='main'>
        <input className='toggle-all'
               type='checkbox'
               onChange={::this.props.actions.markAll} />
        <ul className='todo-list'>
          {this.props.todos.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...this.props.actions} />
          )}
        </ul>
      </section>
    );
  }
}
