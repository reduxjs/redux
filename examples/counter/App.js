import React, { Component } from 'react';
import { Root, Container } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import counterStore from './stores/counterStore';
import Counter from './Counter';

export default class CounterApp extends Component {
  render() {
    return (
      <Root>
        {() =>
          <Container stores={counterStore} actions={{ increment, decrement }}>
            {props => <Counter {...props} />}
          </Container>
        }
      </Root>
    );
  }
}
