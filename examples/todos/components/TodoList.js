import React, { Component, PropTypes } from 'react'

export class TodoList extends Component {
  render() {
    return (
      <ul>
        {this.props.todos.map(todo =>
          this.props.todoFactory.create(todo)
        )}
      </ul>
    )
  }
}

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  todoFactory: PropTypes.object.isRequired
}
