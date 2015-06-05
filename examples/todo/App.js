import React from 'react';
import Header from './Header';
import Body from './Body';
import { dispatch } from 'redux';
import * as stores from './stores/index';

@dispatch(stores)
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
