// @flow
import React from 'react'

type props = {
  onClick: Function,
  completed: boolean,
  text: string,
  createdTime: string
}

const Todo = ({ onClick, completed, text, createdTime }: props) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none'
    }}
  >
    {text} - {createdTime}
  </li>
)

export default Todo
