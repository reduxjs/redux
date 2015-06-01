import React, { Component } from 'react';
import Counter from './Counter';
import flux from 'redux/flux';
import dispatcher from './dispatcher';

@flux(dispatcher)
export default class App extends Component {
  render() {
    return (
      <Counter />
    );
  }
}
