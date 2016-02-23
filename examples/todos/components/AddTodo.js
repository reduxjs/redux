import React, { Component } from 'react'
import autobind from 'autobind-decorator'

@autobind
export default class AddTodo extends Component {
  render() {
    return (
      <div>
        <form onSubmit={this._onSubmit}>
          <input ref={node => {
            this.input = node
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
    if (!this.input.value.trim()) {
      return
    }
    this.props.onAddTodo(this.input.value)
    this.input.value = ''
  }
}

AddTodo.propTypes = {
  onAddTodo: React.PropTypes.func.isRequired
}
