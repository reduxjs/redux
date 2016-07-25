import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import Header from '../components/Header'
import TodosList from '../components/TodosList'
import Footer from '../components/Footer'
import * as TodoActions from '../actions/TodoActions'
import * as FilterActions from '../actions/FilterActions'

class App extends Component {
  render() {
    const { todos, filter, todoActions, filterActions } = this.props
    return (
      <div>
        <Header addTodo={todoActions.addTodo} />
        <TodosList todos={todos} actions={todoActions} filter={filter}/>
        <Footer todos={todos} filterActions={filterActions} todoActions={todoActions} />
      </div>
    )
  }
}

App.propTypes = {
  todos: PropTypes.array.isRequired,
  filter: PropTypes.string.isRequired,
  todoActions: PropTypes.object.isRequired,
  filterActions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return {
    todos: state.todos,
    filter: state.filter
  }
}

function mapDispatchToProps(dispatch) {
  return {
    todoActions: bindActionCreators(TodoActions, dispatch),
    filterActions: bindActionCreators(FilterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
