import React from 'react';
import Header from './Header';
import Body from './Body';
import { root } from 'redux';

@root
export default class TodoApp {
  render() {
    return (
      <div>
        <Header />
        <Body />
      </div>
    );
  }
}
