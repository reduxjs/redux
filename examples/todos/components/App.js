import React, {Component} from 'react'
import {Footer} from './Footer'
import AddTodo from '../containers/AddTodo'
import { actions, store } from '../actions'
import { todos } from "../actions/Todos"
import { Link } from './Link'
import {TodoList} from './TodoList'
import {TodoFactory} from './TodoFactory'
import autobind from 'autobind-decorator'

@autobind
export class App extends Component {
  constructor(props) {
    super(props)
    this.todoFactory = new TodoFactory(actions.toggleTodo)
  }

  render() {
    const todoListProps = {
      todos: todos.visibleOnes(),
      todoFactory: this.todoFactory
    }

    return(
      <div>
        <AddTodo onAddTodo={actions.addTodo} />
        <TodoList
          {...todoListProps} >
        </TodoList>
        <Footer>
          <Link
            {...this._linkProps("SHOW_ALL")} >
            All
          </Link>
          {", "}
          <Link
            {...this._linkProps("SHOW_ACTIVE")} >
            Active
          </Link>
          {", "}
          <Link
            {...this._linkProps("SHOW_COMPLETED")} >
            Completed
          </Link>
        </Footer>
      </div>
    )
  }

  _linkProps(filter) {
    return {
      shouldActive: filter === store.visibilityFilter,
      onLinkClick: () => actions.setVisibilityFilter(filter)
    }
  }
}
