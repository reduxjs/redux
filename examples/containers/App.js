import React from 'react';
import { Link, RouteHandler } from 'react-router';

export default class App {
  render() {
    return (
      <div>
        <h1>Redux</h1>
        <p>The evolution of Flux!</p>
        <ul>
          <li><Link to="app">Home</Link></li>
          <li><Link to="counter">Counter</Link></li>
          <li><Link to="todo">Todo</Link></li>
          <li><Link to="blog">Blog</Link></li>
        </ul>
        <RouteHandler {...this.props} />
      </div>
    );
  }
}
