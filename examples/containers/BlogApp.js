import React from 'react';
import { RouteHandler } from 'react-router';
import { bindActions, Connector } from 'redux';
import PostList from '../components/PostList';
import * as BlogActions from '../actions/BlogActions';

export default class BlogApp {

  render() {
    return (
      <Connector select={state => ({ blog: state.blog })}>
        {this.renderChild.bind(this)}
      </Connector>
    );
  }

  renderChild({ blog, dispatcher }) {
    const actions = bindActions(BlogActions, dispatcher);
    return (
      <div>
        <PostList
          posts={blog.posts}
          {...this.props} /* We need to pass `props` (mostly because of
                            the route parameters) */
          {...actions} /* Since actions are available only at this point
                          we have to pass them down and let the dumb
                          component fetch the data */
        />
        <RouteHandler {...this.props} />
      </div>
    );
  }
}
