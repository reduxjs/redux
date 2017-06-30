import * as React from 'react';
import { connect } from 'react-redux';
import { addTodo } from '../actions/todos';
import { Dispatch } from '../types';

export interface IProps {
  dispatch: Dispatch;
}

export interface IState {
  value: string;
}

class AddTodo extends React.Component<IProps, IState> {
  public state = {
    value: ''
  };

  public handleChange(event: React.FormEvent<any> & { target: HTMLInputElement }) {
    this.setState({ value: event.target.value });
  }

  public handleSubmit(event: React.FormEvent<any>) {
    event.preventDefault();
    if (!this.state.value.trim()) {
      return;
    }
    this.props.dispatch(addTodo(this.state.value));
    this.setState({ value: '' });
  }

  public render() {
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

export default connect()<{}>(AddTodo);
