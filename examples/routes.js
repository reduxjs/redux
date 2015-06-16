import React from 'react';
import { Route } from 'react-router';
import AppContainer from './containers/App';
import CounterContainer from './containers/CounterApp';
import TodoContainer from './containers/TodoApp';
import BlogContainer from './containers/BlogApp';
import BlogDetailContainer from './containers/BlogDetailApp';

export default (
  <Route name="app" path="/" handler={AppContainer}>
    <Route name="counter" path="counter" handler={CounterContainer} />
    <Route name="todo" path="todo" handler={TodoContainer} />
    <Route name="blog" path="blog" handler={BlogContainer}>
      <Route name="post" path=":postId" handler={BlogDetailContainer} />
    </Route>
  </Route>
);
