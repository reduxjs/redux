import React from 'react';
import Header from './Header';
import Body from './Body';
import { root, Container } from 'redux';
import { todoStore } from './stores/index';
import { addTodo } from './actions/index';

@root
export default class TodoApp {
  render() {
    return (
      <Container stores={todoStore} actions={{ addTodo }}>
        {props =>
          <div>
            <Header addTodo={props.addTodo} />
            <Body todos={props.todos} />
          </div>
        }
      </Container>
    );
  }
}
