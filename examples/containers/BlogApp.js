import React from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'redux/react';
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

  renderChild({ blog, dispatch }) {
    const actions = bindActionCreators(BlogActions, dispatch);
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
      </div>
    );
  }
}
