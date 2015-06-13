import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'redux/react';
import PostDetail from '../components/PostDetail';
import * as BlogActions from '../actions/BlogActions';

@connect(state => ({
  blog: state.blog
}))
export default class BlogDetailApp {

  render() {
    const { dispatch } = this.props;
    const actions = bindActionCreators(BlogActions, dispatch);
    return <PostDetail actions={actions} {...this.props} />;
  }
}
