import React from 'react';
import Header from './Header';
import Body from './Body';
import flux from 'redux/flux';
import dispatcher from './dispatcher';

@flux(dispatcher)
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
