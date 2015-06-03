import React, { Component } from 'react';
import { Root, Container } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import counterStore from './stores/counterStore';
import Counter from './Counter';

@Root
export default class App extends Component {
  render() {
    return (
      <Container stores={counterStore}
                 actions={{ increment, decrement }}>
        {props => <Counter {...props} />}
      </Container>
    );
  }
}
