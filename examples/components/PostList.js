import React from 'react';
import { Link, RouteHandler } from 'react-router';

export default class PostList {

  componentWillMount() {
    this.props.fetchAllPosts();
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.posts.map(post =>
            <li key={post.id}>
              <Link to="post" params={{ postId: post.id }}>
                {post.title}
              </Link>
            </li>
          )}
        </ul>
        <RouteHandler {...this.props} />
      </div>
    );
  }
}
