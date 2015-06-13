import React from 'react';
import { Link, RouteHandler } from 'react-router';

export default class PostList {

  componentWillMount() {
    // FIXME: not sure this is the right place
    this.props.fetchAllPosts();
  }

  render() {
    const subset = this.props.posts.slice(0, 20);
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
