import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'
import TodoTextInput from '../components/TodoTextInput'

let Header = ({ dispatch }) => (
  <header className="header">
    <h1>todos</h1>
    <TodoTextInput newTodo
                   onSave={(value) => dispatch(addTodo(value))}
                   placeholder="What needs to be done?" />
  </header>
)

Header = connect()(Header)

export default Header
