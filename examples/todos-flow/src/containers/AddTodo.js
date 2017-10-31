// @flow

import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addTodo } from '../actions/todos';

import type { Dispatch } from '../types';
import type { Connector } from 'react-redux';

export type Props = {
  dispatch: Dispatch
};

export type State = {
  value: string
};

class AddTodo extends Component<Props, State> {
  input: HTMLInputElement;
  state = {
    value: ''
  };
  handleChange = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
    this.setState({ value: event.currentTarget.value });
  };
  handleSubmit = (event: Event) => {
    event.preventDefault();
    if (!this.state.value.trim()) {
      return;
    }
    this.props.dispatch(addTodo(this.state.value));
    this.setState({ value: '' });
  };
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

const connector: Connector<{}, Props> = connect();

export default connector(AddTodo);
