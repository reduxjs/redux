import React, { Component } from 'react';
import Counter from './Counter';
import { provides } from 'redux';
import dispatcher from './dispatcher';

@provides(dispatcher)
export default class App extends Component {
  render() {
    return (
      <Counter />
    );
  }
}
