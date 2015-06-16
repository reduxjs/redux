import React from 'react';
import { Link, RouteHandler } from 'react-router';
import { fetch } from './decorators';

@fetch(actions => actions.fetchAllPosts())
export default class PostList {

  render() {
    const { blog } = this.props;
    const subset = blog.posts.slice(0, 20);
    return (
      <div>
        <ul>
          {subset.map(post =>
            <li key={post.id}>
              <Link to="post" params={{ postId: post.id }}>
                {post.title}
              </Link>
            </li>
          )}
        </ul>
        {/* this will render the selected post detail */}
        <RouteHandler {...this.props} />
      </div>
    );
  }
}
