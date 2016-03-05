import React, { PropTypes } from 'react'
import Todo from './Todo'

const TodoList = ({ 
  completedCount, 
  todos, 
  deleteTodo, 
  editTodo, 
  completeTodo,
  completeAll 
}) => (
  <section className="main">
    <input className="toggle-all"
           type="checkbox"
           checked={completedCount === todos.length}
           onChange={() => completeAll()} />

    <ul className="todo-list">
      {todos.map(todo =>
        <Todo
          key={todo.id}
          todo={todo}
          deleteTodo={() => deleteTodo(todo.id)}
          editTodo={(text) => editTodo(todo.id, text)}
          completeTodo={() => completeTodo(todo.id)}
        />
      )}
    </ul>
  </section>
)

TodoList.propTypes = {
  todos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  }).isRequired).isRequired,
  deleteTodo: PropTypes.func.isRequired,
  editTodo: PropTypes.func.isRequired,
  completeTodo: PropTypes.func.isRequired,
  completeAll: PropTypes.func.isRequired
}

export default TodoList
