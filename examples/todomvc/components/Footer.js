import React, { PropTypes, Component } from 'react'
import classnames from 'classnames'
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from '../constants/TodoFilters'

const FILTER_TITLES = {
  [SHOW_ALL]: 'All',
  [SHOW_ACTIVE]: 'Active',
  [SHOW_COMPLETED]: 'Completed'
}

class Footer extends Component {

  renderTodoCount() {
    const { todos } = this.props;
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
      0
    )
    const activeCount = todos.length - completedCount

    const itemWord = activeCount === 1 ? 'item' : 'items'

    return ( < span className = "todo-count" >
      < strong > { activeCount || 'No' } < /strong> {itemWord} left < /span>
    )
  }

  onShow(filter) {
    switch (filter) {
      case SHOW_COMPLETED:
        this.props.filterActions.showCompleted();
        break;
      case SHOW_ACTIVE:
        this.props.filterActions.showActive();
        break;
      default:
        this.props.filterActions.showAll();
    }
  }

  renderFilterLink(filter) {
    const title = FILTER_TITLES[filter]
    const { filter: selectedFilter, onShow } = this.props
    return ( < a className = { classnames({ selected: filter === selectedFilter }) }
      style = {
        { cursor: 'pointer' } }
      onClick = {
        () => this.onShow(filter) } > { title } < /a>
    )
  }

  onClearCompleted() {
    this.props.todoActions.clearCompleted()
  }

  renderClearButton() {
    const { todos } = this.props;
    const completedCount = todos.reduce((count, todo) =>
      todo.completed ? count + 1 : count,
      0
    )
    const activeCount = todos.length - completedCount
    if (completedCount > 0) {
      return ( < button className = "clear-completed"
        onClick = { this.onClearCompleted.bind(this) } >
        Clear completed < /button>
      )
    }
  }

  render() {
    return ( < footer className = "footer" > { this.renderTodoCount() } < ul className = "filters" > {
      [SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map(filter =>
        < li key = { filter } > { this.renderFilterLink(filter) } < /li>
      )
    } < /ul> { this.renderClearButton() } < /footer>)
  }
}

Footer.propTypes = {
  todos: PropTypes.array.isRequired,
  todoActions: PropTypes.object.isRequired,
  filterActions: PropTypes.object.isRequired
}

export default Footer

