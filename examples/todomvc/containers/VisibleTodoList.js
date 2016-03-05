import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as TodoActions from '../actions'
import { getCompletedCount, getVisibleTodos } from '../selectors'
import TodoList from '../components/TodoList'

const mapStateToProps = (state) => {
  return {
    completedCount: getCompletedCount(state),
    todos: getVisibleTodos(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(TodoActions, dispatch)
}

const VisibleTodoList = connect(
  mapStateToProps,
  mapDispatchToProps
)(TodoList)

export default VisibleTodoList
