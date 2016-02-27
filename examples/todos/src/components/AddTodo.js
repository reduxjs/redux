import React, { Component } from 'react'
import autobind from 'autobind-decorator'

@autobind
export default class AddTodo extends Component {
  render() {
    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <input ref={node => {
            this._input = node
          }} />
          <button type="submit">
            Add Todo
          </button>
        </form>
      </div>
    )
  }
  
  _onSubmit(e) {
    e.preventDefault()
    const value = this._input.value.trim()
    if (!value) {
      return
    }
    this._input.value = ''
    this.props.onAddTodo(value)
  }
}

AddTodo.propTypes = {
  onAddTodo: React.PropTypes.func.isRequired
}
