import React from 'react';
import { bindActions, Connector } from 'redux';
import PostDetail from '../components/PostList';
import * as BlogActions from '../actions/BlogActions';

export default class PostDetailApp {

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
      <PostDetail post={blog.post} {...this.props} {...actions} />
    );
  }
}
