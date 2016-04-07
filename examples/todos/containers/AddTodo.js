import React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'

let AddTodo = ({ dispatch, nextId }) => {
  let input

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        if (!input.value.trim()) {
          return
        }
        dispatch(addTodo(input.value, nextId))
        input.value = ''
      }}>
        <input ref={node => {
          input = node
        }} />
        <button type="submit">
          Add Todo
        </button>
      </form>
    </div>
  )
}
const mapStateToProps = (state) => {
  const lastLargestId = state.todos.map((todo) => todo.id).sort().reverse()[0]
  return {
    nextId: (state.todos.length > 0 ? lastLargestId + 1 : 0)
  }
}

AddTodo = connect(mapStateToProps)(AddTodo)

export default AddTodo
