import React from 'react';
import Header from './Header';
import Body from './Body';
import { provides } from 'redux';
import dispatcher from './dispatcher';

@provides(dispatcher)
export default class App {
  render() {
    return (
      <div>
        <Header />
        <Body />
      </div>
    );
  }
}
