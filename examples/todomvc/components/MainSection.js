import React, { Component, PropTypes } from 'react';
import TodoItem from './TodoItem';
import Footer from './Footer';

export default class MainSection extends Component {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.state = { showing: 'all' };
  }

  handleClearMarked() {
    const atleastOneMarked = this.props.todos.some(todo => todo.marked);
    if (atleastOneMarked) {
      this.props.actions.clearMarked();
    }
  }

  handleShow(e, show) {
    this.setState({ showing: show });
  }

  render() {

    let unmarkedCount = this.props.todos.reduce((acc, todo) => todo.marked ? acc : acc + 1, 0);
    let markedCount = this.props.todos.length - unmarkedCount;

    let toggleAll = null;
    if (this.props.todos.length > 0) {
      toggleAll = (
        <input className='toggle-all'
               type='checkbox'
               checked={unmarkedCount === 0}
               onChange={::this.props.actions.markAll} />
      );
    }

    let todoList = null;
    if (this.state.showing === 'all') {
      todoList = this.props.todos;
    } else if (this.state.showing === 'unmarked') {
      todoList = this.props.todos.filter(todo => !todo.marked);
    } else if (this.state.showing === 'marked') {
      todoList = this.props.todos.filter(todo => todo.marked);
    }

    let footer = null;
    if (markedCount || unmarkedCount) {
      footer = (
        <Footer markedCount={markedCount}
                unmarkedCount={unmarkedCount}
                showing={this.state.showing}
                onClearMarked={::this.handleClearMarked}
                onShow={(e, show) => this.handleShow(e, show)} />
      );
    }

    return (
      <section className='main'>
        {toggleAll}
        <ul className='todo-list'>
          {todoList.map(todo =>
            <TodoItem key={todo.id} todo={todo} {...this.props.actions} />
          )}
        </ul>
        {footer}
      </section>
    );
  }
}
