import React, { PropTypes } from 'react'

const AddTodo = ({ onAddTodo }) => {
  let input

  return (
    <div>
      <form onSubmit={e => {
        e.preventDefault()
        const value = input.value.trim()
        if (!value) {
          return
        }
        input.value = ''
        onAddTodo(value)
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

AddTodo.propTypes = {
  onAddTodo: PropTypes.func.isRequired
}

export default AddTodo
