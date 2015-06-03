import React, { Component } from 'react';
import { root, Container } from 'redux';
import { increment, decrement } from './actions/CounterActions';
import * as stores from './stores/index';
import Counter from './Counter';

@root(stores)
export default class CounterApp extends Component {
  render() {
    return (
      <Container stores={[stores.counterStore]}
                 actions={{ increment, decrement }}>
        {props => <Counter {...props} />}
      </Container>
    );
  }
}
