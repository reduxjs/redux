import React from 'react';
import Header from './Header';
import Body from './Body';
import { Root, Container } from 'redux';
import { todoStore } from './stores/index';
import { addTodo } from './actions/index';

export default class TodoApp {
  render() {
    return (
      <Root>
        {() =>
          <Container stores={todoStore} actions={{ addTodo }}>
            {props =>
              <div>
                <Header addTodo={props.addTodo} />
                <Body todos={props.todos} />
              </div>
            }
          </Container>
        }
      </Root>
    );
  }
}
