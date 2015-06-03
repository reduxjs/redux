import React, { Component } from 'react';
import { root, Container } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import counterStore from './stores/counterStore';
import Counter from './Counter';

@root
export default class CounterApp extends Component {
  render() {
    return (
      <Container stores={counterStore} actions={{ increment, decrement }}>
        {props => <Counter {...props} />}
      </Container>
    );
  }
}
