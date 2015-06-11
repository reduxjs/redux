import React from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'redux/react';
import PostDetail from '../components/PostDetail';
import * as BlogActions from '../actions/BlogActions';

export default class BlogDetailApp {

  render() {
    return (
      <Connector select={state => ({ blog: state.blog })}>
        {this.renderChild.bind(this)}
      </Connector>
    );
  }

  renderChild({ blog, dispatch }) {
    const actions = bindActionCreators(BlogActions, dispatch);
    return (
      <PostDetail post={blog.post} {...this.props} {...actions} />
    );
  }
}
