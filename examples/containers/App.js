import React from 'react';
import { Link, RouteHandler } from 'react-router';
import CounterApp from './CounterApp';
import TodoApp from './TodoApp';
import { createRedux } from 'redux';
import { Provider } from 'redux/react';
import * as stores from '../stores';

const redux = createRedux(stores);

export default class App {
  render() {
    return (
      <Provider redux={redux}>
        {() =>
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
        }
      </Provider>
    );
  }
}
