import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'redux/react';
import PostList from '../components/PostList';
import * as BlogActions from '../actions/BlogActions';

@connect(state => ({
  blog: state.blog
}))
export default class BlogApp {

  render() {
    const { dispatch } = this.props;
    const actions = bindActionCreators(BlogActions, dispatch);
    return <PostList actions={actions} {...this.props} />;
  }
}
