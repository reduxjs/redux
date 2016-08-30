import React, { PropTypes } from 'react'

const TodoList = ({ todos, displayTodo }) => (
  <ul>
    {todos.map(todo =>
      displayTodo(todo)
    )}
  </ul>
)

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  displayTodo: PropTypes.func.isRequired
}

export default TodoList
