// @flow

import * as React from 'react'
import { connect } from 'react-redux'
import { addTodo } from '../actions'
import type {Dispatch} from 'redux'

type Props = {
  dispatch: Dispatch
}

type State = {
  value: string
}

class AddTodo extends React.Component<Props, State> {
  state = {
    value: ''
  };

  handleChange = (e) => {
    this.setState({value: e.target.value});
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.state.value.trim()) {
      return;
    }
    this.props.dispatch(addTodo(this.state.value));
    this.setState({value: ''});
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input value={this.state.value} onChange={this.handleChange} />
          <button type="submit">
            Add Todo
          </button>
        </form>
      </div>
    );
  }
}

export default connect()(AddTodo)
