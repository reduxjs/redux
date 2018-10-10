import { connect } from 'react-redux'
import { toggleTodo } from '../actions'
import TodoList from '../components/TodoList'
import { VisibilityFilters } from '../actions'

const getVisibleTodos = (todos, filter) => {
  let completedTasks = todos.filter(t => t.completed);
  let activeTasks = todos.filter(t => !t.completed);
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return [...activeTasks,...completedTasks]
    case VisibilityFilters.SHOW_COMPLETED:
      return completedTasks
    case VisibilityFilters.SHOW_ACTIVE:
      return activeTasks
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

const mapStateToProps = state => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter)
})

const mapDispatchToProps = dispatch => ({
  toggleTodo: id => dispatch(toggleTodo(id))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)
