import React from 'react';
import { fetchOnUpdate } from './decorators';

@fetchOnUpdate('postId', (param, actions) => actions.fetchPost(param))
export default class PostDetail {

  render() {
    const { post } = this.props.blog;
    return (
      <div>
        <h1>{post.title}</h1>
        <code>{post.body}></code>
      </div>
    );
  }
}
